// Llamar la función JSON para obtener los productos de ropa
var productos = [];
async function getRopa() {
    try {
        const response = await fetch('/ropa');
        if (!response.ok) {
            throw new Error('Error cargando JSON');
        }
        productos = await response.json();
        if (document.body.id === "index") addMoreProducts();
    } catch (error) {
    }
}
getRopa();

let productosCargados = 0;
const productosPorPagina = 4;
let cartItems = JSON.parse(localStorage.getItem('cart')) || []; // Recuperar carrito guardado

// -------------------------------------------------------------------empieza el codigo de los favoritos ---------
// Función para agregar o eliminar un producto de favoritos
async function toggleFavorite(productId) {
    if (!productId) {
        showNotification("Error: producto_id no válido.");
        return;
    }

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
        showNotification("Debes iniciar sesión para usar favoritos.");
        return;
    }

    try {
        const response = await fetch('/api/favorites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ producto_id: Number(productId) }) // Asegurar que es un número
        });

        const result = await response.json();
        showNotification(result.message);
        updateFavoriteButton(productId);
        loadFavorites();
    } catch (error) {
    }
}

// Función para actualizar el estado del botón de favoritos
async function updateFavoriteButton(productId) {
    try {
        const response = await fetch('/api/favorites');
        if (!response.ok) throw new Error("Error al obtener favoritos");

        const favoritos = await response.json();
        const isFavorite = favoritos.includes(productId);

        const button = document.querySelector(`.favorite-button[data-id="${productId}"]`);
        if (button) {
            button.innerHTML = isFavorite ? "❤️" : "🤍";
        }
    } catch (error) {
        console.error("Error al actualizar botones de favoritos:", error);
    }
}

// Función para cargar los favoritos del usuario autenticado
async function loadFavorites() {
    if (!localStorage.getItem("user")) return;
    try {
        const response = await fetch('/api/favorites');
        if (!response.ok) throw new Error("Error al obtener favoritos");

        const favoritos = await response.json();
        displayFavorites(favoritos);

        favoritos.forEach(updateFavoriteButton);
    } catch (error) {
        console.error("Error al cargar favoritos:", error);
    }
}

// Función para mostrar los productos favoritos en el modal
function displayFavorites(favoritos) {
    const favoritesContainer = document.getElementById("favorites-items");
    favoritesContainer.innerHTML = "";

    if (favoritos.length === 0) {
        favoritesContainer.innerHTML = "<p>No tienes productos en favoritos.</p>";
        return;
    }

    favoritos.forEach(productId => {
        const producto = productos.find(p => p.id === productId);
        if (!producto) return;

        const itemElement = document.createElement("div");
        itemElement.classList.add("favorite-item");
        itemElement.innerHTML = `
            <img src="${producto.imagenes[0]}" alt="${producto.titulo}">
            <h3>${producto.titulo}</h3>
            <p>${producto.precio}</p>
            <button onclick="toggleFavorite(${productId})">Eliminar</button>
        `;
        favoritesContainer.appendChild(itemElement);
    });
}

// Mostrar el modal de favoritos
function showFavorites() {
    document.getElementById("favoritesModal").style.display = "block";
    loadFavorites();
}

// Cerrar el modal de favoritos
function closeFavorites() {
    document.getElementById("favoritesModal").style.display = "none";
}

// Ejecutar al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    loadFavorites();
});

// -------------------------------------------------------------------Empieza el codigo de rezeñas ---------
// Función para añadir reseñas a los productos en el modal
function addReview() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
        showNotification("Debes iniciar sesión para dejar una reseña.");
        return;
    }

    const productIndex = document.getElementById("expandedImg").dataset.productIndex;
    if (!productIndex) {
        console.error("Error: No se encontró el índice del producto.");
        return;
    }
    // Obtener los valores de los campos de la reseña
    const nameInput = document.getElementById("review-name-modal");
    const commentInput = document.getElementById("review-comment-modal");
    const ratingInput = document.getElementById("review-rating-modal");
    const reviewsContainer = document.getElementById("reviews-modal");

    const name = nameInput.value.trim();
    const comment = commentInput.value.trim();
    const rating = ratingInput.value;

    if (!name || !comment) {
        showNotification("Por favor, completa todos los campos de la reseña.");
        return;
    }

    const review = { name, comment, rating };
    // Guardar la reseña en localStorage
    let reviews = JSON.parse(localStorage.getItem(`reviews-${productIndex}`)) || [];
    reviews.push(review);
    localStorage.setItem(`reviews-${productIndex}`, JSON.stringify(reviews));
    // Limpiar los campos después de guardar la reseña
    nameInput.value = "";
    commentInput.value = "";
    ratingInput.value = "5";

    displayReviews(productIndex);
}

// Función para calcular el promedio de calificación de un producto
function getAverageRating(productIndex) {
    let reviews = JSON.parse(localStorage.getItem(`reviews-${productIndex}`)) || [];
    if (reviews.length === 0) return "Sin calificaciones";
    
    let total = reviews.reduce((sum, review) => sum + parseInt(review.rating), 0);
    let average = total / reviews.length;
    // Función para mostrar las reseñas en el modal
    return '⭐'.repeat(Math.round(average)) + ` (${reviews.length} reseñas)`;
}

// Función para mostrar las reseñas en el modal
function displayReviews(productIndex) {
    const reviewsContainer = document.getElementById("reviews-modal");
    if (!reviewsContainer) {
        console.error("Error: No se encontró el contenedor de reseñas.");
        return;
    }

    const user = JSON.parse(localStorage.getItem("user"));
    const reviewSection = document.querySelector(".add-review");
    // Muestra la sección de añadir reseña solo si el usuario está autenticado
    if (reviewSection) {
        reviewSection.style.display = user ? "block" : "none";
    }

    reviewsContainer.innerHTML = "";
    const reviews = JSON.parse(localStorage.getItem(`reviews-${productIndex}`)) || [];

    if (reviews.length === 0) {
        reviewsContainer.innerHTML = "<p>No hay reseñas aún.</p>";
    } else {
    reviews.forEach(review => {
        const reviewElement = document.createElement("div");
        reviewElement.classList.add("review");
        reviewElement.innerHTML = `
            <p><strong>${review.name}</strong> - ${'⭐'.repeat(review.rating)}</p>
            <p>${review.comment}</p>
        `;
        reviewsContainer.appendChild(reviewElement);
    });
}

// Actualizar la calificación en Products
const ratingElement = document.getElementById(`product-rating-${productIndex}`);
if (ratingElement) {
    ratingElement.innerHTML = getAverageRating(productIndex);
}
}
// -----------------------------------------------------------------------empeza el codigo de carrito
// Función para añadir un producto al carrito
function addToCart(titulo, precio, productIndex) {
    const talla = selectedTallas[productIndex]; // Obtener la talla seleccionada para el producto específico

    if (!talla) {
        showNotification('Por favor, selecciona una talla.');
        return;
    }

    // Agregar producto al carrito
    cartItems.push({ titulo, precio, talla });
    updateLocalStorageCart(); 
    updateCartCount(); 
    showNotification(`"${titulo}" (Talla: ${talla}) fue añadido al carrito.`);
}

// Función para mostrar el carrito en un modal
function showCart() {
    const cartModal = document.getElementById("cartModal");
    const cartItemsContainer = document.getElementById("cart-items");

    cartItemsContainer.innerHTML = '';

    if (cartItems.length > 0) {
        let totalPrice = 0;

        cartItems.forEach((item, index) => {
            const precioLimpio = parseFloat(item.precio.replace(/[^0-9.-]+/g, ''));
            if (!isNaN(precioLimpio)) {
                totalPrice += precioLimpio;
            }

            const itemElement = document.createElement('div');
            itemElement.classList.add('item');
            itemElement.innerHTML = `
                <h3>${item.titulo} (Talla: ${item.talla})</h3>
                <p>Precio: ${item.precio}</p>
                <button onclick="removeFromCart(${index})">Eliminar</button>
            `;
            cartItemsContainer.appendChild(itemElement);
        });

        const cartFooter = document.createElement('div');
        cartFooter.className = 'cart-footer';

        // Mostrar el total del carrito
        const totalElement = document.createElement('div');
        totalElement.className = 'total-price';
        totalElement.innerHTML = `Total: ${totalPrice.toFixed(2)}`;
        cartFooter.appendChild(totalElement);
        
        // Botón para vaciar el carrito
        const emptyCartButton = document.createElement('button');
        emptyCartButton.textContent = 'Vaciar Carrito';
        emptyCartButton.className = 'empty-cart-btn';
        emptyCartButton.onclick = emptyCart;
        cartFooter.appendChild(emptyCartButton);
        
        // Botón para finalizar la compra
        const checkoutButton = document.createElement('button');
        checkoutButton.textContent = 'Finalizar Compra';
        checkoutButton.onclick = checkout;
        cartFooter.appendChild(checkoutButton);

        cartItemsContainer.appendChild(cartFooter);
    } else {
        cartItemsContainer.innerHTML = '<p>El carrito está vacío.</p>';
    }

    cartModal.style.display = "block";
}

// Función para eliminar un producto del carrito
function removeFromCart(index) {
    cartItems.splice(index, 1);
    updateLocalStorageCart(); // Guardar en localStorage
    updateCartCount(); // Actualizar contador
    showCart();
    showNotification('Producto eliminado del carrito.');
}

// Función para vaciar el carrito completamente
function emptyCart() {
    cartItems = [];
    updateLocalStorageCart(); // Guardar en localStorage
    updateCartCount(); // Actualizar contador
    showCart();
    showNotification('El carrito ha sido vaciado.');
}
// Función para cerrar el modal del carrito
function closeCart() {
    document.getElementById("cartModal").style.display = "none";
}

// Función para actualizar el almacenamiento del carrito
function updateLocalStorageCart() {
    localStorage.setItem('cart', JSON.stringify(cartItems));
}

// Función para actualizar el contador del carrito
function updateCartCount() {
    document.getElementById('cart-count').innerText = cartItems.length;
}

// Función placeholder para finalizar compra
function checkout() {
    showNotification("Funcionalidad de finalizar compra aún no implementada.");
}

// Cargar el carrito al iniciar la página
document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();
});

// -----------------------------------------------------empieza el codigo de notificaciones
// Función para mostrar una notificación emergente
function showNotification(mensaje, tipo = 'info') {
    let notificationContainer = document.getElementById('notification-container');
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        document.body.appendChild(notificationContainer);
    }

    const notification = document.createElement('div');
    notification.className = `notification ${tipo}`;
    notification.textContent = mensaje;
    notificationContainer.appendChild(notification);
    // Eliminar la notificación después de 3 segundos
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// ---------------------------------------------------------------empieza el codigo de la galeria de imagenes
let currentImageIndex = 0; // Almacenar la imagen actual en el modal
// Función para expandir la imagen de un producto en el modal
function expandImage(img, index) {
    const modal = document.getElementById("imageModal");
    const expandedImg = document.getElementById("expandedImg");
    const modalTitle = document.getElementById("modal-title");
    const modalPrice = document.getElementById("modal-price");
    const modalDescription = document.getElementById("modal-description");
    const modalCare = document.getElementById("modal-care");
    const reviewsContainer = document.getElementById("reviews-modal");

    if (!productos || productos.length === 0 || index >= productos.length) {
        console.error("Error: Producto no encontrado en la lista.");
        return;
    }

    const producto = productos[index];
    // Actualizar la información del modal con los datos del producto
    expandedImg.src = producto.imagenes[0];
    modalTitle.textContent = producto.titulo;
    modalPrice.textContent = `Precio: ${producto.precio}`;
    modalDescription.textContent = producto.descripcion ? `Descripción: ${producto.descripcion}` : "Sin descripción.";
    modalCare.textContent = producto.cuidados ? `Cuidados: ${producto.cuidados}` : "No se especifican cuidados.";
    expandedImg.dataset.productIndex = index;
    
    modal.style.display = "block";
    displayReviews(index);
}

// Función para cambiar la imagen dentro del modal
function changeModalImage(direction) {
    const expandedImg = document.getElementById("expandedImg");
    const productIndex = expandedImg.dataset.productIndex;
    const producto = productos[productIndex];

    if (!producto || !producto.imagenes || producto.imagenes.length === 0) return;
    
    currentImageIndex += direction;
    if (currentImageIndex < 0) currentImageIndex = producto.imagenes.length - 1;
    if (currentImageIndex >= producto.imagenes.length) currentImageIndex = 0;
    
    expandedImg.src = producto.imagenes[currentImageIndex];
}

// Función para cerrar el modal
function closeModal() {
    document.getElementById("imageModal").style.display = "none";
}
// ----------------------------------------------------------------------------empieza el codigo de la busqueda
// Evento de búsqueda en tiempo real
document.getElementById('search-input').addEventListener('input', () => {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const productRow = document.getElementById('product-row');

    if (searchTerm.trim() === '') {
        // Si el campo de búsqueda está vacío, mostrar todos los productos
        productRow.innerHTML = '';
        productosCargados = 0;
        addMoreProducts();
    } else {
        // Filtrar los productos según el término de búsqueda
        productRow.innerHTML = '';
        const filteredProducts = productos.filter(producto =>
            producto.titulo.toLowerCase().includes(searchTerm)
        );

        if (filteredProducts.length > 0) {
            // Mostrar los productos que coinciden con la búsqueda
            filteredProducts.forEach(producto => {
                const productElement = document.createElement('div');
                productElement.classList.add('product');
                productElement.innerHTML = `
                    <div class="product-images">
                        <img src="${producto.imagenes[0]}" alt="${producto.titulo}">
                    </div>
                    <div class="product-info">
                        <h2 class="product-title">${producto.titulo}</h2>
                        <p class="product-price">${producto.precio}</p>
                    </div>
                `;
                productRow.appendChild(productElement);
            });
        } else {
            // Mostrar mensaje si no se encontraron productos
            productRow.innerHTML = '<p>No se encontraron productos.</p>';
        }
    }
});

// ---------------------------------------------------------------------------empieza el codigo de las tallas
// Objeto para almacenar las tallas seleccionadas
const selectedTallas = {};

// Función para seleccionar una talla
function selectTalla(productIndex, talla) {
    selectedTallas[productIndex] = talla; // Guardar la talla seleccionada para el producto específico
    highlightSelectedTalla(productIndex, talla); // Resaltar la talla seleccionada
}

// Función para resaltar la talla seleccionada
function highlightSelectedTalla(productIndex, talla) {
    // Seleccionar todos los botones de tallas del producto específico
    const tallaButtons = document.querySelectorAll(`#product-row .product:nth-child(${productIndex + 1}) .talla-button`);
    
    // Resaltar la talla seleccionada y desresaltar las demás
    tallaButtons.forEach(button => {
        if (button.textContent === talla) {
            button.classList.add('selected-talla'); // Añadir clase para resaltar
        } else {
            button.classList.remove('selected-talla'); // Quitar resaltado de otras tallas
        }
    });
}

// Función para cargar más productos en la página
function addMoreProducts() {
    const productRow = document.getElementById('product-row');
    const totalProductos = productos.length;

    for (let i = productosCargados; i < productosCargados + productosPorPagina && i < totalProductos; i++) {
        const producto = productos[i];
        const productElement = document.createElement('div');
        productElement.classList.add('product');

        const tallasButtons = Object.keys(producto.tallas).map(talla => `
            <button class="talla-button" onclick="selectTalla(${i}, '${talla}')">${talla}</button>
        `).join('');

        productElement.innerHTML = `
            <div class="product-images">
                <img id="main-image-${i}" src="${producto.imagenes[0]}" alt="${producto.titulo}" onclick="expandImage(this, ${i})">
            </div>
            <div class="product-info">
                <div class="button-container">
                    <div>
                        <button class="favorite-button" data-id="${producto.id}" onclick="toggleFavorite(${producto.id})">🤍</button>
                        <button class="add-to-cart" onclick="addToCart('${producto.titulo}', '${producto.precio}', ${i})"><i class="fa-solid fa-cart-shopping" style="color:rgb(42, 40, 48);"></i></button>
                    </div>
                    <div class="tallas-container">${tallasButtons}</div>
                </div>
                <h2 class="product-title">${producto.titulo}</h2>
                <p class="product-price">${producto.precio}</p>
                <p class="product-rating" id="product-rating-${i}">${getAverageRating(i)}</p>
            </div>
        `;

        productRow.appendChild(productElement);
        updateFavoriteButton(producto.id);
    }

    productosCargados += productosPorPagina;
    if (productosCargados >= totalProductos) {
        document.querySelector('.add-more').style.display = 'none';
    }
}

//------------------------------------------------------aqui empieza el codigo de la validacion de los formularios
function sanitizeInput(input) {
    return input.replace(/</g, "&lt;").replace(/>/g, "&gt;").trim();
}

document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById('registration-form');
    const loginForm = document.getElementById("login-form");
    const loginButton = document.querySelector(".boton-estilo:nth-child(2)");
    const showRegister = document.getElementById("show-register");
    const phoneInput = document.getElementById("tel");
    const userInfo = document.getElementById("user-info");
    const userNameDisplay = document.getElementById("user-name");
    const logoutButton = document.getElementById("logout-button");
    
    /* Función para verificar si el usuario está logueado */
    function checkLoginStatus() {
        const user = localStorage.getItem("user");
        if (user) {
            userInfo.style.display = "inline-block";
            userNameDisplay.textContent = JSON.parse(user).name;
        } else {
            userInfo.style.display = "none";
        }
    }

    /* Función para cerrar sesión y eliminar datos del usuario */
    logoutButton.addEventListener("click", () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        showNotification("Sesión cerrada");
        window.location.reload();
    });

    if (!registerForm) return;

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


    /* Función para manejar el registro de usuario */
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        

        if (password.length < 8) {
            showNotification("La contraseña debe tener al menos 8 caracteres.", "error");
            return;
        }

        if (password !== confirmPassword) {
            showNotification("Las contraseñas no coinciden.", "error");
            return;
        }
    
        const formData = new FormData(e.target);
        const userData = {
            name: sanitizeInput(formData.get('name')),
            username: sanitizeInput(formData.get('username')),
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
                showNotification('Registro exitoso. Redirigiendo...', 'success');
                localStorage.setItem("user", JSON.stringify({ name: userData.name }));
                setTimeout(() => {
                    window.location.href = 'index.html';}, 2000);
            } else {
                const error = await response.text();
                showNotification(`Error: ${error}`, 'error');
            }
        } catch (err) {
            showNotification(`Error de conexión: ${err.message}`, 'error'); 
        }
    });


    /* Función para manejar el inicio de sesión */
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
                showNotification('Inicio de sesión exitoso. Redirigiendo...', 'success'); 
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify({ username: data.username }));
    
                setTimeout(() => {
                    window.location.href = 'index.html';}, 2000);
            } else {
                const error = await response.text();
                showNotification(`Error: ${error}`, 'error');
            }
        } catch (err) {
            showNotification(`Error de conexión: ${err.message}`, 'error'); 
        }
    });

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

/* Función para manejar el inicio de sesión, debe de estar fora de otra function o no funcionarar en el index */
function updateUserInterface() {
    const user = JSON.parse(localStorage.getItem("user"));
    const userInfo = document.getElementById("user-info");
    const userNameDisplay = document.getElementById("user-name");
    const loginLink = document.querySelector('nav .nav-links li a[href="suscripcion.html"]');

    if (user) {
        userInfo.style.display = "inline-block"; // Mostrar la sección de usuario logueado
        userNameDisplay.textContent = user.username; // Mostrar el nombre de usuario
        if (loginLink) loginLink.style.display = "none"; // Ocultar "Entrar/Suscribirte"
    } else {
        userInfo.style.display = "none"; // Ocultar la sección de usuario logueado
        if (loginLink) loginLink.style.display = "inline-block"; // Mostrar "Entrar/Suscribirte"
    }
}
updateUserInterface();