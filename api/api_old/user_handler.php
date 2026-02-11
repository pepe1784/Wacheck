<?php
// ====================================
// HEADERS CORS (para APK)
// ====================================
$isAPKRequest = isset($_SERVER['HTTP_ORIGIN']) && $_SERVER['HTTP_ORIGIN'] !== '';
if ($isAPKRequest) {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
}
header('Content-Type: application/json');

// Manejar preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// --- CONFIGURACIÓN DE LA BASE DE DATOS ---
// --- Configuración Local (XAMPP) ---
$servername = "localhost";
$username = "root";
$password_db = "";
$dbname = "wacheck_db";

// --- Configuración para InfinityFree (PRODUCCIÓN) - Comentada ---
// $servername = "sql110.infinityfree.com"; // Host de InfinityFree
// $username = "if0_40107414"; // Usuario de MySQL
// $password_db = "xJHJWEldhH"; // Contraseña de MySQL
// $dbname = "if0_40107414_wacheck"; // Base de datos

// --- GESTIÓN DE ACCIONES ---
$action = $_GET['action'] ?? '';

// --- PING (verificar disponibilidad) - NO REQUIERE DB ---
if ($action === 'ping') {
    echo json_encode(['status' => 'ok', 'source' => 'web-apk-hybrid']);
    exit();
}

// --- MEJORA: Manejo de errores de conexión ---
// Desactivar los informes de error de PHP para enviar nuestra propia respuesta JSON
mysqli_report(MYSQLI_REPORT_OFF);

// Crear conexión
$conn = new mysqli($servername, $username, $password_db, $dbname);

// Verificar conexión
if ($conn->connect_error) {
    // Enviar un error JSON claro y salir
    echo json_encode(['error' => 'Fallo en la conexión a la base de datos: ' . $conn->connect_error]);
    exit();
}

// --- ACCIÓN PARA CREAR UN NUEVO USUARIO ---
if ($action == 'create_user') {
    $input = json_decode(file_get_contents('php://input'), true);
    $name = $input['name'] ?? '';
    $password = $input['password'] ?? '';

    // Validación simple
    if (empty($name) || empty($password)) {
        echo json_encode(['error' => 'El nombre de usuario y la contraseña no pueden estar vacíos.']);
        exit();
    }
    if (strlen($password) < 4) {
        echo json_encode(['error' => 'La contraseña debe tener al menos 4 caracteres.']);
        exit();
    }

    // --- NUEVO: Verificar si el nombre de usuario ya existe ---
    $check_stmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
    $check_stmt->bind_param("s", $name);
    $check_stmt->execute();
    $check_stmt->store_result();
    if ($check_stmt->num_rows > 0) {
        echo json_encode(['error' => 'El nombre de usuario ya está en uso. Por favor, elige otro.']);
        $check_stmt->close();
        exit();
    }
    $check_stmt->close();

    // Hashear la contraseña para guardarla de forma segura
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    $default_defenders = json_encode(["filter", "plant", "recycler", "cleaner"]); 
    $default_story = json_encode(["currentChapter" => 1, "currentMission" => 1, "completedChapters" => [], "storyCoins" => 0, "unlockedChapters" => [1]]);

    $stmt = $conn->prepare("INSERT INTO users (username, password, special_coins, unlocked_defenders, calculator_completed, story_progress) VALUES (?, ?, 0, ?, 0, ?)");
    $stmt->bind_param("ssss", $name, $hashed_password, $default_defenders, $default_story);
    
    if ($stmt->execute()) {
        $new_id = $conn->insert_id;
        // No devolver la contraseña hasheada, solo los datos necesarios
        $response = [
            'id' => $new_id,
            'name' => $name,
            'specialCoins' => 0,
            'unlockedDefenders' => json_decode($default_defenders),
            'calculatorCompleted' => false,
            'storyProgress' => json_decode($default_story)
        ];
        echo json_encode($response);
    } else {
        // Esto podría pasar si hay un problema de conexión o si el nombre es duplicado y hay una restricción UNIQUE en la DB
        if ($conn->errno == 1062) { // Error de entrada duplicada
            echo json_encode(['error' => 'El nombre de usuario ya está en uso.']);
        } else {
            echo json_encode(['error' => 'No se pudo crear el usuario en la base de datos.']);
        }
    }
}

// --- ACCIÓN PARA INICIAR SESIÓN ---
else if ($action == 'login') {
    $input = json_decode(file_get_contents('php://input'), true);
    $name = $input['name'] ?? '';
    $password = $input['password'] ?? '';

    if (empty($name) || empty($password)) {
        echo json_encode(['error' => 'El nombre de usuario y la contraseña son requeridos.']);
        exit();
    }

    // Buscar todos los usuarios con ese nombre
    $stmt = $conn->prepare("SELECT id, username, password, special_coins, unlocked_defenders, calculator_completed, rewards_data, achievements_data, story_progress FROM users WHERE username = ?");
    $stmt->bind_param("s", $name);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $found_user = null;

    if ($result->num_rows > 0) {
        while($user = $result->fetch_assoc()) {
            // Verificar la contraseña para cada usuario encontrado
            if (password_verify($password, $user['password'])) {
                // Contraseña correcta, preparamos la respuesta
                $found_user = [
                    'id' => $user['id'],
                    'name' => $user['username'],
                    'specialCoins' => (int)$user['special_coins'],
                    'unlockedDefenders' => json_decode($user['unlocked_defenders'] ?: '[]'),
                    'calculatorCompleted' => (bool)$user['calculator_completed'],
                    'rewardsData' => json_decode($user['rewards_data'] ?: '{}'),
                    'achievementsData' => json_decode($user['achievements_data'] ?: '{}'),
                    'storyProgress' => json_decode($user['story_progress'] ?: '{}') ?: ['currentChapter' => 1, 'currentMission' => 1, 'completedChapters' => [], 'storyCoins' => 0, 'unlockedChapters' => [1]]
                ];
                break; // Encontramos al usuario, salimos del bucle
            }
        }
    }

    if ($found_user) {
        echo json_encode($found_user);
    } else {
        echo json_encode(['error' => 'Nombre de usuario o contraseña incorrectos.']);
    }
}

// --- ACCIÓN PARA GUARDAR PROGRESO (requiere ID, es segura) ---
else if ($action == 'save_progress') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $input['id'] ?? 0;
    $coins = $input['specialCoins'] ?? 0;
    $defenders = json_encode($input['unlockedDefenders'] ?? []);
    $calculator_completed = isset($input['calculatorCompleted']) && $input['calculatorCompleted'] ? 1 : 0;
    $rewards_data = json_encode($input['rewardsData'] ?? []);
    $achievements_data = json_encode($input['achievementsData'] ?? []);
    $story_progress = json_encode($input['storyProgress'] ?? []);

    if (empty($id)) {
         echo json_encode(['error' => 'Se requiere el ID de usuario para guardar el progreso.']);
         exit();
    }

    $stmt = $conn->prepare("UPDATE users SET special_coins = ?, unlocked_defenders = ?, calculator_completed = ?, rewards_data = ?, achievements_data = ?, story_progress = ? WHERE id = ?");
    $stmt->bind_param("isssssi", $coins, $defenders, $calculator_completed, $rewards_data, $achievements_data, $story_progress, $id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Progress saved']);
    } else {
        echo json_encode(['error' => 'Could not save progress.']);
    }
}

else {
    echo json_encode(['error' => 'Invalid action']);
}

$conn->close();
?>