<?php
/**
 * Verificación de Sesión Simple
 * Compatible con user_handler_HYBRID.php
 */

// Iniciar sesión si no está iniciada
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Verificar si hay sesión activa
$isLoggedIn = isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true && isset($_SESSION['user_id']);

// Si no hay sesión y no estamos en landing.html, redirigir
if (!$isLoggedIn) {
    $currentPage = basename($_SERVER['PHP_SELF']);
    
    // Páginas que no requieren login
    $publicPages = ['index.html', 'landing.html', 'landing.php', 'test_api.php', 'upload.html', 'game-page.html'];
    
    // Si no es una página pública, redirigir
    if (!in_array($currentPage, $publicPages)) {
        // Si es una petición AJAX, devolver 401
        if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
            http_response_code(401);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'No autorizado', 'redirect' => 'landing.html']);
            exit;
        }
        
        // Si es petición normal, redirigir
        header('Location: index.html');
        exit;
    }
}

// Si hay sesión y estamos en index.html, redirigir a game-page.html
if ($isLoggedIn) {
    $currentPage = basename($_SERVER['PHP_SELF']);
    if (in_array($currentPage, ['index.html', 'index.php', 'landing.html', 'landing.php'])) {
        header('Location: game-page.html');
        exit;
    }
}

// Retornar true para que el script que incluye este archivo continúe
return true;
