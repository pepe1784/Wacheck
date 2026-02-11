<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verificar Email - Wacheck</title>
    <link rel="stylesheet" href="css/landing.css">
    <style>
        .verify-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%);
            padding: 20px;
        }
        .verify-card {
            background: white;
            border-radius: 20px;
            padding: 40px;
            max-width: 500px;
            width: 100%;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        .verify-icon {
            font-size: 80px;
            margin-bottom: 20px;
        }
        .verify-title {
            font-size: 28px;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 15px;
        }
        .verify-message {
            font-size: 16px;
            color: #64748b;
            margin-bottom: 30px;
            line-height: 1.6;
        }
        .verify-button {
            display: inline-block;
            padding: 15px 40px;
            background: #0891b2;
            color: white;
            text-decoration: none;
            border-radius: 10px;
            font-weight: 600;
            transition: all 0.3s;
        }
        .verify-button:hover {
            background: #0e7490;
            transform: translateY(-2px);
        }
        .spinner {
            border: 4px solid #f3f4f6;
            border-top: 4px solid #0891b2;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin: 20px auto;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .error-card {
            border-left: 4px solid #ef4444;
        }
        .success-card {
            border-left: 4px solid #10b981;
        }
    </style>
</head>
<body>
    <div class="verify-container">
        <div class="verify-card" id="verifyCard">
            <div class="spinner"></div>
            <p class="verify-message">Verificando tu email...</p>
        </div>
    </div>

    <script>
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const card = document.getElementById('verifyCard');

        if (!token) {
            showError('Token no encontrado', 'El enlace de verificación es inválido.');
        } else {
            verifyEmail(token);
        }

        async function verifyEmail(token) {
            try {
                const response = await fetch('api/user_handler_SECURE.php?action=verify_email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token })
                });

                const data = await response.json();

                if (data.success) {
                    showSuccess(data.username);
                } else {
                    showError('Error', data.error || 'No se pudo verificar el email');
                }
            } catch (error) {
                console.error('Error:', error);
                showError('Error de conexión', 'No se pudo conectar con el servidor');
            }
        }

        function showSuccess(username) {
            card.className = 'verify-card success-card';
            card.innerHTML = `
                <div class="verify-icon">✅</div>
                <h1 class="verify-title">¡Email Verificado!</h1>
                <p class="verify-message">
                    ¡Hola <strong>${username}</strong>!<br>
                    Tu cuenta ha sido verificada correctamente.<br>
                    Ya puedes iniciar sesión y comenzar a jugar.
                </p>
                <a href="landing.html#login" class="verify-button">Iniciar Sesión</a>
            `;
        }

        function showError(title, message) {
            card.className = 'verify-card error-card';
            card.innerHTML = `
                <div class="verify-icon">❌</div>
                <h1 class="verify-title">${title}</h1>
                <p class="verify-message">${message}</p>
                <a href="landing.html" class="verify-button">Volver al inicio</a>
            `;
        }
    </script>
</body>
</html>
