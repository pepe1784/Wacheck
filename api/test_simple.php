<?php
// Test simple de conexión
header('Content-Type: application/json');

echo json_encode([
    'status' => 'ok',
    'message' => 'API funcionando',
    'timestamp' => time(),
    'php_version' => PHP_VERSION,
    'server' => $_SERVER['SERVER_SOFTWARE']
]);
