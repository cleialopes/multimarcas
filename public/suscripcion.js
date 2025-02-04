
//llamar al json de suscripcion
var usuarios = [];
async function getUsuarios() {
    const response = await fetch('/suscriptores');
    if (!response.ok) {
        throw new Error('Error loading JSON');
    }
    // Cargar los usuarios al iniciar la página
    usuarios = await response.json();

}
getUsuarios();
document.getElementById('registration-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    // Crea el FormData a partir del formulario
    const formData = new FormData(e.target);
    try {
      const response = await fetch('/upload', {
        method: 'POST',
        body: formData // Envía el FormData directamente
      });
      if (response.ok) {
        //document.getElementById('mensaje').textContent = 'Alumno añadido correctamente.';
        setTimeout(() => {
          window.location.href = 'index.html'; // Redirige al listado de alumnos.
        }, 2000);
      } else {
        const error = await response.text();
       // document.getElementById('mensaje').textContent = `Error al añadir el alumno: ${error}`;
      }
    } catch (err) {
      //document.getElementById('mensaje').textContent = `Error de conexión: ${err.message}`;
    }
  });

function initMap() {
    const location = { lat: 43.313675, lng: -1.981969 }; // Cambia por las coordenadas de tu tienda
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 12,
        center: location,
    });

    const marker = new google.maps.Marker({
        position: location,
        map: map,
    });
}
window.onload = initMap;

// Función para sanitizar entradas de texto
function sanitizeInput(input) {
    const temp = document.createElement('div');
    temp.textContent = input; // Escapa caracteres HTML
    return temp.innerHTML.trim(); // Devuelve texto escapado y sin espacios extra
}

// Referencia al formulario
const form = document.getElementById('registration-form');

// Escucha el evento de envío
form.addEventListener('submit', (event) => {
    event.preventDefault(); // Evita el envío del formulario

    // Captura y sanitiza los valores de los campos
    const name = sanitizeInput(document.getElementById('name').value);
    const email = sanitizeInput(document.getElementById('email').value);
    const password = sanitizeInput(document.getElementById('password').value);
    const confirmPassword = sanitizeInput(document.getElementById('confirm-password').value);

    // Valida que el correo electrónico tenga un formato válido
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Por favor, ingresa un correo electrónico válido.');
        return;
    }

    // Valida que las contraseñas coincidan
    if (password !== confirmPassword) {
        alert('Las contraseñas no coinciden. Por favor, inténtalo de nuevo.');
        return;
    }

    // Verifica que se cumplan los términos y condiciones
    const termsAccepted = document.getElementById('terms').checked;
    if (!termsAccepted) {
        alert('Debes aceptar los términos y condiciones.');
        return;
    }

    // Validar nombre completo (solo letras y espacios)
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!nameRegex.test(name)) {
    alert('El nombre solo debe contener letras y espacios.');
    return;
    }

    alert('¡Registro exitoso!');

    // Opcional: Vaciar el formulario
    form.reset();
});

// Selecciona el input de la foto y la imagen de previsualización
const photoInput = document.getElementById('photo');
const previewImage = document.getElementById('preview');

// Escucha cambios en el input de archivos
photoInput.addEventListener('change', (event) => {
    const file = event.target.files[0]; // Obtén el archivo seleccionado

    if (file) {
        // Asegúrate de que sea una imagen
        if (file.type === "image/png") {
            const reader = new FileReader(); // Usa FileReader para leer el archivo
            reader.onload = (e) => {
                previewImage.src = e.target.result; // Establece la fuente de la imagen
                previewImage.style.display = 'block'; // Muestra la imagen
            };
            reader.readAsDataURL(file); // Lee el archivo como una URL
        } else {
            alert('Por favor, selecciona un archivo en formato PNG.');
            photoInput.value = ""; // Limpia el campo si el archivo no es válido
            previewImage.style.display = 'none'; // Oculta la imagen
        }
    }
});

// Función para alternar la visibilidad de la contraseña
function togglePasswordVisibility(inputId, toggleId) {
    const passwordInput = document.getElementById(inputId);
    const toggleIcon = document.getElementById(toggleId);

    toggleIcon.addEventListener('click', () => {
        // Cambia el tipo del input entre "password" y "text"
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleIcon.textContent = '🙈'; // Cambia el icono a "ocultar"
        } else {
            passwordInput.type = 'password';
            toggleIcon.textContent = '👁️'; // Cambia el icono a "mostrar"
        }
    });
}

// Llama a la función para los campos de contraseña
togglePasswordVisibility('password', 'toggle-password');
togglePasswordVisibility('confirm-password', 'toggle-confirm-password');