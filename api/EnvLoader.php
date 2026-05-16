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

    /**
     * Carga automática con rutas de respaldo.
     * Busca .env en el directorio actual, raíz del proyecto y,
     * lo más importante, en el directorio HOME del servidor
     * (fuera de public_html, por encima del alcance del deploy de GitHub).
     *
     * Estructura típica en Hostinger:
     *   /home/u123456/              ← HOME (seguro, deploy nunca toca aquí)
     *   /home/u123456/public_html/  ← web root
     *   /home/u123456/public_html/api/  ← $callerDir
     *
     * Sube el .env a /home/u123456/.env-wacheck una sola vez por FTP/FileManager.
     * Nunca más se borrará.
     */
    public static function loadAuto($callerDir) {
        $candidates = [
            // 1. Ubicación estándar (desarrollo local / primera vez)
            $callerDir . '/.env',
            // 2. Raíz del proyecto
            dirname($callerDir) . '/.env',
            // 3. Directorio HOME (2 niveles sobre api/ cuando proyecto = public_html/)
            dirname(dirname($callerDir)) . '/.env-wacheck',
            dirname(dirname($callerDir)) . '/.env',
            // 4. Directorio HOME (3 niveles sobre api/ cuando proyecto = public_html/Wacheck/)
            dirname(dirname(dirname($callerDir))) . '/.env-wacheck',
            dirname(dirname(dirname($callerDir))) . '/.env',
        ];

        foreach ($candidates as $path) {
            if (file_exists($path) && is_readable($path)) {
                self::load($path);
                return;
            }
        }

        // Si ninguna ruta funciona, lanzar error con rutas revisadas para facilitar debug
        throw new Exception('.env no encontrado. Rutas revisadas: ' . implode(', ', $candidates));
    }
}
