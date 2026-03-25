<?php
// ====================================
// logout.php - Cerrar Sesión
// ====================================

session_start();

// Destruir todas las variables de sesión
$_SESSION = array();

// Eliminar la cookie de sesión
if (isset($_COOKIE[session_name()])) {
    $secure = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
    setcookie(session_name(), '', [
        'expires' => time() - 42000,
        'path' => '/',
        'secure' => $secure,
        'httponly' => true,
        'samesite' => 'Lax'
    ]);
}

// Destruir la sesión
session_destroy();

// Redirigir a landing
header('Location: landing.html');
exit();
