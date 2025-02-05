// Llamar la función JSON
var productos = [];
async function getRopa() {
    const response = await fetch('/ropa');
    if (!response.ok) {
        throw new Error('Error loading JSON');
    }
    // Cargar los primeros productos al iniciar la página
    productos = await response.json();
    addMoreProducts();
}
getRopa();

let productosCargados = 0;
const productosPorPagina = 4;
let cartCount = 0; // Contador del carrito
const cartItems = []; // Array para almacenar los productos en el carrito

function addToCart(titulo, precio, productIndex) {
    const talla = selectedTallas[productIndex]; // Obtener la talla seleccionada para el producto específico

    if (!talla) {
        alert('Por favor, selecciona una talla.');
        return;
    }

    cartCount++; // Incrementar el contador del carrito
    document.getElementById('cart-count').innerText = cartCount; // Actualizar el contador en el header

    // Agregar producto al carrito
    cartItems.push({ titulo, precio, talla });

    // Mostrar la notificación
    showNotification(`"${titulo}" (Talla: ${talla}) fue añadido al carrito.`);
}   

function showNotification(mensaje) {
    let notificationContainer = document.getElementById('notification-container');
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        document.body.appendChild(notificationContainer);
    }

    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = mensaje;
    notificationContainer.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

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

        const totalElement = document.createElement('div');
        totalElement.className = 'total-price';
        totalElement.innerHTML = `Total: ${totalPrice.toFixed(2)}`;
        cartFooter.appendChild(totalElement);

        const emptyCartButton = document.createElement('button');
        emptyCartButton.textContent = 'Vaciar Carrito';
        emptyCartButton.className = 'empty-cart-btn';
        emptyCartButton.onclick = emptyCart;
        cartFooter.appendChild(emptyCartButton);

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

function closeCart() {
    document.getElementById("cartModal").style.display = "none";
}

function removeFromCart(index) {
    cartItems.splice(index, 1);
    cartCount--;
    document.getElementById('cart-count').innerText = cartCount;
    showCart();
    showNotification('Producto eliminado del carrito.');
}

function emptyCart() {
    cartItems.length = 0;
    cartCount = 0;
    document.getElementById('cart-count').innerText = cartCount;
    const cartItemsContainer = document.getElementById('cart-items');
    cartItemsContainer.innerHTML = '<p>El carrito está vacío.</p>';
    showNotification('El carrito ha sido vaciado.');
}

function changeImage(mainImageId, newSrc) {
    document.getElementById(mainImageId).src = newSrc;
}

function expandImage(img, index) {
    const modal = document.getElementById("imageModal");
    const expandedImg = document.getElementById("expandedImg");
    const modalTitle = document.getElementById("modal-title");
    const modalPrice = document.getElementById("modal-price");
    const modalDescription = document.getElementById("modal-description");
    const modalCare = document.getElementById("modal-care");

    // Verifica que el índice esté dentro del rango de productos cargados
    if (!productos || productos.length === 0 || index >= productos.length) {
        console.error("Error: Producto no encontrado en la lista.");
        return;
    }

    // Obtener la información del producto
    const producto = productos[index];

    // Verifica que el modal y sus elementos existen
    if (!modal || !expandedImg || !modalTitle || !modalPrice || !modalDescription || !modalCare) {
        console.error("Error: Elementos del modal no encontrados.");
        return;
    }

    // Asignar la información al modal
    expandedImg.src = img.src;
    modalTitle.textContent = producto.titulo;
    modalPrice.textContent = `Precio: ${producto.precio}`;
    modalDescription.textContent = producto.descripcion ? `Descripción: ${producto.descripcion}` : "Sin descripción.";
    modalCare.textContent = producto.cuidados ? `Cuidados: ${producto.cuidados}` : "No se especifican cuidados.";

    // Mostrar el modal
    modal.style.display = "block";
}

// Función para cerrar el modal
function closeModal() {
    document.getElementById("imageModal").style.display = "none";
}


function checkout() {
    alert("Funcionalidad de finalizar compra aún no implementada.");
}

document.getElementById('search-input').addEventListener('input', () => {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const productRow = document.getElementById('product-row');

    if (searchTerm.trim() === '') {
        productRow.innerHTML = '';
        productosCargados = 0;
        addMoreProducts();
    } else {
        productRow.innerHTML = '';
        const filteredProducts = productos.filter(producto =>
            producto.titulo.toLowerCase().includes(searchTerm)
        );

        if (filteredProducts.length > 0) {
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
            productRow.innerHTML = '<p>No se encontraron productos.</p>';
        }
    }
});

function addMoreProducts() {
    const productRow = document.getElementById('product-row');
    const totalProductos = productos.length;

    for (let i = productosCargados; i < productosCargados + productosPorPagina && i < totalProductos; i++) {
        const producto = productos[i];
        const productElement = document.createElement('div');
        productElement.classList.add('product');

        // Generar botones para cada talla
        const tallasButtons = Object.keys(producto.tallas).map(talla => `
            <button class="talla-button" onclick="selectTalla(${i}, '${talla}')">${talla}</button>
        `).join('');

        productElement.innerHTML = `
            <div class="product-images">
                <img id="main-image-${i}" src="${producto.imagenes[0]}" alt="${producto.titulo}" onclick="expandImage(this, ${i})">
                <div class="product-thumbnails">
                    <img onclick="changeImage('main-image-${i}', '${producto.imagenes[0]}')" src="${producto.imagenes[0]}" alt="Imagen 1">
                    <img onclick="changeImage('main-image-${i}', '${producto.imagenes[1]}')" src="${producto.imagenes[1]}" alt="Imagen 2">
                    <img onclick="changeImage('main-image-${i}', '${producto.imagenes[2]}')" src="${producto.imagenes[2]}" alt="Imagen 3">
                </div>
            </div>
            <div class="product-info">
                <h2 class="product-title">${producto.titulo}</h2>
                <p class="product-price">${producto.precio}</p>
                <div class="tallas-container">
                    ${tallasButtons}
                </div>
                <button class="add-to-cart" onclick="addToCart('${producto.titulo}', '${producto.precio}', ${i})">Añadir al Carrito</button>
            </div>
        `;

        productRow.appendChild(productElement);
    }

    productosCargados += productosPorPagina;

    if (productosCargados >= totalProductos) {
        document.querySelector('.add-more').style.display = 'none';
    }
}

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


