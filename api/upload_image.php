<?php
// Evitar cualquier salida antes del JSON
// Mostrar errores mínimos para diagnóstico local (puedes desactivar en producción)
error_reporting(E_ALL & ~E_NOTICE & ~E_DEPRECATED);
ini_set('display_errors', 1);

// CORS - permitir que Live Share u otros clientes locales hagan requests
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With, X-File-Name');
header('Content-Type: application/json; charset=utf-8');

// Responder a preflight CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'CORS preflight']);
    exit;
}

try {
    // Listar carpetas de sounds
    if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'list_folders') {
        $soundsDir = '../sounds/';
        $folders = ['sounds' => '/']; // Raíz
        
        if (is_dir($soundsDir)) {
            $items = scandir($soundsDir);
            foreach ($items as $item) {
                if ($item !== '.' && $item !== '..' && is_dir($soundsDir . $item)) {
                    $folders[$item] = '/' . $item;
                }
            }
        }
        
        echo json_encode(['success' => true, 'folders' => $folders]);
        exit;
    }
    
    // Crear nueva carpeta en sounds
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'create_folder') {
        $folderName = basename($_POST['folder_name']);
        $soundsDir = '../sounds/';
        $newFolder = $soundsDir . $folderName;
        
        if (empty($folderName)) {
            echo json_encode(['success' => false, 'error' => 'Nombre de carpeta vacío']);
            exit;
        }
        
        if (file_exists($newFolder)) {
            echo json_encode(['success' => false, 'error' => 'La carpeta ya existe']);
            exit;
        }
        
        if (mkdir($newFolder, 0777, true)) {
            echo json_encode(['success' => true, 'folder' => $folderName]);
        } else {
            echo json_encode(['success' => false, 'error' => 'No se pudo crear la carpeta']);
        }
        exit;
    }
    
    // Subir archivo
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['file'])) {
        $fileName = basename($_FILES['file']['name']);
        $fileExt = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
        
        // Determinar tipo de archivo y carpeta destino
        $imageTypes = ['jpg', 'jpeg', 'png'];
        $audioTypes = ['mp3'];
        
        if (in_array($fileExt, $imageTypes)) {
            // Es una imagen - va a img/img_icono
            $uploadDir = '../img/img_icono/';
            $fileType = 'image';
            
            // Verificar que sea una imagen real
            $check = getimagesize($_FILES['file']['tmp_name']);
            if ($check === false) {
                echo json_encode(['success' => false, 'error' => 'El archivo no es una imagen válida']);
                exit;
            }
            
        } elseif (in_array($fileExt, $audioTypes)) {
            // Es audio - va a sounds (con subcarpeta opcional)
            $subfolder = isset($_POST['subfolder']) ? trim($_POST['subfolder']) : '';
            $uploadDir = '../sounds/';
            
            if (!empty($subfolder) && $subfolder !== '/') {
                $subfolder = basename($subfolder); // Seguridad
                $uploadDir .= $subfolder . '/';
            }
            
            $fileType = 'audio';
            
        } else {
            echo json_encode(['success' => false, 'error' => 'Tipo de archivo no permitido. Solo imágenes (JPG, PNG) o audio (MP3)']);
            exit;
        }
        
        // Limites de tamaño (ajustables)
        $size = isset($_FILES['file']['size']) ? (int)$_FILES['file']['size'] : 0;
        if ($fileType === 'image' && $size > 5 * 1024 * 1024) { // 5 MB
            http_response_code(413);
            echo json_encode(['success' => false, 'error' => 'Imagen demasiado grande (límite 5MB)']);
            exit;
        }
        if ($fileType === 'audio' && $size > 15 * 1024 * 1024) { // 15 MB
            http_response_code(413);
            echo json_encode(['success' => false, 'error' => 'Audio demasiado grande (límite 15MB)']);
            exit;
        }

        // Crear carpeta si no existe
        if (!file_exists($uploadDir)) {
            if (!mkdir($uploadDir, 0777, true)) {
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'No se pudo crear la carpeta de destino']);
                exit;
            }
        }

        // Generar nombre único para evitar sobreescrituras
        $baseName = pathinfo($fileName, PATHINFO_FILENAME);
        $baseNameSafe = preg_replace('/[^A-Za-z0-9_-]/', '_', $baseName);
        $uniqueSuffix = uniqid('_', true);
        $newFileName = $baseNameSafe . $uniqueSuffix . '.' . $fileExt;
        $targetPath = $uploadDir . $newFileName;

        // Subir archivo
        if (is_uploaded_file($_FILES['file']['tmp_name']) && move_uploaded_file($_FILES['file']['tmp_name'], $targetPath)) {
            $relativePath = str_replace('../', './', $uploadDir) . $newFileName;
            echo json_encode([
                'success' => true,
                'original_name' => $fileName,
                'filename' => $newFileName,
                'path' => $relativePath,
                'type' => $fileType
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Error al mover/guardar el archivo. Verifica permisos de la carpeta en XAMPP (Apache).']);
        }
    } else {
        // Si vienen otros métodos que no son GET/POST, devolver 405
        if (!in_array($_SERVER['REQUEST_METHOD'], ['GET', 'POST'])) {
            http_response_code(405);
            header('Allow: GET, POST, OPTIONS');
            echo json_encode(['success' => false, 'error' => 'Método no permitido']);
            exit;
        }

        echo json_encode(['success' => false, 'error' => 'No se recibió archivo']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error del servidor: ' . $e->getMessage()]);
}
?>
