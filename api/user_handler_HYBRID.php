<?php
// ====================================
// user_handler_HYBRID.php - API UNIVERSAL para WEB y APK
// ====================================
// Versión híbrida optimizada con PDO + Variables de Entorno
// Compatible con XAMPP (desarrollo) y servidor en producción
// 
// INSTRUCCIONES:
// 1. Copia .env.example a .env
// 2. Configura tus credenciales en .env
// 3. La API segura completa está en user_handler_SECURE.php
// ====================================

// Cargar variables de entorno si existe EnvLoader
if (file_exists(__DIR__ . '/EnvLoader.php')) {
    require_once __DIR__ . '/EnvLoader.php';
    try {
        EnvLoader::load(__DIR__ . '/.env');
    } catch (Exception $e) {
        // Si no existe .env, usar valores por defecto
    }
}

// ====================================
// CONFIGURACIÓN DE ENTORNO
// ====================================

// Función helper para obtener variable de entorno con fallback
function env($key, $default = null) {
    $value = getenv($key);
    return $value !== false ? $value : $default;
}

// 🔧 CAMBIAR AQUÍ O EN .env: APP_ENV=production para producción
$useProduction = env('APP_ENV', 'development') === 'production';

// Detectar si es petición desde APK (CORS)
$isAPKRequest = isset($_SERVER['HTTP_ORIGIN']) && $_SERVER['HTTP_ORIGIN'] !== '';

// ====================================
// CONFIGURACIÓN DE BASE DE DATOS
// ====================================
// Usar variables de entorno con fallback a valores hardcodeados
if ($useProduction) {
    // 🌐 CONFIGURACIÓN PARA PRODUCCIÓN
    define('DB_HOST', env('DB_HOST', 'sql110.infinityfree.com'));
    define('DB_NAME', env('DB_NAME', 'if0_40107414_wacheck'));
    define('DB_USER', env('DB_USER', 'if0_40107414'));
    define('DB_PASS', env('DB_PASS', 'xJHJWEldhH'));
} else {
    // 💻 CONFIGURACIÓN PARA XAMPP (desarrollo local)
    define('DB_HOST', env('DB_HOST', 'localhost'));
    define('DB_NAME', env('DB_NAME', 'wacheck_db'));
    define('DB_USER', env('DB_USER', 'root'));
    define('DB_PASS', env('DB_PASS', ''));
}

// ====================================
// HEADERS - Con configuración CORS desde .env
// ====================================
if ($isAPKRequest) {
    $allowedOrigins = explode(',', env('CORS_ALLOWED_ORIGINS', '*'));
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    
    // Si está en la whitelist o es desarrollo (*)
    if (in_array('*', $allowedOrigins) || in_array($origin, $allowedOrigins)) {
        header("Access-Control-Allow-Origin: $origin");
    }
    
    header('Access-Control-Allow-Methods: ' . env('CORS_ALLOWED_METHODS', 'GET, POST, OPTIONS'));
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
}
header('Content-Type: application/json; charset=utf-8');

// Headers de seguridad básicos
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');

// Manejar preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(['status' => 'ok']);
    exit();
}

// Capturar todos los errores de PHP para devolverlos como JSON
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    http_response_code(500);
    
    // En desarrollo mostrar detalles, en producción ocultar
    if (env('APP_DEBUG', 'true') === 'true') {
        echo json_encode(['error' => 'Error del servidor: ' . $errstr]);
    } else {
        echo json_encode(['error' => 'Internal server error']);
    }
    exit();
});

// ====================================
// CONEXIÓN A BASE DE DATOS (PDO)
// ====================================
function getDBConnection() {
    try {
        $conn = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4", DB_USER, DB_PASS);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $conn->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
        return $conn;
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error de conexión: ' . $e->getMessage()]);
        exit();
    }
}

// ====================================
// INICIALIZAR TABLA
// ====================================
function initDatabase() {
    try {
        $conn = getDBConnection();
        
        // Crear tabla con el esquema correcto (igual que wacheck_db_UPDATED.sql)
        $sql = "CREATE TABLE IF NOT EXISTS users (
            id INT(11) NOT NULL AUTO_INCREMENT,
            username VARCHAR(50) NOT NULL,
            password VARCHAR(255) NOT NULL,
            special_coins INT(11) NOT NULL DEFAULT 0,
            unlocked_defenders TEXT DEFAULT NULL,
            calculator_completed TINYINT(1) NOT NULL DEFAULT 0,
            rewards_data TEXT DEFAULT NULL,
            achievements_data TEXT DEFAULT NULL,
            story_progress TEXT DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY username (username)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
        
        $conn->exec($sql);
        return true;
    } catch(PDOException $e) {
        // Si falla, intentar continuar (la tabla puede ya existir)
        error_log("Error al crear tabla: " . $e->getMessage());
        return false;
    }
}

// Intentar inicializar la base de datos
try {
    initDatabase();
} catch (Exception $e) {
    // No bloquear si falla la inicialización
    error_log("Error en initDatabase: " . $e->getMessage());
}

// ====================================
// MANEJO DE ACCIONES
// ====================================
$action = $_GET['action'] ?? '';

// Ping para verificar disponibilidad
if ($action === 'ping') {
    echo json_encode(['status' => 'ok', 'source' => 'web-apk-hybrid', 'timestamp' => time()]);
    exit();
}

// Obtener datos POST y validar JSON
$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true);

// Si hay error al decodificar JSON, devolverlo
if (json_last_error() !== JSON_ERROR_NONE && !empty($rawInput)) {
    http_response_code(400);
    echo json_encode(['error' => 'JSON inválido: ' . json_last_error_msg()]);
    exit();
}

try {
    switch ($action) {
        case 'create_user':
            createUser($input);
            break;

        case 'login':
            loginUser($input);
            break;

        case 'logout':
            logoutUser();
            break;

        case 'save_progress':
            saveProgress($input);
            break;

        default:
            http_response_code(400);
            echo json_encode(['error' => 'Acción no válida: ' . $action]);
            exit();
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error en el servidor: ' . $e->getMessage()]);
    exit();
}

// ====================================
// FUNCIONES
// ====================================

function createUser($data) {
    try {
        $name = $data['name'] ?? '';
        $password = $data['password'] ?? '';
        $email = $data['email'] ?? ''; // Opcional por ahora

        if (empty($name) || empty($password)) {
            http_response_code(400);
            echo json_encode(['error' => 'Nombre y contraseña son requeridos']);
            return;
        }

        if (strlen($password) < 4) {
            http_response_code(400);
            echo json_encode(['error' => 'La contraseña debe tener al menos 4 caracteres']);
            return;
        }
        
        // Validar email si se proporciona
        if (!empty($email)) {
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                http_response_code(400);
                echo json_encode(['error' => 'Formato de email inválido']);
                return;
            }
            
            // Validar dominio
            $allowedDomains = ['gmail.com', 'ucol.mx', 'hotmail.com', 'outlook.com', 'yahoo.com'];
            $emailDomain = substr(strrchr($email, "@"), 1);
            if (!in_array($emailDomain, $allowedDomains)) {
                http_response_code(400);
                echo json_encode(['error' => 'Solo se permiten emails de: ' . implode(', ', $allowedDomains)]);
                return;
            }
        }

        $conn = getDBConnection();

        // Verificar si el usuario ya existe
        $stmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
        $stmt->execute([$name]);
        if ($stmt->fetch()) {
            http_response_code(400);
            echo json_encode(['error' => 'El usuario ya existe']);
            return;
        }

        // Crear usuario con valores por defecto
        // Usar hashing mejorado si está disponible
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
        $defaultDefenders = json_encode(["filter", "plant", "recycler", "cleaner", "stream", "bubble", "wind", "earth"]);
        $defaultStory = json_encode(["currentChapter" => 1, "currentMission" => 1, "completedChapters" => [], "storyCoins" => 0, "unlockedChapters" => [1]]);
        
        $stmt = $conn->prepare("INSERT INTO users (username, password, unlocked_defenders, story_progress) VALUES (?, ?, ?, ?)");
        $stmt->execute([$name, $hashedPassword, $defaultDefenders, $defaultStory]);

        $userId = $conn->lastInsertId();

        // Devolver usuario creado
        $stmt = $conn->prepare("SELECT id, username, special_coins, unlocked_defenders, calculator_completed, rewards_data, achievements_data, story_progress FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al recuperar el usuario creado']);
            return;
        }

        // Mapear a nombres camelCase para el frontend
        $response = [
            'id' => (int)$user['id'],
            'name' => $user['username'],
            'specialCoins' => (int)($user['special_coins'] ?? 0),
            'unlockedDefenders' => json_decode($user['unlocked_defenders'] ?? '[]', true) ?: [],
            'calculatorCompleted' => (bool)($user['calculator_completed'] ?? false),
            'rewardsData' => json_decode($user['rewards_data'] ?? '{}', true) ?: (object)[],
            'achievementsData' => json_decode($user['achievements_data'] ?? '{}', true) ?: (object)[],
            'storyProgress' => json_decode($user['story_progress'] ?? $defaultStory, true) ?: json_decode($defaultStory, true)
        ];

        http_response_code(201);
        echo json_encode($response);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al crear usuario: ' . $e->getMessage()]);
    }
}

function loginUser($data) {
    try {
        $name = $data['name'] ?? '';
        $password = $data['password'] ?? '';

        if (empty($name) || empty($password)) {
            http_response_code(400);
            echo json_encode(['error' => 'Nombre y contraseña son requeridos']);
            return;
        }

        $conn = getDBConnection();
        
        $stmt = $conn->prepare("SELECT * FROM users WHERE username = ?");
        $stmt->execute([$name]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Usuario no encontrado']);
            return;
        }

        if (!password_verify($password, $user['password'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Contraseña incorrecta']);
            return;
        }

        // Iniciar sesión PHP
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        // Regenerar ID de sesión por seguridad
        session_regenerate_id(true);
        
        // Guardar datos en sesión
        $_SESSION['user_id'] = (int)$user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['logged_in'] = true;
        $_SESSION['login_time'] = time();

        // Mapear a nombres camelCase para el frontend
        $response = [
            'id' => (int)$user['id'],
            'name' => $user['username'],
            'session' => session_id(), // ID de sesión para el frontend
            'specialCoins' => (int)($user['special_coins'] ?? 0),
            'unlockedDefenders' => json_decode($user['unlocked_defenders'] ?? '[]', true) ?: [],
            'calculatorCompleted' => (bool)($user['calculator_completed'] ?? false),
            'rewardsData' => json_decode($user['rewards_data'] ?? '{}', true) ?: (object)[],
            'achievementsData' => json_decode($user['achievements_data'] ?? '{}', true) ?: (object)[],
            'storyProgress' => json_decode($user['story_progress'] ?? '{}', true) ?: (object)[]
        ];

        http_response_code(200);
        echo json_encode($response);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al iniciar sesión: ' . $e->getMessage()]);
    }
}

function logoutUser() {
    try {
        // Iniciar sesión si no está iniciada
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        // Destruir todos los datos de sesión
        $_SESSION = array();
        
        // Destruir la cookie de sesión si existe
        if (isset($_COOKIE[session_name()])) {
            setcookie(session_name(), '', time() - 3600, '/');
        }
        
        // Destruir la sesión
        session_destroy();
        
        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Sesión cerrada correctamente']);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al cerrar sesión: ' . $e->getMessage()]);
    }
}

function saveProgress($data) {
    try {
        // Soportar tanto 'id' como 'userId' para compatibilidad
        $userId = $data['userId'] ?? $data['id'] ?? null;
        
        if (!$userId) {
            http_response_code(400);
            echo json_encode(['error' => 'userId o id es requerido']);
            return;
        }

        $conn = getDBConnection();

        // Construir campos a actualizar (nombres con guiones bajos para la BD)
        $fieldsToUpdate = [];
        $values = [];

        if (isset($data['specialCoins'])) {
            $fieldsToUpdate[] = "special_coins = ?";
            $values[] = (int)$data['specialCoins'];
        }
        if (isset($data['unlockedDefenders'])) {
            $fieldsToUpdate[] = "unlocked_defenders = ?";
            $values[] = json_encode($data['unlockedDefenders']);
        }
        if (isset($data['calculatorCompleted'])) {
            $fieldsToUpdate[] = "calculator_completed = ?";
            $values[] = $data['calculatorCompleted'] ? 1 : 0;
        }
        if (isset($data['rewardsData'])) {
            $fieldsToUpdate[] = "rewards_data = ?";
            $values[] = json_encode($data['rewardsData']);
        }
        if (isset($data['achievementsData'])) {
            $fieldsToUpdate[] = "achievements_data = ?";
            $values[] = json_encode($data['achievementsData']);
        }
        if (isset($data['storyProgress'])) {
            $fieldsToUpdate[] = "story_progress = ?";
            $values[] = json_encode($data['storyProgress']);
        }

        if (empty($fieldsToUpdate)) {
            http_response_code(400);
            echo json_encode(['error' => 'No hay datos para actualizar']);
            return;
        }

        $values[] = $userId;
        $sql = "UPDATE users SET " . implode(", ", $fieldsToUpdate) . " WHERE id = ?";
        
        $stmt = $conn->prepare($sql);
        $stmt->execute($values);

        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Progreso guardado correctamente']);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al guardar progreso: ' . $e->getMessage()]);
    }
}

// ====================================
// NOTAS FINALES
// ====================================
/*
 * 📌 COMPATIBILIDAD:
 * - Funciona tanto para la página web como para la APK
 * - Los nombres de columnas en BD usan snake_case (special_coins, unlocked_defenders)
 * - Las respuestas JSON usan camelCase (specialCoins, unlockedDefenders)
 * - Soporta tanto 'id' como 'userId' en save_progress
 * 
 * 📌 SEGURIDAD:
 * - Usa PDO con prepared statements (previene SQL injection)
 * - Contraseñas hasheadas con PASSWORD_BCRYPT
 * - CORS solo se activa para peticiones desde APK
 * 
 * 📌 ANTES DE SUBIR A PRODUCCIÓN:
 * 1. Cambiar $useProduction = true; (línea ~18)
 * 2. Verificar credenciales de base de datos
 * 3. Asegurar que la tabla 'users' existe (se crea automáticamente)
 * 
 * 📌 PARA PROBAR EN XAMPP:
 * 1. Asegúrate que Apache y MySQL estén corriendo
 * 2. Crea la base de datos 'wacheck_db' en phpMyAdmin
 * 3. La tabla se crea automáticamente al hacer la primera petición
 * 4. URL de prueba: http://localhost/Wacheck/api/user_handler_HYBRID.php?action=ping
 * 
 * 📌 API ANTERIOR:
 * - La API antigua está en /api/api_old/user_handler.php
 * - Se mantiene solo como referencia, NO usar en producción
 * - Esta versión HYBRID la reemplaza completamente
 */
?>
