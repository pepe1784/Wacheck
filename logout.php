<?php
// ====================================
// logout.php - Cerrar Sesión
// ====================================

session_start();

// Destruir todas las variables de sesión
$_SESSION = array();

// Eliminar la cookie de sesión
if (isset($_COOKIE[session_name()])) {
    setcookie(session_name(), '', time() - 42000, '/');
}

// Destruir la sesión
session_destroy();

// Redirigir a landing
header('Location: landing.html');
exit();
