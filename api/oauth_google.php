<?php
// ============================================================
// api/oauth_google.php — Google OAuth 2.0 callback handler
// Flujo:
//   1. El cliente redirige a Google (implementado en js/auth.js)
//   2. Google redirige aquí con ?code=... y ?state=...
//   3. Este script intercambia el code por tokens
//   4. Obtiene el perfil del usuario de Google
//   5. Crea/actualiza el usuario en la DB y crea una sesión PHP
//   6. Redirige de vuelta a index.php con el usuario serializado
// ============================================================

declare(strict_types=1);

// --- Cargar configuración ---
require_once __DIR__ . '/EnvLoader.php';
EnvLoader::loadAuto(__DIR__);

$CLIENT_ID     = EnvLoader::get('GOOGLE_CLIENT_ID', '');
$CLIENT_SECRET = EnvLoader::get('GOOGLE_CLIENT_SECRET', '');
$REDIRECT_URI  = EnvLoader::get('GOOGLE_REDIRECT_URI', '');

// --- Funciones de seguridad ---
function safe_redirect(string $url): void {
    // Solo permitir redirecciones a rutas del mismo dominio
    $parsed = parse_url($url);
    if (!empty($parsed['host']) && $parsed['host'] !== $_SERVER['HTTP_HOST']) {
        http_response_code(400);
        die('Redirect bloqueado por seguridad');
    }
    header('Location: ' . $url);
    exit;
}

function json_error(string $msg, int $code = 400): void {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => $msg]);
    exit;
}

// ============================================================
// PASO A: Iniciar flujo OAuth — generar URL de Google
// Se llama cuando el frontend hace GET /api/oauth_google.php?action=redirect
// ============================================================
if (isset($_GET['action']) && $_GET['action'] === 'redirect') {
    if (empty($CLIENT_ID) || strpos($CLIENT_ID, 'TU_') === 0) {
        json_error('Google OAuth no está configurado aún. Agrega GOOGLE_CLIENT_ID en api/.env', 503);
    }

    // CSRF protection: state token guardado en sesión
    session_start();
    $state = bin2hex(random_bytes(16));
    $_SESSION['oauth_state'] = $state;

    $params = http_build_query([
        'client_id'             => $CLIENT_ID,
        'redirect_uri'          => rawurldecode($REDIRECT_URI),
        'response_type'         => 'code',
        'scope'                 => 'openid email profile',
        'state'                 => $state,
        'access_type'           => 'online',
        'prompt'                => 'select_account',
    ], '', '&', PHP_QUERY_RFC3986);

    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'url' => 'https://accounts.google.com/o/oauth2/v2/auth?' . $params
    ]);
    exit;
}

// ============================================================
// PASO B: Callback de Google — POST con ?code=... devuelto por Google
// ============================================================

session_start();

// Verificar que el callback tiene el code
$code  = $_GET['code']  ?? '';
$state = $_GET['state'] ?? '';
$error = $_GET['error'] ?? '';

if ($error) {
    // Usuario canceló el login o hubo error de Google
    $msg = htmlspecialchars($error, ENT_QUOTES, 'UTF-8');
    safe_redirect('../index.html?google_error=' . urlencode($msg));
}

if (empty($code)) {
    safe_redirect('../index.html?google_error=no_code');
}

// Verificar CSRF state
if (empty($state) || empty($_SESSION['oauth_state']) || !hash_equals($_SESSION['oauth_state'], $state)) {
    safe_redirect('../index.html?google_error=invalid_state');
}
unset($_SESSION['oauth_state']); // Consumir el state

// Credenciales configuradas?
if (empty($CLIENT_ID) || strpos($CLIENT_ID, 'TU_') === 0) {
    safe_redirect('../index.html?google_error=not_configured');
}

// --- Intercambiar code por access_token ---
$tokenResponse = oauth_token_exchange($code, $CLIENT_ID, $CLIENT_SECRET, $REDIRECT_URI);

if (!$tokenResponse || isset($tokenResponse['error'])) {
    $errMsg = $tokenResponse['error_description'] ?? $tokenResponse['error'] ?? 'token_exchange_failed';
    safe_redirect('../index.html?google_error=' . urlencode($errMsg));
}

$accessToken = $tokenResponse['access_token'] ?? '';
$idToken     = $tokenResponse['id_token']     ?? '';

if (empty($accessToken)) {
    safe_redirect('../index.html?google_error=no_access_token');
}

// --- Obtener perfil del usuario de Google ---
$profile = oauth_get_profile($accessToken);

if (!$profile || empty($profile['email'])) {
    safe_redirect('../index.html?google_error=no_profile');
}

$googleId = $profile['id']           ?? $profile['sub'] ?? '';
$email    = $profile['email']        ?? '';
$name     = $profile['name']         ?? $profile['given_name'] ?? explode('@', $email)[0];
$picture  = $profile['picture']      ?? '';

// Validar email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    safe_redirect('../index.html?google_error=invalid_email');
}

// --- Crear o recuperar usuario en la DB ---
require_once __DIR__ . '/google_user_helper.php';

try {
    $user = find_or_create_google_user($googleId, $email, $name, $picture);
    if (!$user) {
        safe_redirect('../index.html?google_error=db_error');
    }
} catch (Exception $e) {
    error_log('[OAuth] DB error: ' . $e->getMessage());
    safe_redirect('../index.html?google_error=db_exception');
}

// --- Crear sesión PHP ---
$_SESSION['wacheck_user_id'] = $user['id'];
$_SESSION['wacheck_user']    = $user;

// --- Redirigir al frontend con datos del usuario (serializado para el cliente) ---
// El cliente JS lee el parámetro y lo guarda en localStorage
$userData = json_encode([
    'id'                => $user['id'],
    'name'              => $user['name'],
    'email'             => $user['email'],
    'isGuest'           => false,
    'googleLogin'       => true,
    'googleAvatar'      => $user['googleAvatar'] ?? ($user['google_avatar'] ?? ''),
    'coins'             => $user['coins']        ?? 100,
    'specialCoins'      => $user['specialCoins'] ?? 0,
    'runes'             => $user['runes']         ?? 0,
    'stars'             => $user['stars']         ?? 0,
    'unlockedDefenders' => $user['unlockedDefenders'] ?? ["filter","plant","recycler","cleaner","stream","bubble","wind","earth"],
]);

$encoded = base64_encode($userData);

// Redirigir con los datos en fragment (# — no se envía al servidor)
safe_redirect('../index.html#google_auth=' . urlencode($encoded));

// ============================================================
// FUNCIONES AUXILIARES
// ============================================================

/**
 * Intercambia el authorization code por tokens.
 * Usa cURL si está disponible (InfinityFree bloquea allow_url_fopen).
 */
function oauth_token_exchange(string $code, string $clientId, string $secret, string $redirectUri): ?array {
    $postData = http_build_query([
        'code'          => $code,
        'client_id'     => $clientId,
        'client_secret' => $secret,
        'redirect_uri'  => rawurldecode($redirectUri),
        'grant_type'    => 'authorization_code',
    ], '', '&', PHP_QUERY_RFC3986);

    $url = 'https://oauth2.googleapis.com/token';

    // Preferir cURL (funciona en InfinityFree)
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $postData,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 10,
            CURLOPT_HTTPHEADER     => ['Content-Type: application/x-www-form-urlencoded'],
            CURLOPT_SSL_VERIFYPEER => true,
        ]);
        $result = curl_exec($ch);
        $err = curl_error($ch);
        curl_close($ch);
        if ($result === false) {
            error_log('[OAuth] cURL token error: ' . $err);
            return null;
        }
        return json_decode($result, true);
    }

    // Fallback: file_get_contents (si allow_url_fopen está habilitado)
    $ctx = stream_context_create([
        'http' => [
            'method'  => 'POST',
            'header'  => "Content-Type: application/x-www-form-urlencoded\r\nContent-Length: " . strlen($postData),
            'content' => $postData,
            'timeout' => 10,
        ],
        'ssl' => ['verify_peer' => true]
    ]);

    $result = @file_get_contents($url, false, $ctx);
    if ($result === false) return null;

    return json_decode($result, true);
}

/**
 * Obtiene el perfil del usuario usando el access_token.
 * Usa cURL si está disponible.
 */
function oauth_get_profile(string $accessToken): ?array {
    $url = 'https://www.googleapis.com/oauth2/v2/userinfo';

    // Preferir cURL
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 10,
            CURLOPT_HTTPHEADER     => ['Authorization: Bearer ' . $accessToken],
            CURLOPT_SSL_VERIFYPEER => true,
        ]);
        $result = curl_exec($ch);
        $err = curl_error($ch);
        curl_close($ch);
        if ($result === false) {
            error_log('[OAuth] cURL profile error: ' . $err);
            return null;
        }
        return json_decode($result, true);
    }

    // Fallback: file_get_contents
    $ctx = stream_context_create([
        'http' => [
            'method'  => 'GET',
            'header'  => 'Authorization: Bearer ' . $accessToken,
            'timeout' => 10,
        ],
        'ssl' => ['verify_peer' => true]
    ]);

    $result = @file_get_contents($url, false, $ctx);
    if ($result === false) return null;

    return json_decode($result, true);
}
