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

// Referencia al formulario
const form = document.getElementById('registration-form');

// Escucha el evento de envío
form.addEventListener('submit', (event) => {
    event.preventDefault(); // Evita el envío del formulario

    // Captura los valores de los campos
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Valida que las contraseñas coincidan
    if (password !== confirmPassword) {
        alert('Las contraseñas no coinciden. Por favor, inténtalo de nuevo.');
        return;
    }

    // Guarda los valores en localStorage
    localStorage.setItem('name', name);
    localStorage.setItem('email', email);
    localStorage.setItem('password', password); // Nota: No es seguro guardar contraseñas así

    alert('¡Registro guardado con éxito en localStorage!');

    // Opcional: Vaciar el formulario
    form.reset();
});

// Opcional: Cargar datos desde localStorage al recargar la página
window.addEventListener('load', () => {
    const savedName = localStorage.getItem('name');
    const savedEmail = localStorage.getItem('email');

    if (savedName) document.getElementById('name').value = savedName;
    if (savedEmail) document.getElementById('email').value = savedEmail;
});
