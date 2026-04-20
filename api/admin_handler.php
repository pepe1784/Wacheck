<?php
// ============================================================
// admin_handler.php - API Panel de Administración WACHECK
// Acceso exclusivo para administradores verificados por .env
// ============================================================

error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

require_once __DIR__ . '/EnvLoader.php';
require_once __DIR__ . '/Security.php';

try {
    EnvLoader::load(__DIR__ . '/.env');
    Security::init();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server configuration error']);
    exit();
}

// CORS restringido al dominio propio
$allowedOrigins = explode(',', EnvLoader::get('CORS_ALLOWED_ORIGINS', 'http://localhost'));
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Admin-Token, X-Game-Client');
}

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Acción solicitada (se usa para políticas de rate-limit diferenciadas)
$action = Security::sanitizeInput($_GET['action'] ?? '', 'string');

// Rate limiting: público relajado para endpoints del juego, estricto para admin
$clientIP = Security::getClientIP();
$publicReadActions = ['list_defenders', 'list_contaminants', 'get_game_config'];
if (in_array($action, $publicReadActions, true)) {
    $isProduction = strtolower(EnvLoader::get('APP_ENV', 'production')) === 'production';
    $gameClientHeader = $_SERVER['HTTP_X_GAME_CLIENT'] ?? '';
    if ($isProduction && $gameClientHeader !== 'wacheck-web') {
        http_response_code(403);
        echo json_encode(['error' => 'Forbidden']);
        exit();
    }

    // Endpoints usados continuamente por game.php/game-page.html
    if (!Security::checkRateLimit($clientIP . ':public', 1200, 3600)) {
        http_response_code(429);
        echo json_encode(['error' => 'Too many requests']);
        exit();
    }
} else {
    if (!Security::checkRateLimit($clientIP . ':admin', 20, 3600)) {
        http_response_code(429);
        echo json_encode(['error' => 'Too many requests']);
        exit();
    }
}

// === AUTENTICACIÓN DE ADMIN ===
function verifyAdminToken($token) {
    if (empty($token)) return false;
    $adminToken = EnvLoader::get('ADMIN_API_TOKEN');
    if (empty($adminToken)) return false;
    return hash_equals($adminToken, $token);
}

function requireAdmin() {
    $headers = getallheaders();
    $token = $headers['X-Admin-Token'] ?? ($_GET['admin_token'] ?? '');
    
    if (!verifyAdminToken($token)) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized - Admin access required']);
        exit();
    }
}

// === CONEXIÓN DB ===
function getDB() {
    static $pdo = null;
    if ($pdo !== null) return $pdo;

    $host = EnvLoader::get('DB_HOST');
    $dbname = EnvLoader::get('DB_NAME');
    $user = EnvLoader::get('DB_USER');
    $pass = EnvLoader::get('DB_PASS');

    $dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci",
    ];

    try {
        $pdo = new PDO($dsn, $user, $pass, $options);
    } catch (PDOException $e) {
        error_log("DB connection error: " . $e->getMessage());
        http_response_code(503);
        echo json_encode(['error' => 'Database unavailable']);
        exit();
    }
    return $pdo;
}

function normalizeDefenderKeyFromRow(array $row): string {
    $rawKey = trim((string)($row['key'] ?? ''));
    if ($rawKey !== '') return $rawKey;

    $name = trim((string)($row['name'] ?? ''));
    $nameMap = [
        'Filtro' => 'filter',
        'Planta' => 'plant',
        'Reciclador' => 'recycler',
        'Purificador' => 'cleaner',
        'Chorro' => 'stream',
        'Burbuja' => 'bubble',
        'Viento' => 'wind',
        'Tierra' => 'earth',
    ];
    if (isset($nameMap[$name])) return $nameMap[$name];

    $clean = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $name);
    if ($clean === false) $clean = $name;
    $clean = strtolower(trim($clean));
    $clean = preg_replace('/[^a-z0-9]+/', '-', $clean);
    $clean = trim((string)$clean, '-');

    if ($clean !== '') return $clean;

    return 'defender-' . (int)($row['id'] ?? 0);
}

// === ROUTER ===
switch ($action) {

    // ---- LOGIN ADMIN ----
    case 'login':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['error' => 'Method not allowed']); exit(); }
        $body = json_decode(file_get_contents('php://input'), true);
        $email    = Security::sanitizeInput($body['email'] ?? '', 'email');
        $password = $body['password'] ?? '';

        if (empty($email) || empty($password)) {
            http_response_code(400);
            echo json_encode(['error' => 'Email y contraseña requeridos']);
            exit();
        }

        $adminEmail = EnvLoader::get('ADMIN_EMAIL');
        $adminHash  = EnvLoader::get('ADMIN_PASSWORD_HASH');

        if (empty($adminEmail) || empty($adminHash)) {
            http_response_code(503);
            echo json_encode(['error' => 'Admin not configured']);
            exit();
        }

        if (!hash_equals(strtolower($adminEmail), strtolower($email)) || !password_verify($password, $adminHash)) {
            // Log intento fallido
            error_log("ADMIN LOGIN FAILED - IP: {$clientIP} - Email: {$email}");
            http_response_code(401);
            echo json_encode(['error' => 'Credenciales incorrectas']);
            exit();
        }

        // Generar token de sesión admin
        $token = bin2hex(random_bytes(32));
        $expiry = date('Y-m-d H:i:s', time() + 3600); // 1 hora

        $pdo = getDB();
        $stmt = $pdo->prepare("INSERT INTO admin_sessions (token, expires_at, ip_address) VALUES (:token, :expiry, :ip) ON DUPLICATE KEY UPDATE token=:token2, expires_at=:expiry2");
        $stmt->execute([
            ':token'   => $token,
            ':expiry'  => $expiry,
            ':ip'      => $clientIP,
            ':token2'  => $token,
            ':expiry2' => $expiry
        ]);

        error_log("ADMIN LOGIN SUCCESS - IP: {$clientIP}");
        echo json_encode(['success' => true, 'token' => $token, 'expires_at' => $expiry]);
        break;

    // ---- STATS DASHBOARD ----
    case 'stats':
        requireAdmin();
        $pdo = getDB();

        $stats = [];

        // Usuarios totales
        $stmt = $pdo->query("SELECT COUNT(*) as total, SUM(email_verified) as verified FROM users");
        $row = $stmt->fetch();
        $stats['users'] = ['total' => (int)$row['total'], 'verified' => (int)$row['verified']];

        // Registros hoy
        $stmt = $pdo->query("SELECT COUNT(*) as today FROM users WHERE DATE(created_at) = CURDATE()");
        $stats['users']['today'] = (int)$stmt->fetchColumn();

        // Top usuarios por monedas
        $stmt = $pdo->query("SELECT username, email, special_coins, coins, stars, runes, last_login FROM users ORDER BY special_coins DESC LIMIT 10");
        $stats['top_users'] = $stmt->fetchAll();

        // Defensores y contaminantes configurados
        $stmt = $pdo->query("SELECT COUNT(*) FROM game_defenders");
        $stats['defenders_count'] = (int)$stmt->fetchColumn();

        $stmt = $pdo->query("SELECT COUNT(*) FROM game_contaminants");
        $stats['contaminants_count'] = (int)$stmt->fetchColumn();

        echo json_encode(['success' => true, 'data' => $stats]);
        break;

    // ---- LISTAR USUARIOS ----
    case 'list_users':
        requireAdmin();
        $pdo = getDB();
        $page  = max(1, (int)($_GET['page'] ?? 1));
        $limit = min(50, max(10, (int)($_GET['limit'] ?? 20)));
        $offset = ($page - 1) * $limit;
        $search = Security::sanitizeInput($_GET['search'] ?? '', 'string');

        if (!empty($search)) {
            $stmt = $pdo->prepare("SELECT id, username, email, email_verified, special_coins, coins, stars, runes, last_login, created_at FROM users WHERE username LIKE :s OR email LIKE :s2 ORDER BY created_at DESC LIMIT :lim OFFSET :off");
            $stmt->bindValue(':s',  "%$search%", PDO::PARAM_STR);
            $stmt->bindValue(':s2', "%$search%", PDO::PARAM_STR);
        } else {
            $stmt = $pdo->prepare("SELECT id, username, email, email_verified, special_coins, coins, stars, runes, last_login, created_at FROM users ORDER BY created_at DESC LIMIT :lim OFFSET :off");
        }
        $stmt->bindValue(':lim', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':off', $offset, PDO::PARAM_INT);
        $stmt->execute();
        $users = $stmt->fetchAll();

        $countStmt = $pdo->query("SELECT COUNT(*) FROM users");
        $total = (int)$countStmt->fetchColumn();

        echo json_encode(['success' => true, 'users' => $users, 'total' => $total, 'page' => $page, 'pages' => ceil($total / $limit)]);
        break;

    // ---- EDITAR USUARIO ----
    case 'edit_user':
        requireAdmin();
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['error' => 'Method not allowed']); exit(); }
        $body = json_decode(file_get_contents('php://input'), true);
        $userId = (int)($body['id'] ?? 0);
        if ($userId <= 0) { http_response_code(400); echo json_encode(['error' => 'ID inválido']); exit(); }

        $allowed = ['special_coins', 'coins', 'stars', 'runes', 'email_verified'];
        $updates = [];
        $params = [':id' => $userId];

        foreach ($allowed as $field) {
            if (isset($body[$field])) {
                $updates[] = "$field = :$field";
                $params[":$field"] = $field === 'email_verified' ? (int)(bool)$body[$field] : max(0, (int)$body[$field]);
            }
        }

        if (empty($updates)) { http_response_code(400); echo json_encode(['error' => 'Sin campos a actualizar']); exit(); }

        $pdo = getDB();
        $stmt = $pdo->prepare("UPDATE users SET " . implode(', ', $updates) . " WHERE id = :id");
        $stmt->execute($params);

        error_log("ADMIN EDIT USER id={$userId} - IP: {$clientIP}");
        echo json_encode(['success' => true, 'message' => 'Usuario actualizado']);
        break;

    // ---- ELIMINAR USUARIO ----
    case 'delete_user':
        requireAdmin();
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['error' => 'Method not allowed']); exit(); }
        $body = json_decode(file_get_contents('php://input'), true);
        $userId = (int)($body['id'] ?? 0);
        if ($userId <= 0) { http_response_code(400); echo json_encode(['error' => 'ID inválido']); exit(); }

        $pdo = getDB();
        $stmt = $pdo->prepare("DELETE FROM users WHERE id = :id");
        $stmt->execute([':id' => $userId]);

        error_log("ADMIN DELETE USER id={$userId} - IP: {$clientIP}");
        echo json_encode(['success' => true, 'message' => 'Usuario eliminado']);
        break;

    // ---- LISTAR DEFENSORES (CONFIGURACIÓN) ---- (público: el juego lo necesita)
    case 'list_defenders':
        // No requireAdmin: endpoint de lectura pública para el juego
        $pdo = getDB();
        $stmt = $pdo->query("SELECT * FROM game_defenders ORDER BY cost ASC");
        $rows = $stmt->fetchAll();

        foreach ($rows as &$row) {
            $row['key'] = normalizeDefenderKeyFromRow($row);
            if (empty($row['image']) && !empty($row['icon_url'])) {
                $row['image'] = $row['icon_url'];
            }
        }
        unset($row);

        echo json_encode(['success' => true, 'defenders' => $rows]);
        break;

    // ---- CREAR / ACTUALIZAR DEFENSOR ----
    case 'save_defender':
        requireAdmin();
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['error' => 'Method not allowed']); exit(); }
        $body = json_decode(file_get_contents('php://input'), true);

        $id           = isset($body['id']) ? (int)$body['id'] : null;
        $key          = Security::sanitizeInput($body['key'] ?? '', 'string');
        $name         = Security::sanitizeInput($body['name'] ?? '', 'string');
        $damage       = max(0, (int)($body['damage'] ?? 0));
        $cost         = max(1, (int)($body['cost'] ?? 50));
        $health       = max(1, (int)($body['health'] ?? 100));
        $range        = max(1, min(10, (int)($body['range'] ?? 4)));
        $shootInterval = max(100, (int)($body['shoot_interval'] ?? 1000));
        $projectile   = Security::sanitizeInput($body['projectile'] ?? 'water', 'string');
        $iconUrl      = Security::sanitizeInput($body['icon_url'] ?? '', 'string');
        $description  = Security::sanitizeInput($body['description'] ?? '', 'string');
        $isUnlockable = (int)(bool)($body['is_unlockable'] ?? false);
        $unlockCost   = max(0, (int)($body['unlock_cost'] ?? 0));
        $extraData    = json_encode($body['extra_data'] ?? []);

        if (empty($key) || empty($name)) {
            http_response_code(400);
            echo json_encode(['error' => 'Key y nombre son requeridos']);
            exit();
        }

        $pdo = getDB();
        if ($id) {
            $stmt = $pdo->prepare("UPDATE game_defenders SET `key`=:key, name=:name, damage=:damage, cost=:cost, health=:health, `range`=:range, shoot_interval=:si, projectile=:proj, icon_url=:icon, description=:desc, is_unlockable=:iu, unlock_cost=:uc, extra_data=:ed WHERE id=:id");
            $stmt->execute([':key'=>$key,':name'=>$name,':damage'=>$damage,':cost'=>$cost,':health'=>$health,':range'=>$range,':si'=>$shootInterval,':proj'=>$projectile,':icon'=>$iconUrl,':desc'=>$description,':iu'=>$isUnlockable,':uc'=>$unlockCost,':ed'=>$extraData,':id'=>$id]);
            echo json_encode(['success' => true, 'message' => 'Defensor actualizado']);
        } else {
            $stmt = $pdo->prepare("INSERT INTO game_defenders (`key`, name, damage, cost, health, `range`, shoot_interval, projectile, icon_url, description, is_unlockable, unlock_cost, extra_data) VALUES (:key,:name,:damage,:cost,:health,:range,:si,:proj,:icon,:desc,:iu,:uc,:ed)");
            $stmt->execute([':key'=>$key,':name'=>$name,':damage'=>$damage,':cost'=>$cost,':health'=>$health,':range'=>$range,':si'=>$shootInterval,':proj'=>$projectile,':icon'=>$iconUrl,':desc'=>$description,':iu'=>$isUnlockable,':uc'=>$unlockCost,':ed'=>$extraData]);
            echo json_encode(['success' => true, 'id' => (int)$pdo->lastInsertId(), 'message' => 'Defensor creado']);
        }
        break;

    // ---- ELIMINAR DEFENSOR ----
    case 'delete_defender':
        requireAdmin();
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['error' => 'Method not allowed']); exit(); }
        $body = json_decode(file_get_contents('php://input'), true);
        $id = (int)($body['id'] ?? 0);
        if ($id <= 0) { http_response_code(400); echo json_encode(['error' => 'ID inválido']); exit(); }

        $pdo = getDB();
        $pdo->prepare("DELETE FROM game_defenders WHERE id = :id")->execute([':id' => $id]);
        echo json_encode(['success' => true, 'message' => 'Defensor eliminado']);
        break;

    // ---- LISTAR CONTAMINANTES ---- (público: el juego lo necesita)
    case 'list_contaminants':
        // No requireAdmin: endpoint de lectura pública para el juego
        $pdo = getDB();
        $stmt = $pdo->query("SELECT * FROM game_contaminants ORDER BY health ASC");
        echo json_encode(['success' => true, 'contaminants' => $stmt->fetchAll()]);
        break;

    // ---- CREAR / ACTUALIZAR CONTAMINANTE ----
    case 'save_contaminant':
        requireAdmin();
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['error' => 'Method not allowed']); exit(); }
        $body = json_decode(file_get_contents('php://input'), true);

        $id          = isset($body['id']) ? (int)$body['id'] : null;
        $name        = Security::sanitizeInput($body['name'] ?? '', 'string');
        $health      = max(1, (int)($body['health'] ?? 100));
        $speed       = max(0.1, min(5.0, (float)($body['speed'] ?? 1.0)));
        $coins       = max(0, (int)($body['coins'] ?? 10));
        $iconUrl     = Security::sanitizeInput($body['icon_url'] ?? '', 'string');
        $description = Security::sanitizeInput($body['description'] ?? '', 'string');
        $isBoss      = (int)(bool)($body['is_boss'] ?? false);
        $extraData   = json_encode($body['extra_data'] ?? []);

        if (empty($name)) { http_response_code(400); echo json_encode(['error' => 'Nombre requerido']); exit(); }

        $pdo = getDB();
        if ($id) {
            $stmt = $pdo->prepare("UPDATE game_contaminants SET name=:name, health=:health, speed=:speed, coins=:coins, icon_url=:icon, description=:desc, is_boss=:boss, extra_data=:ed WHERE id=:id");
            $stmt->execute([':name'=>$name,':health'=>$health,':speed'=>$speed,':coins'=>$coins,':icon'=>$iconUrl,':desc'=>$description,':boss'=>$isBoss,':ed'=>$extraData,':id'=>$id]);
            echo json_encode(['success' => true, 'message' => 'Contaminante actualizado']);
        } else {
            $stmt = $pdo->prepare("INSERT INTO game_contaminants (name, health, speed, coins, icon_url, description, is_boss, extra_data) VALUES (:name,:health,:speed,:coins,:icon,:desc,:boss,:ed)");
            $stmt->execute([':name'=>$name,':health'=>$health,':speed'=>$speed,':coins'=>$coins,':icon'=>$iconUrl,':desc'=>$description,':boss'=>$isBoss,':ed'=>$extraData]);
            echo json_encode(['success' => true, 'id' => (int)$pdo->lastInsertId(), 'message' => 'Contaminante creado']);
        }
        break;

    // ---- ELIMINAR CONTAMINANTE ----
    case 'delete_contaminant':
        requireAdmin();
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['error' => 'Method not allowed']); exit(); }
        $body = json_decode(file_get_contents('php://input'), true);
        $id = (int)($body['id'] ?? 0);
        if ($id <= 0) { http_response_code(400); echo json_encode(['error' => 'ID inválido']); exit(); }

        $pdo = getDB();
        $pdo->prepare("DELETE FROM game_contaminants WHERE id = :id")->execute([':id' => $id]);
        echo json_encode(['success' => true, 'message' => 'Contaminante eliminado']);
        break;

    // ---- CONFIGURACIÓN GLOBAL DEL JUEGO ----
    case 'get_game_config':
        // Endpoint público para que el frontend obtenga la config del juego
        $pdo = getDB();
        $stmt = $pdo->query("SELECT config_key, config_value FROM game_config");
        $config = [];
        while ($row = $stmt->fetch()) {
            $config[$row['config_key']] = $row['config_value'];
        }
        echo json_encode(['success' => true, 'config' => $config]);
        break;

    case 'save_game_config':
        requireAdmin();
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['error' => 'Method not allowed']); exit(); }
        $body = json_decode(file_get_contents('php://input'), true);

        $allowed_config_keys = [
            'max_waves', 'base_health', 'base_coins', 'coin_generation_rate',
            'wave_difficulty_multiplier', 'defenders_per_row', 'grid_rows',
            'maintenance_mode', 'game_version'
        ];

        $pdo = getDB();
        $saved = [];
        foreach ($body as $k => $v) {
            $k = Security::sanitizeInput($k, 'string');
            if (!in_array($k, $allowed_config_keys, true)) continue;
            $v = Security::sanitizeInput((string)$v, 'string');
            $stmt = $pdo->prepare("INSERT INTO game_config (config_key, config_value) VALUES (:k, :v) ON DUPLICATE KEY UPDATE config_value=:v2");
            $stmt->execute([':k' => $k, ':v' => $v, ':v2' => $v]);
            $saved[] = $k;
        }
        echo json_encode(['success' => true, 'saved' => $saved]);
        break;

    // ---- LOGS DE ACTIVIDAD ----
    case 'activity_logs':
        requireAdmin();
        $pdo = getDB();
        $page  = max(1, (int)($_GET['page'] ?? 1));
        $limit = min(100, max(20, (int)($_GET['limit'] ?? 50)));
        $offset = ($page - 1) * $limit;
        $stmt = $pdo->prepare("SELECT al.*, u.username FROM activity_log al LEFT JOIN users u ON al.user_id = u.id ORDER BY al.created_at DESC LIMIT :lim OFFSET :off");
        $stmt->bindValue(':lim', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':off', $offset, PDO::PARAM_INT);
        $stmt->execute();
        $logs = $stmt->fetchAll();
        $total = (int)$pdo->query("SELECT COUNT(*) FROM activity_log")->fetchColumn();
        echo json_encode(['success' => true, 'logs' => $logs, 'total' => $total]);
        break;

    default:
        http_response_code(404);
        echo json_encode(['error' => 'Action not found']);
        break;
}
