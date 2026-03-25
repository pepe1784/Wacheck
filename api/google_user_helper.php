<?php
// ============================================================
// google_user_helper.php
// Funciones de DB para el flujo OAuth de Google.
// NO contiene middleware HTTP — se puede incluir sin efectos
// secundarios de routing o rate limiting.
// ============================================================

declare(strict_types=1);

require_once __DIR__ . '/EnvLoader.php';

/**
 * Devuelve una conexión PDO usando las variables de .env.
 * Reutilizable gracias a la variable estática.
 */
function google_get_db(): PDO {
    static $pdo = null;

    if ($pdo !== null) return $pdo;

    $host   = EnvLoader::get('DB_HOST',   'localhost');
    $dbname = EnvLoader::get('DB_NAME',   '');
    $user   = EnvLoader::get('DB_USER',   '');
    $pass   = EnvLoader::get('DB_PASS',   '');

    $dsn = "mysql:host=$host;port=3306;dbname=$dbname;charset=utf8mb4";
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_EMULATE_PREPARES   => false,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_PERSISTENT         => false,
    ]);

    return $pdo;
}

/**
 * Asegura que la tabla users exista y tenga la columna google_id.
 * Se ejecuta solo una vez por request.
 */
function google_ensure_schema(): void {
    static $done = false;
    if ($done) return;
    $done = true;

    $db = google_get_db();

    // Crear tabla si no existe (subset mínimo compatible con user_handler_SECURE)
    $db->exec("CREATE TABLE IF NOT EXISTS users (
        id INT(11) NOT NULL AUTO_INCREMENT,
        username VARCHAR(50) NOT NULL,
        email VARCHAR(255) DEFAULT NULL,
        password VARCHAR(255) NOT NULL DEFAULT '',
        email_verified TINYINT(1) NOT NULL DEFAULT 0,
        special_coins INT(11) NOT NULL DEFAULT 0,
        coins INT(11) NOT NULL DEFAULT 100,
        stars INT(11) NOT NULL DEFAULT 0,
        runes INT(11) NOT NULL DEFAULT 0,
        unlocked_defenders TEXT DEFAULT NULL,
        calculator_completed TINYINT(1) NOT NULL DEFAULT 0,
        rewards_data TEXT DEFAULT NULL,
        achievements_data TEXT DEFAULT NULL,
        story_progress TEXT DEFAULT NULL,
        last_login TIMESTAMP NULL DEFAULT NULL,
        failed_login_attempts INT DEFAULT 0,
        account_locked_until TIMESTAMP NULL DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    // Agregar columna google_id si todavía no existe
    $cols = $db->query("SHOW COLUMNS FROM users LIKE 'google_id'")->fetchAll();
    if (empty($cols)) {
        $db->exec("ALTER TABLE users ADD COLUMN google_id VARCHAR(128) DEFAULT NULL AFTER email");
        $db->exec("ALTER TABLE users ADD INDEX idx_google_id (google_id)");
    }

    // Agregar columna google_avatar si no existe
    $cols2 = $db->query("SHOW COLUMNS FROM users LIKE 'google_avatar'")->fetchAll();
    if (empty($cols2)) {
        $db->exec("ALTER TABLE users ADD COLUMN google_avatar VARCHAR(512) DEFAULT NULL AFTER google_id");
    }
}

/**
 * Busca o crea un usuario a partir del perfil de Google.
 *
 * Estrategia:
 *   1. Buscar por google_id   → usuario ya registró con Google antes
 *   2. Buscar por email       → usuario existente; vinculamos su google_id
 *   3. Crear cuenta nueva     → primer login de este correo con Google
 *
 * @return array|null  Array con datos del usuario o null en caso de error
 */
function find_or_create_google_user(
    string $googleId,
    string $email,
    string $name,
    string $picture
): ?array {
    try {
        google_ensure_schema();
        $db = google_get_db();

        $defaultDefenders = json_encode([
            "filter","plant","recycler","cleaner",
            "stream","bubble","wind","earth"
        ]);

        // --- 1. Buscar por google_id ---
        $stmt = $db->prepare("SELECT * FROM users WHERE google_id = ? LIMIT 1");
        $stmt->execute([$googleId]);
        $user = $stmt->fetch();

        if ($user) {
            // Actualizar avatar y last_login
            $db->prepare("
                UPDATE users
                SET google_avatar = ?, last_login = CURRENT_TIMESTAMP
                WHERE id = ?
            ")->execute([$picture, $user['id']]);

            $user['google_avatar'] = $picture;
            return build_user_response($user);
        }

        // --- 2. Buscar por email ---
        $stmt = $db->prepare("SELECT * FROM users WHERE email = ? LIMIT 1");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if ($user) {
            // Vincular google_id a la cuenta existente
            $db->prepare("
                UPDATE users
                SET google_id = ?, google_avatar = ?,
                    email_verified = 1, last_login = CURRENT_TIMESTAMP
                WHERE id = ?
            ")->execute([$googleId, $picture, $user['id']]);

            $user['google_id']     = $googleId;
            $user['google_avatar'] = $picture;
            return build_user_response($user);
        }

        // --- 3. Crear cuenta nueva ---
        // Sanitizar nombre: solo letras, números, guiones, máx 50 chars
        $baseUsername = preg_replace('/[^a-zA-Z0-9_\-]/', '', str_replace(' ', '_', $name));
        $baseUsername = substr($baseUsername ?: 'user', 0, 40);

        // Garantizar unicidad de username
        $username = $baseUsername;
        $suffix   = 1;
        while (true) {
            $check = $db->prepare("SELECT id FROM users WHERE username = ? LIMIT 1");
            $check->execute([$username]);
            if (!$check->fetch()) break;
            $username = $baseUsername . $suffix;
            $suffix++;
        }

        // Contraseña aleatoria (el usuario nunca la usará; solo Google OAuth)
        $randomPass = password_hash(bin2hex(random_bytes(32)), PASSWORD_BCRYPT);

        $stmt = $db->prepare("
            INSERT INTO users
                (username, email, password, google_id, google_avatar,
                 email_verified, coins, unlocked_defenders, last_login)
            VALUES
                (?, ?, ?, ?, ?, 1, 100, ?, CURRENT_TIMESTAMP)
        ");
        $stmt->execute([
            $username, $email, $randomPass,
            $googleId, $picture,
            $defaultDefenders,
        ]);

        $newId = (int)$db->lastInsertId();

        $stmt = $db->prepare("SELECT * FROM users WHERE id = ? LIMIT 1");
        $stmt->execute([$newId]);
        $user = $stmt->fetch();

        return $user ? build_user_response($user) : null;

    } catch (Exception $e) {
        error_log('[google_user_helper] ' . $e->getMessage());
        return null;
    }
}

/**
 * Convierte una fila de la tabla users al formato que espera el frontend.
 */
function build_user_response(array $user): array {
    return [
        'id'                 => (int)$user['id'],
        'name'               => $user['username'],
        'email'              => $user['email'] ?? '',
        'isGuest'            => false,
        'googleLogin'        => true,
        'googleAvatar'       => $user['google_avatar'] ?? '',
        'coins'              => (int)($user['coins']         ?? 100),
        'specialCoins'       => (int)($user['special_coins'] ?? 0),
        'runes'              => (int)($user['runes']         ?? 0),
        'stars'              => (int)($user['stars']         ?? 0),
        'unlockedDefenders'  => json_decode($user['unlocked_defenders'] ?? '[]', true) ?: [
            "filter","plant","recycler","cleaner","stream","bubble","wind","earth"
        ],
        'calculatorCompleted'=> (bool)($user['calculator_completed'] ?? false),
        'rewardsData'        => json_decode($user['rewards_data']      ?? '{}', true) ?: (object)[],
        'achievementsData'   => json_decode($user['achievements_data'] ?? '{}', true) ?: (object)[],
        'storyProgress'      => json_decode($user['story_progress']    ?? '{}', true) ?: (object)[],
    ];
}
