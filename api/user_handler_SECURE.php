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
    http_response_code(500);
    if (EnvLoader::get('APP_DEBUG', 'false') === 'true') {
        echo json_encode(['error' => 'Configuration error: ' . $e->getMessage()]);
    } else {
        echo json_encode(['error' => 'Server configuration error']);
    }
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
// FUNCIÓN: Enviar email de verificación
// ====================================
function sendVerificationEmail($email, $username, $token) {
    $appUrl = EnvLoader::get('APP_URL', 'http://localhost/Wacheck');
    $verifyUrl = "$appUrl/verify-email.php?token=$token";
    
    $subject = "Wacheck - Verifica tu correo";
    $message = "
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
            <h1 class='header'>💧 Bienvenido a Wacheck</h1>
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
    
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: Wacheck <noreply@wacheck.gamer.gd>" . "\r\n";
    
    return mail($email, $subject, $message, $headers);
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
                
                $dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";
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
     * Log de errores
     */
    private static function logError($message) {
        $logFile = EnvLoader::get('LOG_FILE', __DIR__ . '/../logs/api.log');
        $logDir = dirname($logFile);
        
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }
        
        $timestamp = date('Y-m-d H:i:s');
        $ip = Security::getClientIP();
        $logMessage = "[$timestamp] [$ip] $message" . PHP_EOL;
        
        error_log($logMessage, 3, $logFile);
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
            password VARCHAR(255) NOT NULL,
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
            locked_until TIMESTAMP NULL DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            INDEX idx_username (username),
            INDEX idx_last_login (last_login)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
        
        $conn->exec($sql);
        
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
        http_response_code(500);
        return ['error' => 'Registration failed: ' . $e->getMessage()];
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
        http_response_code(500);
        return ['error' => 'Login failed: ' . $e->getMessage()];
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
        http_response_code(500);
        return ['error' => 'Failed to save progress: ' . $e->getMessage()];
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
        http_response_code(500);
        return ['error' => 'Error al verificar email: ' . $e->getMessage()];
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
        http_response_code(500);
        return ['error' => 'Error al reenviar verificación: ' . $e->getMessage()];
    }
}

/**
 * Mapear respuesta de usuario
 */
function mapUserResponse($user) {
    return [
        'id' => (int)$user['id'],
        'name' => $user['username'],
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
            $response = ['status' => 'ok', 'message' => 'Wacheck API is running (SECURE)'];
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
            
        default:
            http_response_code(404);
            $response = ['error' => 'Action not found'];
            break;
    }
    
    echo json_encode($response);
    
} catch (Exception $e) {
    Security::cleanOutput();
    http_response_code(500);
    
    if (EnvLoader::get('APP_DEBUG', 'false') === 'true') {
        echo json_encode(['error' => $e->getMessage()]);
    } else {
        echo json_encode(['error' => 'Internal server error']);
    }
}
