// Llamar al JSON de suscripción
var usuarios = [];
async function getUsuarios() {
    try {
        const response = await fetch('/suscriptores');
        if (!response.ok) {
            throw new Error('Error cargando JSON');
        }
        usuarios = await response.json();
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
    }
}
getUsuarios();

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById('registration-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        const userData = {
            name: sanitizeInput(formData.get('name')),
            telefono: sanitizeInput(formData.get('telefono')),
            email: sanitizeInput(formData.get('email')),
            password: sanitizeInput(formData.get('password')),
        };

        try {
            const response = await fetch('/upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                alert('Registro exitoso');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            } else {
                const error = await response.text();
                alert(`Error en la suscripción: ${error}`);
            }
        } catch (err) {
            alert(`Error de conexión: ${err.message}`);
        }
    });

    // Validaciones del formulario
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const name = sanitizeInput(document.getElementById('name').value);
        const email = sanitizeInput(document.getElementById('email').value);
        const telefono = sanitizeInput(document.getElementById('tel').value);
        const password = sanitizeInput(document.getElementById('password').value);
        const confirmPassword = sanitizeInput(document.getElementById('confirm-password').value);
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Por favor, ingresa un correo electrónico válido.');
            return;
        }

        const phoneRegex = /\+34\s[0-9]{3}\s[0-9]{3}\s[0-9]{3}/;
        if (!phoneRegex.test(telefono)) {
            alert('El número de teléfono debe seguir el formato +34 123 456 789.');
            return;
        }

        if (password !== confirmPassword) {
            alert('Las contraseñas no coinciden.');
            return;
        }

        if (password.length < 8) {
            alert('La contraseña debe tener al menos 8 caracteres.');
            return;
        }

        const termsAccepted = document.getElementById('terms').checked;
        if (!termsAccepted) {
            alert('Debes aceptar los términos y condiciones.');
            return;
        }

        alert('¡Registro exitoso!');
        form.reset();
    });

    // Vista previa de imagen
    const photoInput = document.getElementById('photo');
    const previewImage = document.getElementById('preview');
    
    if (photoInput) {
        photoInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                if (file.type === "image/png" || file.type === "image/jpeg" || file.type === "image/jpg") {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        previewImage.src = e.target.result;
                        previewImage.style.display = 'block';
                    };
                    reader.readAsDataURL(file);
                } else {
                    alert('Por favor, selecciona un archivo PNG, JPG o JPEG.');
                    photoInput.value = "";
                    previewImage.style.display = 'none';
                }
            }
        });
    }

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
    window.onload = initMap;
});

document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("registration-form");
    const loginButton = document.querySelector(".boton-estilo:nth-child(2)"); // Botón "Entrar"
    const showRegister = document.getElementById("show-register");

    // Mostrar el formulario de login y ocultar el de registro
    loginButton.addEventListener("click", (e) => {
        e.preventDefault();
        registerForm.style.display = "none";
        loginForm.style.display = "block";
    });

    // Volver al formulario de registro desde el login
    showRegister.addEventListener("click", (e) => {
        e.preventDefault();
        loginForm.style.display = "none";
        registerForm.style.display = "block";
    });
});