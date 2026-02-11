<?php
// ====================================
// Security.php - Clase de Seguridad
// ====================================

class Security {
    private static $encryptionKey = null;
    private static $csrfToken = null;
    
    /**
     * Inicializar sistema de seguridad
     */
    public static function init() {
        // Cargar clave de encriptación
        self::$encryptionKey = getenv('ENCRYPTION_KEY');
        
        // Headers de seguridad
        self::setSecurityHeaders();
        
        // Iniciar sesión segura
        self::startSecureSession();
    }
    
    /**
     * Establecer headers de seguridad
     */
    private static function setSecurityHeaders() {
        // Prevenir ataques XSS
        header('X-Frame-Options: DENY');
        header('X-Content-Type-Options: nosniff');
        header('X-XSS-Protection: 1; mode=block');
        
        // Content Security Policy
        header("Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'");
        
        // HSTS (solo en producción)
        if (getenv('APP_ENV') === 'production') {
            header('Strict-Transport-Security: max-age=31536000; includeSubDomains; preload');
        }
        
        // Referrer Policy
        header('Referrer-Policy: strict-origin-when-cross-origin');
        
        // Permissions Policy
        header('Permissions-Policy: geolocation=(), microphone=(), camera=()');
    }
    
    /**
     * Iniciar sesión segura
     */
    private static function startSecureSession() {
        if (session_status() === PHP_SESSION_NONE) {
            ini_set('session.cookie_httponly', getenv('SESSION_COOKIE_HTTPONLY') ?? '1');
            ini_set('session.cookie_secure', getenv('SESSION_COOKIE_SECURE') ?? '0');
            ini_set('session.cookie_samesite', getenv('SESSION_COOKIE_SAMESITE') ?? 'Strict');
            ini_set('session.use_strict_mode', '1');
            ini_set('session.use_only_cookies', '1');
            
            session_start();
            
            // Regenerar ID de sesión periódicamente
            if (!isset($_SESSION['created'])) {
                $_SESSION['created'] = time();
            } else if (time() - $_SESSION['created'] > 1800) {
                session_regenerate_id(true);
                $_SESSION['created'] = time();
            }
        }
    }
    
    /**
     * Sanitizar input
     */
    public static function sanitizeInput($input, $type = 'string') {
        if (is_array($input)) {
            return array_map(function($item) use ($type) {
                return self::sanitizeInput($item, $type);
            }, $input);
        }
        
        switch ($type) {
            case 'string':
                return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
            case 'email':
                return filter_var(trim($input), FILTER_SANITIZE_EMAIL);
            case 'int':
                return filter_var($input, FILTER_SANITIZE_NUMBER_INT);
            case 'float':
                return filter_var($input, FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION);
            case 'url':
                return filter_var(trim($input), FILTER_SANITIZE_URL);
            default:
                return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
        }
    }
    
    /**
     * Validar input
     */
    public static function validateInput($input, $type, $options = []) {
        switch ($type) {
            case 'email':
                return filter_var($input, FILTER_VALIDATE_EMAIL) !== false;
            case 'int':
                $result = filter_var($input, FILTER_VALIDATE_INT, $options);
                return $result !== false;
            case 'float':
                return filter_var($input, FILTER_VALIDATE_FLOAT) !== false;
            case 'url':
                return filter_var($input, FILTER_VALIDATE_URL) !== false;
            case 'username':
                // Solo alfanumérico, guión bajo, 3-50 caracteres
                return preg_match('/^[a-zA-Z0-9_]{3,50}$/', $input);
            case 'password':
                // Mínimo 4 caracteres (puedes hacerlo más estricto)
                return strlen($input) >= 4;
            default:
                return true;
        }
    }
    
    /**
     * Encriptar datos (AES-256-GCM)
     */
    public static function encrypt($data) {
        if (!self::$encryptionKey) {
            throw new Exception('Encryption key not set');
        }
        
        $key = base64_decode(self::$encryptionKey);
        $iv = random_bytes(16);
        $tag = '';
        
        $ciphertext = openssl_encrypt(
            json_encode($data),
            'aes-256-gcm',
            $key,
            OPENSSL_RAW_DATA,
            $iv,
            $tag,
            '',
            16
        );
        
        if ($ciphertext === false) {
            throw new Exception('Encryption failed');
        }
        
        return base64_encode($iv . $tag . $ciphertext);
    }
    
    /**
     * Desencriptar datos
     */
    public static function decrypt($encryptedData) {
        if (!self::$encryptionKey) {
            throw new Exception('Encryption key not set');
        }
        
        $key = base64_decode(self::$encryptionKey);
        $data = base64_decode($encryptedData);
        
        $iv = substr($data, 0, 16);
        $tag = substr($data, 16, 16);
        $ciphertext = substr($data, 32);
        
        $decrypted = openssl_decrypt(
            $ciphertext,
            'aes-256-gcm',
            $key,
            OPENSSL_RAW_DATA,
            $iv,
            $tag
        );
        
        if ($decrypted === false) {
            throw new Exception('Decryption failed');
        }
        
        return json_decode($decrypted, true);
    }
    
    /**
     * Generar token CSRF
     */
    public static function generateCSRFToken() {
        if (!isset($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['csrf_token'];
    }
    
    /**
     * Verificar token CSRF
     */
    public static function verifyCSRFToken($token) {
        return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
    }
    
    /**
     * Hashear contraseña (Argon2id - más seguro que bcrypt)
     */
    public static function hashPassword($password) {
        if (defined('PASSWORD_ARGON2ID')) {
            return password_hash($password, PASSWORD_ARGON2ID, [
                'memory_cost' => 65536,
                'time_cost' => 4,
                'threads' => 2
            ]);
        }
        // Fallback a bcrypt si Argon2id no está disponible
        return password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
    }
    
    /**
     * Verificar contraseña
     */
    public static function verifyPassword($password, $hash) {
        return password_verify($password, $hash);
    }
    
    /**
     * Rate Limiting simple (basado en IP)
     */
    public static function checkRateLimit($identifier, $maxRequests = null, $window = null) {
        $maxRequests = $maxRequests ?? (int)getenv('RATE_LIMIT_REQUESTS');
        $window = $window ?? (int)getenv('RATE_LIMIT_WINDOW');
        
        $key = 'rate_limit_' . $identifier;
        
        if (!isset($_SESSION[$key])) {
            $_SESSION[$key] = [
                'requests' => 1,
                'start_time' => time()
            ];
            return true;
        }
        
        $data = $_SESSION[$key];
        
        // Resetear si pasó la ventana de tiempo
        if (time() - $data['start_time'] > $window) {
            $_SESSION[$key] = [
                'requests' => 1,
                'start_time' => time()
            ];
            return true;
        }
        
        // Verificar límite
        if ($data['requests'] >= $maxRequests) {
            return false;
        }
        
        // Incrementar contador
        $_SESSION[$key]['requests']++;
        return true;
    }
    
    /**
     * Obtener IP del cliente (considerando proxies)
     */
    public static function getClientIP() {
        $ip = $_SERVER['REMOTE_ADDR'];
        
        // Verificar headers de proxy
        if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $ips = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
            $ip = trim($ips[0]);
        } elseif (!empty($_SERVER['HTTP_CLIENT_IP'])) {
            $ip = $_SERVER['HTTP_CLIENT_IP'];
        }
        
        return filter_var($ip, FILTER_VALIDATE_IP) ? $ip : '0.0.0.0';
    }
    
    /**
     * Prevenir timing attacks en comparaciones
     */
    public static function timingSafeCompare($known, $user) {
        if (function_exists('hash_equals')) {
            return hash_equals($known, $user);
        }
        
        // Fallback manual
        $knownLen = strlen($known);
        $userLen = strlen($user);
        $result = $knownLen ^ $userLen;
        
        for ($i = 0; $i < $userLen; $i++) {
            $result |= ord($known[$i % $knownLen]) ^ ord($user[$i]);
        }
        
        return $result === 0;
    }
    
    /**
     * Limpiar output antes de JSON
     */
    public static function cleanOutput() {
        if (ob_get_level()) {
            ob_clean();
        }
    }
}
