<?php
// ====================================
// EnvLoader.php - Cargador de variables de entorno
// ====================================

class EnvLoader {
    /**
     * Cargar archivo .env
     */
    public static function load($path) {
        if (!file_exists($path)) {
            throw new Exception(".env file not found at: $path");
        }
        
        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        
        foreach ($lines as $line) {
            // Ignorar comentarios
            if (strpos(trim($line), '#') === 0) {
                continue;
            }
            
            // Parsear línea
            if (strpos($line, '=') !== false) {
                list($key, $value) = explode('=', $line, 2);
                $key = trim($key);
                $value = trim($value);
                
                // Remover comillas
                $value = self::removeQuotes($value);
                
                // Establecer variable de entorno
                if (!getenv($key)) {
                    putenv("$key=$value");
                    $_ENV[$key] = $value;
                    $_SERVER[$key] = $value;
                }
            }
        }
    }
    
    /**
     * Remover comillas de valores
     */
    private static function removeQuotes($value) {
        if ((substr($value, 0, 1) === '"' && substr($value, -1) === '"') ||
            (substr($value, 0, 1) === "'" && substr($value, -1) === "'")) {
            return substr($value, 1, -1);
        }
        return $value;
    }
    
    /**
     * Obtener variable de entorno con valor por defecto
     */
    public static function get($key, $default = null) {
        $value = getenv($key);
        return $value !== false ? $value : $default;
    }
    
    /**
     * Verificar si variable existe
     */
    public static function has($key) {
        return getenv($key) !== false;
    }
}
