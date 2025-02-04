function sanitizeInput(input) {
    return input.replace(/</g, "&lt;").replace(/>/g, "&gt;").trim();
}

document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById('registration-form');
    const loginForm = document.getElementById("login-form");
    const loginButton = document.querySelector(".boton-estilo:nth-child(2)");
    const showRegister = document.getElementById("show-register");
    const phoneInput = document.getElementById("tel");
    const errorMessage = document.createElement("p");
    errorMessage.style.color = "red";
    registerForm.appendChild(errorMessage);

    if (!registerForm) return;

    // Manejo del registro de usuario
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        const userData = {
            name: sanitizeInput(formData.get('name')),
            telefono: sanitizeInput(formData.get('telefono')),
            email: sanitizeInput(formData.get('email')),
            password: sanitizeInput(formData.get('password')),
        };

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                alert('Registro exitoso');
                window.location.href = 'index.html';
            } else {
                const error = await response.text();
                errorMessage.textContent = `Error: ${error}`;
            }
        } catch (err) {
            errorMessage.textContent = `Error de conexión: ${err.message}`;
        }
    });

    // Manejo del inicio de sesión
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        const loginData = {
            email: sanitizeInput(formData.get('login-email')),
            password: sanitizeInput(formData.get('login-password')),
        };

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginData)
            });

            if (response.ok) {
                const data = await response.json();
                alert('Inicio de sesión exitoso');
                localStorage.setItem("token", data.token);
                window.location.href = 'index.html';
            } else {
                const error = await response.text();
                errorMessage.textContent = `Error: ${error}`;
            }
        } catch (err) {
            errorMessage.textContent = `Error de conexión: ${err.message}`;
        }
    });

    // Alternar visibilidad de contraseñas
    function togglePasswordVisibility(inputId, toggleId) {
        const passwordInput = document.getElementById(inputId);
        const toggleIcon = document.getElementById(toggleId);

        if (toggleIcon) {
            toggleIcon.addEventListener('click', () => {
                passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
                toggleIcon.textContent = passwordInput.type === 'password' ? '👁️' : '🙈';
            });
        }
    }
    
    togglePasswordVisibility('password', 'toggle-password');
    togglePasswordVisibility('confirm-password', 'toggle-confirm-password');

    // Validación del teléfono sin espacios
    phoneInput.addEventListener("input", function () {
        const phonePattern = /^\+34\d{9}$/;
        if (!phonePattern.test(phoneInput.value)) {
            phoneInput.setCustomValidity("Formato inválido. Usa: +34123456789");
        } else {
            phoneInput.setCustomValidity("");
        }
    });

    // Inicializar Google Maps
    function initMap() {
        const location = { lat: 43.313675, lng: -1.981969 };
        const map = new google.maps.Map(document.getElementById("map"), {
            zoom: 12,
            center: location,
        });
        new google.maps.Marker({
            position: location,
            map: map,
        });
    }
    initMap();

    // Gestión de formularios de login y registro
    loginButton.addEventListener("click", (e) => {
        e.preventDefault();
        registerForm.style.display = "none";
        loginForm.style.display = "block";
    });

    showRegister.addEventListener("click", (e) => {
        e.preventDefault();
        loginForm.style.display = "none";
        registerForm.style.display = "block";
    });
});
