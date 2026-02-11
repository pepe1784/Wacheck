<?php
// ====================================
// check-session.php - Middleware de Autenticación
// ====================================
// Verifica que el usuario tenga sesión válida
// Incluir al inicio de páginas protegidas
// ====================================

// Iniciar sesión con configuración segura
session_start([
    'cookie_httponly' => true,
    'cookie_samesite' => 'Lax',
    'cookie_secure' => false, // Cambiar a true en producción con HTTPS
    'use_strict_mode' => true
]);

// Verificar si hay sesión activa
if (!isset($_SESSION['user_id']) || !isset($_SESSION['username'])) {
    // No hay sesión - redirigir a landing
    header('Location: landing.html');
    exit();
}

// Verificar tiempo de inactividad (2 horas)
if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity']) > 7200) {
    // Sesión expirada
    session_unset();
    session_destroy();
    header('Location: landing.html?timeout=1');
    exit();
}

// Actualizar última actividad
$_SESSION['last_activity'] = time();

// Regenerar ID de sesión cada 30 minutos
if (!isset($_SESSION['created_at'])) {
    $_SESSION['created_at'] = time();
} elseif (time() - $_SESSION['created_at'] > 1800) {
    session_regenerate_id(true);
    $_SESSION['created_at'] = time();
}

// Usuario autenticado - continuar
$currentUser = [
    'id' => $_SESSION['user_id'],
    'username' => $_SESSION['username'],
    'email' => $_SESSION['email'] ?? ''
];
