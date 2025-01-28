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

function addToCart(titulo, precio) {
    cartCount++; // Incrementar el contador del carrito
    document.getElementById('cart-count').innerText = cartCount; // Actualizar el contador en el header

    // Agregar producto al carrito
    cartItems.push({ titulo, precio });

    // Mostrar la notificación
    showNotification(`"${titulo}" fue añadido al carrito.`);
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
                <h3>${item.titulo}</h3>
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

function expandImage(img) {
    const modal = document.getElementById("imageModal");
    const expandedImg = document.getElementById("expandedImg");
    modal.style.display = "block";
    expandedImg.src = img.src;
}

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

        productElement.innerHTML = `
            <div class="product-images">
                <img id="main-image-${i}" src="${producto.imagenes[0]}" alt="${producto.titulo} Imagen Principal" onclick="expandImage(this)">
                <div class="product-thumbnails">
                    <img onclick="changeImage('main-image-${i}', '${producto.imagenes[0]}')" src="${producto.imagenes[0]}" alt="Imagen 1">
                    <img onclick="changeImage('main-image-${i}', '${producto.imagenes[1]}')" src="${producto.imagenes[1]}" alt="Imagen 2">
                    <img onclick="changeImage('main-image-${i}', '${producto.imagenes[2]}')" src="${producto.imagenes[2]}" alt="Imagen 3">
                </div>
            </div>
            <div class="product-info">
                <h2 class="product-title">${producto.titulo}</h2>
                <p class="product-price">${producto.precio}</p>
                <button class="add-to-cart" onclick="addToCart('${producto.titulo}', '${producto.precio}')">Añadir al Carrito</button>
            </div>
        `;

        productRow.appendChild(productElement);
    }

    productosCargados += productosPorPagina;

    if (productosCargados >= totalProductos) {
        document.querySelector('.add-more').style.display = 'none';
    }
}
