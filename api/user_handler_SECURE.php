<?php
// ====================================
// user_handler_SECURE.php - API SEGURA PARA PRODUCCIÓN
// ====================================
// Versión con máxima seguridad para producción
// - Variables de entorno (.env)
// - Prepared statements (anti SQL injection)
// - Encriptación de datos sensibles
// - Rate limiting
// - CSRF protection
// - Validación y sanitización robusta
// - Headers de seguridad
// - Logging de eventos
// ====================================

// Deshabilitar display de errores en producción
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

// Cargar dependencias
require_once __DIR__ . '/EnvLoader.php';
require_once __DIR__ . '/Security.php';

try {
    // Cargar variables de entorno
    EnvLoader::load(__DIR__ . '/.env');
    
    // Inicializar seguridad
    Security::init();
    
} catch (Exception $e) {
    error_log('user_handler_SECURE.php bootstrap exception: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Server configuration error']);
    exit();
}

// ====================================
// CONFIGURACIÓN CORS SEGURA
// ====================================
$allowedOrigins = explode(',', EnvLoader::get('CORS_ALLOWED_ORIGINS', 'http://localhost'));
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: ' . EnvLoader::get('CORS_ALLOWED_METHODS', 'GET,POST,OPTIONS'));
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token');
}

header('Content-Type: application/json; charset=utf-8');

// Manejar preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ====================================
// RATE LIMITING
// ====================================
$clientIP = Security::getClientIP();
if (!Security::checkRateLimit($clientIP)) {
    http_response_code(429);
    echo json_encode([
        'error' => 'Too many requests',
        'message' => 'Please wait before making more requests'
    ]);
    exit();
}

// ====================================
// FUNCIÓN: Enviar email de verificación con SMTP
// ====================================
function sendVerificationEmail($email, $username, $token) {
    $appUrl = EnvLoader::get('APP_URL', 'http://localhost/Wacheck');
    $verifyUrl = "$appUrl/verify-email.php?token=$token";
    
    // Configuración SMTP desde .env
    $smtpHost = EnvLoader::get('SMTP_HOST', 'smtp.gmail.com');
    $smtpPort = EnvLoader::get('SMTP_PORT', 587);
    $smtpUsername = EnvLoader::get('SMTP_USERNAME');
    $smtpPassword = EnvLoader::get('SMTP_PASSWORD');
    $smtpFromEmail = EnvLoader::get('SMTP_FROM_EMAIL', $smtpUsername);
    $smtpFromName = EnvLoader::get('SMTP_FROM_NAME', 'Wacheck');
    
    // Verificar que las credenciales SMTP están configuradas
    if (empty($smtpUsername) || empty($smtpPassword) || 
        $smtpUsername === 'tu-correo@gmail.com' || 
        $smtpPassword === 'tu-contraseña-de-aplicacion-aqui') {
        error_log("ERROR: Configuración SMTP incompleta en .env");
        return false;
    }
    
    $subject = "Wacheck - Verifica tu correo";
    $htmlMessage = "
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 20px auto; background: white; padding: 30px; border-radius: 10px; }
            .header { text-align: center; color: #0891b2; }
            .button { display: inline-block; padding: 12px 30px; background: #0891b2; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { color: #666; font-size: 12px; text-align: center; margin-top: 30px; }
        </style>
    </head>
    <body>
        <div class='container'>
            <h1 class='header'> Bienvenido a Wacheck</h1>
            <p>Hola <strong>$username</strong>,</p>
            <p>Gracias por registrarte. Para activar tu cuenta, haz clic en el siguiente botón:</p>
            <p style='text-align: center;'>
                <a href='$verifyUrl' class='button'>Verificar mi correo</a>
            </p>
            <p>O copia este enlace en tu navegador:</p>
            <p style='word-break: break-all; color: #0891b2;'>$verifyUrl</p>
            <p><small>Este enlace expira en 24 horas.</small></p>
            <div class='footer'>
                <p>Universidad de Colima - Bachillerato 25</p>
                <p>Si no creaste esta cuenta, ignora este mensaje.</p>
            </div>
        </div>
    </body>
    </html>
    ";
    
    // Configurar headers para mail()
    $headers  = "MIME-Version: 1.0\r\n";
    $headers .= "Content-type: text/html; charset=UTF-8\r\n";
    $headers .= "From: $smtpFromName <$smtpFromEmail>\r\n";
    $headers .= "Reply-To: $smtpFromEmail\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();
    
    // Usar mail() nativo — compatible con InfinityFree y shared hosting
    // fsockopen a SMTP externo está bloqueado en la mayoría de hostings gratuitos
    try {
        $sent = @mail($email, $subject, $htmlMessage, $headers);
        
        if (!$sent) {
            error_log("ERROR mail(): No se pudo enviar email a $email");
            return false;
        }
        
        return true;
        
    } catch (Exception $e) {
        error_log("ERROR enviando email: " . $e->getMessage());
        return false;
    }
}

// ====================================
// CONEXIÓN SEGURA A BASE DE DATOS
// ====================================
class Database {
    private static $conn = null;
    
    public static function getConnection() {
        if (self::$conn === null) {
            try {
                $host = EnvLoader::get('DB_HOST');
                $dbname = EnvLoader::get('DB_NAME');
                $user = EnvLoader::get('DB_USER');
                $pass = EnvLoader::get('DB_PASS');
                
                // Para InfinityFree: agregar puerto 3306 explícitamente
                $dsn = "mysql:host=$host;port=3306;dbname=$dbname;charset=utf8mb4";
                $options = [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_EMULATE_PREPARES => false,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_PERSISTENT => false
                ];
                
                self::$conn = new PDO($dsn, $user, $pass, $options);
                
            } catch(PDOException $e) {
                self::logError('Database connection failed: ' . $e->getMessage());
                throw new Exception('Database connection failed');
            }
        }
        
        return self::$conn;
    }
    
    /**
     * Log de errores — compatible con shared hosting
     */
    private static function logError($message) {
        $logFile = EnvLoader::get('LOG_FILE', '');
        
        $timestamp = date('Y-m-d H:i:s');
        $ip = Security::getClientIP();
        $logMessage = "[$timestamp] [$ip] $message";
        
        // Intentar log a archivo custom, si falla usar error_log por defecto
        if (!empty($logFile)) {
            $logDir = dirname($logFile);
            if (is_dir($logDir) || @mkdir($logDir, 0755, true)) {
                @error_log($logMessage . PHP_EOL, 3, $logFile);
                return;
            }
        }
        
        // Fallback: log del sistema (funciona siempre en shared hosting)
        error_log("[Wacheck] $logMessage");
    }
}

// ====================================
// FUNCIONES DE API
// ====================================

/**
 * Inicializar base de datos
 */
function initDatabase() {
    try {
        $conn = Database::getConnection();
        
        $sql = "CREATE TABLE IF NOT EXISTS users (
            id INT(11) NOT NULL AUTO_INCREMENT,
            username VARCHAR(50) NOT NULL UNIQUE,
            email VARCHAR(255) DEFAULT NULL,
            password VARCHAR(255) NOT NULL,
            email_verified TINYINT(1) NOT NULL DEFAULT 0,
            verification_token VARCHAR(64) DEFAULT NULL,
            verification_expires TIMESTAMP NULL DEFAULT NULL,
            special_coins INT(11) NOT NULL DEFAULT 0,
            coins INT(11) NOT NULL DEFAULT 0,
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
            PRIMARY KEY (id),
            UNIQUE KEY idx_email (email),
            INDEX idx_username (username),
            INDEX idx_last_login (last_login),
            INDEX idx_verification_token (verification_token)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
        
        $conn->exec($sql);

        // Agregar columna username_changed_at si no existe
        $check = $conn->query("SHOW COLUMNS FROM users LIKE 'username_changed_at'");
        if ($check->rowCount() === 0) {
            $conn->exec("ALTER TABLE users ADD COLUMN username_changed_at TIMESTAMP NULL DEFAULT NULL");
        }

        return true;
    } catch (Exception $e) {
        throw new Exception('Failed to initialize database: ' . $e->getMessage());
    }
}

/**
 * Registrar nuevo usuario CON VERIFICACIÓN DE EMAIL
 */
function registerUser($data) {
    // Sanitizar y validar inputs
    $username = Security::sanitizeInput($data['name'] ?? '', 'string');
    $email = Security::sanitizeInput($data['email'] ?? '', 'email');
    $password = $data['password'] ?? '';
    
    // Validaciones
    if (!Security::validateInput($username, 'username')) {
        http_response_code(400);
        return ['error' => 'El usuario debe tener 3-50 caracteres alfanuméricos'];
    }
    
    if (!Security::validateInput($email, 'email')) {
        http_response_code(400);
        return ['error' => 'Email inválido'];
    }
    
    // Validar dominios permitidos
    $allowedDomains = ['gmail.com', 'ucol.mx', 'hotmail.com', 'outlook.com', 'yahoo.com'];
    $emailDomain = substr(strrchr($email, "@"), 1);
    if (!in_array($emailDomain, $allowedDomains)) {
        http_response_code(400);
        return ['error' => 'Solo se permiten emails de: ' . implode(', ', $allowedDomains)];
    }
    
    if (!Security::validateInput($password, 'password')) {
        http_response_code(400);
        return ['error' => 'La contraseña debe tener al menos 4 caracteres'];
    }
    
    try {
        $conn = Database::getConnection();
        
        // Verificar si usuario o email ya existen
        $stmt = $conn->prepare("SELECT id, username, email FROM users WHERE username = ? OR email = ?");
        $stmt->execute([$username, $email]);
        $existing = $stmt->fetch();
        
        if ($existing) {
            if ($existing['username'] === $username) {
                http_response_code(409);
                return ['error' => 'El nombre de usuario ya está en uso'];
            }
            if ($existing['email'] === $email) {
                http_response_code(409);
                return ['error' => 'El email ya está registrado'];
            }
        }
        
        // Hashear contraseña de forma segura
        $hashedPassword = Security::hashPassword($password);
        
        // Generar token de verificación
        $verificationToken = bin2hex(random_bytes(32));
        $verificationExpires = date('Y-m-d H:i:s', strtotime('+24 hours'));
        
        // Datos por defecto
        $defaultDefenders = ["filter", "plant", "recycler", "cleaner", "stream", "bubble", "wind", "earth"];
        $defaultStory = [
            "currentChapter" => 1,
            "currentMission" => 1,
            "completedChapters" => [],
            "storyCoins" => 0,
            "unlockedChapters" => [1]
        ];
        
        // Insertar usuario
        $stmt = $conn->prepare("
            INSERT INTO users (username, email, password, email_verified, verification_token, verification_expires, unlocked_defenders, story_progress) 
            VALUES (?, ?, ?, 0, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $username,
            $email,
            $hashedPassword,
            $verificationToken,
            $verificationExpires,
            json_encode($defaultDefenders),
            json_encode($defaultStory)
        ]);
        
        // Enviar email de verificación
        try {
            sendVerificationEmail($email, $username, $verificationToken);
        } catch (Exception $e) {
            // Log error pero no fallar el registro
            error_log('Failed to send verification email: ' . $e->getMessage());
        }
        
        $userId = $conn->lastInsertId();
        
        // Obtener usuario creado
        $stmt = $conn->prepare("
            SELECT id, username, special_coins, coins, stars, runes,
                   unlocked_defenders, calculator_completed, rewards_data, 
                   achievements_data, story_progress, created_at
            FROM users WHERE id = ?
        ");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();
        
        if (!$user) {
            http_response_code(500);
            return ['error' => 'Failed to retrieve created user'];
        }
        
        // Mapear respuesta
        $response = mapUserResponse($user);
        
        http_response_code(201);
        return $response;
        
    } catch (Exception $e) {
        error_log('registerUser exception: ' . $e->getMessage());
        http_response_code(500);
        return ['error' => 'Registration failed'];
    }
}

/**
 * Login de usuario
 */
function loginUser($data) {
    // Sanitizar inputs
    $username = Security::sanitizeInput($data['name'] ?? '', 'string');
    $password = $data['password'] ?? '';
    
    if (empty($username) || empty($password)) {
        http_response_code(400);
        return ['error' => 'Username and password are required'];
    }
    
    try {
        $conn = Database::getConnection();
        
        // Obtener usuario
        $stmt = $conn->prepare("
            SELECT * FROM users WHERE username = ?
        ");
        $stmt->execute([$username]);
        $user = $stmt->fetch();
        
        if (!$user) {
            // No revelar si el usuario existe o no
            http_response_code(401);
            return ['error' => 'Credenciales inválidas'];
        }
        
        // Verificar si el email está verificado
        if (!$user['email_verified']) {
            http_response_code(403);
            return [
                'error' => 'Email no verificado',
                'message' => 'Por favor verifica tu correo antes de iniciar sesión',
                'email' => $user['email']
            ];
        }
        
        // Verificar si cuenta está bloqueada
        if ($user['account_locked_until'] && strtotime($user['account_locked_until']) > time()) {
            http_response_code(423);
            return [
                'error' => 'Cuenta bloqueada',
                'message' => 'Demasiados intentos fallidos. Intenta más tarde.'
            ];
        }
        
        // Verificar contraseña
        if (!Security::verifyPassword($password, $user['password'])) {
            // Incrementar intentos fallidos
            $attempts = $user['failed_login_attempts'] + 1;
            $lockedUntil = null;
            
            // Bloquear después de 5 intentos fallidos
            if ($attempts >= 5) {
                $lockedUntil = date('Y-m-d H:i:s', strtotime('+30 minutes'));
            }
            
            $stmt = $conn->prepare("
                UPDATE users 
                SET failed_login_attempts = ?, locked_until = ?
                WHERE id = ?
            ");
            $stmt->execute([$attempts, $lockedUntil, $user['id']]);
            
            http_response_code(401);
            return ['error' => 'Invalid credentials'];
        }
        
        // Login exitoso - resetear intentos fallidos
        $stmt = $conn->prepare("
            UPDATE users 
            SET failed_login_attempts = 0, 
                account_locked_until = NULL,
                last_login = CURRENT_TIMESTAMP
            WHERE id = ?
        ");
        $stmt->execute([$user['id']]);
        
        // Iniciar sesión PHP para web
        if (!isset($_SESSION)) {
            session_start([
                'cookie_httponly' => true,
                'cookie_samesite' => 'Lax',
                'cookie_secure' => EnvLoader::get('SESSION_COOKIE_SECURE', 'false') === 'true',
                'use_strict_mode' => true
            ]);
        }
        
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['email'] = $user['email'];
        $_SESSION['last_activity'] = time();
        $_SESSION['created_at'] = time();
        
        // Actualizar datos del usuario
        $user['failed_login_attempts'] = 0;
        $user['account_locked_until'] = null;
        
        // Mapear respuesta
        $response = mapUserResponse($user);
        $response['session'] = true; // Indicar que hay sesión activa
        
        http_response_code(200);
        return $response;
        
    } catch (Exception $e) {
        error_log('loginUser exception: ' . $e->getMessage());
        http_response_code(500);
        return ['error' => 'Login failed'];
    }
}

/**
 * Guardar progreso del usuario
 */
function saveProgress($data) {
    // Obtener y validar userId
    $userId = Security::sanitizeInput($data['userId'] ?? $data['id'] ?? '', 'int');
    
    if (!$userId || !is_numeric($userId)) {
        http_response_code(400);
        return ['error' => 'Valid userId is required'];
    }
    
    try {
        $conn = Database::getConnection();
        
        // Construir update query dinámicamente
        $fields = [];
        $values = [];
        
        // Mapear campos con validación
        $fieldMap = [
            'specialCoins' => ['db' => 'special_coins', 'type' => 'int'],
            'coins' => ['db' => 'coins', 'type' => 'int'],
            'stars' => ['db' => 'stars', 'type' => 'int'],
            'runes' => ['db' => 'runes', 'type' => 'int'],
            'calculatorCompleted' => ['db' => 'calculator_completed', 'type' => 'bool'],
            'unlockedDefenders' => ['db' => 'unlocked_defenders', 'type' => 'json'],
            'rewardsData' => ['db' => 'rewards_data', 'type' => 'json'],
            'achievementsData' => ['db' => 'achievements_data', 'type' => 'json'],
            'storyProgress' => ['db' => 'story_progress', 'type' => 'json']
        ];
        
        foreach ($fieldMap as $key => $config) {
            if (isset($data[$key])) {
                $value = $data[$key];
                
                // Procesar según tipo
                switch ($config['type']) {
                    case 'int':
                        $value = (int)Security::sanitizeInput($value, 'int');
                        break;
                    case 'bool':
                        $value = $value ? 1 : 0;
                        break;
                    case 'json':
                        $value = json_encode($value);
                        break;
                }
                
                $fields[] = "{$config['db']} = ?";
                $values[] = $value;
            }
        }
        
        if (empty($fields)) {
            http_response_code(400);
            return ['error' => 'No valid data to update'];
        }
        
        // Agregar userId al final
        $values[] = $userId;
        
        // Ejecutar update
        $sql = "UPDATE users SET " . implode(", ", $fields) . " WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->execute($values);
        
        http_response_code(200);
        return [
            'success' => true,
            'message' => 'Progress saved successfully'
        ];
        
    } catch (Exception $e) {
        error_log('saveProgress exception: ' . $e->getMessage());
        http_response_code(500);
        return ['error' => 'Failed to save progress'];
    }
}

/**
 * Verificar email con token
 */
function verifyEmail($data) {
    $token = Security::sanitizeInput($data['token'] ?? '', 'string');
    
    if (empty($token)) {
        http_response_code(400);
        return ['error' => 'Token es requerido'];
    }
    
    try {
        $conn = Database::getConnection();
        
        // Buscar usuario con token válido
        $stmt = $conn->prepare("
            SELECT id, username, email, verification_expires 
            FROM users 
            WHERE verification_token = ? 
            AND email_verified = 0
        ");
        $stmt->execute([$token]);
        $user = $stmt->fetch();
        
        if (!$user) {
            http_response_code(404);
            return ['error' => 'Token inválido o ya fue usado'];
        }
        
        // Verificar expiración
        if (strtotime($user['verification_expires']) < time()) {
            http_response_code(410);
            return ['error' => 'El token ha expirado. Solicita uno nuevo.'];
        }
        
        // Marcar email como verificado
        $stmt = $conn->prepare("
            UPDATE users 
            SET email_verified = 1, 
                verification_token = NULL, 
                verification_expires = NULL 
            WHERE id = ?
        ");
        $stmt->execute([$user['id']]);
        
        http_response_code(200);
        return [
            'success' => true,
            'message' => '¡Email verificado con éxito!',
            'username' => $user['username']
        ];
        
    } catch (Exception $e) {
        error_log('verifyEmail exception: ' . $e->getMessage());
        http_response_code(500);
        return ['error' => 'Error al verificar email'];
    }
}

/**
 * Reenviar token de verificación
 */
function resendVerification($data) {
    $email = Security::sanitizeInput($data['email'] ?? '', 'email');
    
    if (!Security::validateInput($email, 'email')) {
        http_response_code(400);
        return ['error' => 'Email inválido'];
    }
    
    try {
        $conn = Database::getConnection();
        
        // Buscar usuario
        $stmt = $conn->prepare("
            SELECT id, username, email_verified 
            FROM users 
            WHERE email = ?
        ");
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        
        if (!$user) {
            http_response_code(404);
            return ['error' => 'Email no encontrado'];
        }
        
        if ($user['email_verified']) {
            http_response_code(400);
            return ['error' => 'El email ya está verificado'];
        }
        
        // Generar nuevo token
        $newToken = bin2hex(random_bytes(32));
        $newExpires = date('Y-m-d H:i:s', strtotime('+24 hours'));
        
        $stmt = $conn->prepare("
            UPDATE users 
            SET verification_token = ?, 
                verification_expires = ? 
            WHERE id = ?
        ");
        $stmt->execute([$newToken, $newExpires, $user['id']]);
        
        // Enviar nuevo email
        sendVerificationEmail($email, $user['username'], $newToken);
        
        http_response_code(200);
        return [
            'success' => true,
            'message' => 'Email de verificación reenviado'
        ];
        
    } catch (Exception $e) {
        error_log('resendVerification exception: ' . $e->getMessage());
        http_response_code(500);
        return ['error' => 'Error al reenviar verificación'];
    }
}

/**
 * Mapear respuesta de usuario
 */
/**
 * Devuelve el perfil actualizado del usuario (incluye google_avatar fresco del servidor)
 */
function getProfile($data) {
    $userId = (int)Security::sanitizeInput($data['userId'] ?? '', 'int');
    if (!$userId) {
        http_response_code(400);
        return ['error' => 'userId requerido'];
    }
    try {
        $conn = Database::getConnection();
        $stmt = $conn->prepare('SELECT * FROM users WHERE id = ? LIMIT 1');
        $stmt->execute([$userId]);
        $user = $stmt->fetch();
        if (!$user) {
            http_response_code(404);
            return ['error' => 'Usuario no encontrado'];
        }
        return ['status' => 'ok', 'user' => mapUserResponse($user)];
    } catch (Exception $e) {
        error_log('[getProfile] ' . $e->getMessage());
        http_response_code(500);
        return ['error' => 'Error al obtener perfil'];
    }
}

function mapUserResponse($user) {
    return [
        'id' => (int)$user['id'],
        'name' => $user['username'],
        'email' => $user['email'] ?? '',
        'isGuest' => false,
        'googleLogin' => !empty($user['google_id']),
        'googleAvatar' => $user['google_avatar'] ?? '',
        'avatar' => $user['google_avatar'] ?? '',
        'avatarUrl' => $user['google_avatar'] ?? '',
        'hasPassword' => !empty($user['password']),
        'usernameChangedAt' => $user['username_changed_at'] ?? null,
        'specialCoins' => (int)($user['special_coins'] ?? 0),
        'coins' => (int)($user['coins'] ?? 0),
        'stars' => (int)($user['stars'] ?? 0),
        'runes' => (int)($user['runes'] ?? 0),
        'unlockedDefenders' => json_decode($user['unlocked_defenders'] ?? '[]', true) ?: [],
        'calculatorCompleted' => (bool)($user['calculator_completed'] ?? false),
        'rewardsData' => json_decode($user['rewards_data'] ?? '{}', true) ?: (object)[],
        'achievementsData' => json_decode($user['achievements_data'] ?? '{}', true) ?: (object)[],
        'storyProgress' => json_decode($user['story_progress'] ?? '{}', true) ?: (object)[]
    ];
}

/**
 * Cambiar nombre de usuario (límite: 1 vez cada 30 días)
 */
function changeUsername($data) {
    $userId      = (int)Security::sanitizeInput($data['userId']      ?? '', 'int');
    $newUsername = Security::sanitizeInput($data['newUsername'] ?? '', 'string');
    $password    = $data['password'] ?? '';

    if (!$userId || empty($newUsername) || empty($password)) {
        http_response_code(400);
        return ['error' => 'Datos requeridos'];
    }

    if (!preg_match('/^[a-zA-Z0-9_\-]{3,30}$/', $newUsername)) {
        http_response_code(400);
        return ['error' => 'Solo letras, números, _ y - (3-30 caracteres)'];
    }

    try {
        $conn = Database::getConnection();

        $stmt = $conn->prepare('SELECT * FROM users WHERE id = ? LIMIT 1');
        $stmt->execute([$userId]);
        $user = $stmt->fetch();

        if (!$user) { http_response_code(404); return ['error' => 'Usuario no encontrado']; }

        if (!Security::verifyPassword($password, $user['password'])) {
            http_response_code(401);
            return ['error' => 'Contraseña incorrecta'];
        }

        // Verificar cooldown de 30 días
        if (!empty($user['username_changed_at'])) {
            $secsPassed = time() - strtotime($user['username_changed_at']);
            if ($secsPassed < 30 * 86400) {
                $daysLeft = ceil((30 * 86400 - $secsPassed) / 86400);
                http_response_code(429);
                return ['error' => "Puedes cambiar tu usuario en $daysLeft día(s)"];
            }
        }

        // Verificar unicidad
        $check = $conn->prepare('SELECT id FROM users WHERE username = ? AND id != ? LIMIT 1');
        $check->execute([$newUsername, $userId]);
        if ($check->fetch()) {
            http_response_code(409);
            return ['error' => 'Ese nombre de usuario ya está en uso'];
        }

        $conn->prepare('UPDATE users SET username = ?, username_changed_at = CURRENT_TIMESTAMP WHERE id = ?')
             ->execute([$newUsername, $userId]);

        http_response_code(200);
        return ['success' => true, 'newUsername' => $newUsername];

    } catch (Exception $e) {
        http_response_code(500);
        return ['error' => 'Error al cambiar usuario'];
    }
}

/**
 * Cambiar contraseña
 */
function changePassword($data) {
    $userId      = (int)Security::sanitizeInput($data['userId']      ?? '', 'int');
    $oldPassword = $data['oldPassword'] ?? '';
    $newPassword = $data['newPassword'] ?? '';

    if (!$userId || empty($oldPassword) || empty($newPassword)) {
        http_response_code(400);
        return ['error' => 'Datos requeridos'];
    }

    if (strlen($newPassword) < 8) {
        http_response_code(400);
        return ['error' => 'La contraseña debe tener al menos 8 caracteres'];
    }

    try {
        $conn = Database::getConnection();

        $stmt = $conn->prepare('SELECT * FROM users WHERE id = ? LIMIT 1');
        $stmt->execute([$userId]);
        $user = $stmt->fetch();

        if (!$user) { http_response_code(404); return ['error' => 'Usuario no encontrado']; }

        if (!Security::verifyPassword($oldPassword, $user['password'])) {
            http_response_code(401);
            return ['error' => 'Contraseña actual incorrecta'];
        }

        $hash = Security::hashPassword($newPassword);
        $conn->prepare('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
             ->execute([$hash, $userId]);

        http_response_code(200);
        return ['success' => true];

    } catch (Exception $e) {
        http_response_code(500);
        return ['error' => 'Error al cambiar contraseña'];
    }
}

/**
 * Eliminar cuenta
 */
function deleteAccount($data) {
    $userId   = (int)Security::sanitizeInput($data['userId'] ?? '', 'int');
    $password = $data['password'] ?? '';

    if (!$userId || empty($password)) {
        http_response_code(400);
        return ['error' => 'Datos requeridos'];
    }

    try {
        $conn = Database::getConnection();

        $stmt = $conn->prepare('SELECT * FROM users WHERE id = ? LIMIT 1');
        $stmt->execute([$userId]);
        $user = $stmt->fetch();

        if (!$user) { http_response_code(404); return ['error' => 'Usuario no encontrado']; }

        // Google-only accounts may have an empty password hash; require password anyway
        if (!empty($user['password']) && !Security::verifyPassword($password, $user['password'])) {
            http_response_code(401);
            return ['error' => 'Contraseña incorrecta'];
        }

        $conn->prepare('DELETE FROM users WHERE id = ?')->execute([$userId]);

        // Destruir sesión PHP
        if (session_status() !== PHP_SESSION_ACTIVE) session_start();
        session_destroy();

        http_response_code(200);
        return ['success' => true];

    } catch (Exception $e) {
        http_response_code(500);
        return ['error' => 'Error al eliminar cuenta'];
    }
}

// ====================================
// ROUTER
// ====================================

try {
    // Inicializar BD si es necesario
    initDatabase();
    
    // Obtener acción
    $action = $_GET['action'] ?? $_POST['action'] ?? '';
    $action = Security::sanitizeInput($action, 'string');
    
    // Obtener datos del request
    $requestData = [];
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
        
        if (strpos($contentType, 'application/json') !== false) {
            $requestData = json_decode(file_get_contents('php://input'), true) ?? [];
        } else {
            $requestData = $_POST;
        }
    } else {
        $requestData = $_GET;
    }
    
    // Limpiar output buffer
    Security::cleanOutput();
    
    // Routing
    $response = null;
    
    switch ($action) {
        case 'ping':
            $response = [
                'status' => 'ok',
                'message' => 'Wacheck API online',
                'authenticated' => isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true && isset($_SESSION['user_id']),
                'user_id' => $_SESSION['user_id'] ?? null
            ];
            break;
            
        case 'register':
        case 'create_user':
            $response = registerUser($requestData);
            break;
            
        case 'login':
            $response = loginUser($requestData);
            break;
            
        case 'save_progress':
            $response = saveProgress($requestData);
            break;
            
        case 'verify_email':
            $response = verifyEmail($requestData);
            break;
            
        case 'resend_verification':
            $response = resendVerification($requestData);
            break;
            
        case 'change_username':
            $response = changeUsername($requestData);
            break;

        case 'change_password':
            $response = changePassword($requestData);
            break;

        case 'delete_account':
            $response = deleteAccount($requestData);
            break;

        case 'get_profile':
            $response = getProfile($requestData);
            break;

        default:
            http_response_code(404);
            $response = ['error' => 'Action not found'];
            break;
    }
    
    echo json_encode($response);
    
} catch (Exception $e) {
    Security::cleanOutput();
    error_log('user_handler_SECURE.php exception: ' . $e->getMessage());
    http_response_code(500);

    echo json_encode(['error' => 'Internal server error']);
}
