// llamar la función JSON
var productos = [];
fetch("ropa.json")
.then ( response =>{ 
    if (!response.ok) {
        throw new Error('Error loading JSON');
    }
    return response. json ();
    })
    .then (data => {
        productos = data;
        console.log (productos);
        // Cargar los primeros productos al iniciar la página
        addMoreProducts(); 
        //renderCart ();
    })
    .catch(error => console.error(error));
    let productosCargados = 0;
    const productosPorPagina = 4;
    let cartCount = 0; // Contador del carrito
    const cartItems = []; // Array para almacenar los productos en el carrito

    // Función para mostrar una notificación
function showNotification(mensaje) {
    // Crear un contenedor de notificación si no existe
    let notificationContainer = document.getElementById('notification-container');
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        document.body.appendChild(notificationContainer);
    }

    // Crear la notificación
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = mensaje;

    // Agregar la notificación al contenedor
    notificationContainer.appendChild(notification);

    // Remover la notificación después de 3 segundos
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function addToCart(titulo, precio) {
    cartCount++; // Incrementar el contador del carrito
    document.getElementById('cart-count').innerText = cartCount; // Actualizar el contador en el header

    // Agregar producto al carrito
    cartItems.push({ titulo, precio });

    // Mostrar la notificación
    showNotification(`"${titulo}" fue añadido al carrito.`);
}

function showCart() {
    const cartModal = document.getElementById("cartModal");
    const cartItemsContainer = document.getElementById("cart-items");

    // Limpiar el contenido anterior del carrito
    cartItemsContainer.innerHTML = '';

    if (cartItems.length > 0) {
        let totalPrice = 0; // Variable para calcular el precio total

        // Mostrar cada producto del carrito
        cartItems.forEach((item, index) => {
            // Limpia el precio para asegurarte de que sea un número válido
            const precioLimpio = parseFloat(item.precio.replace(/[^0-9.-]+/g, ''));
            if (!isNaN(precioLimpio)) {
                totalPrice += precioLimpio; // Sumar precio del producto al total
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

        // Mostrar el precio total
        const totalElement = document.createElement('div');
        totalElement.className = 'total-price';
        totalElement.innerHTML = `<h3>Total: ${totalPrice.toFixed(2)}</h3>`;
        cartItemsContainer.appendChild(totalElement);

        // Añadir el botón "Vaciar Carrito"
        const emptyCartButton = document.createElement('button');
        emptyCartButton.textContent = 'Vaciar Carrito';
        emptyCartButton.className = 'empty-cart-btn';
        emptyCartButton.onclick = emptyCart;
        cartItemsContainer.appendChild(emptyCartButton);
    } else {
        // Mostrar mensaje si el carrito está vacío
        cartItemsContainer.innerHTML = '<p>El carrito está vacío.</p>';
    }

    // Mostrar el modal del carrito
    cartModal.style.display = "block";
}

function closeCart() {
    document.getElementById("cartModal").style.display = "none"; // Cerrar el modal del carrito
}

function removeFromCart(index) {
    cartItems.splice(index, 1); // Eliminar el producto del carrito
    cartCount--; // Decrementar el contador del carrito
    document.getElementById('cart-count').innerText = cartCount; // Actualizar el contador en el header
    showCart(); // Volver a mostrar el carrito actualizado
    showNotification('Producto eliminado del carrito.');
}

function emptyCart() {
    cartItems.length = 0; // Vaciar el arreglo del carrito
    cartCount = 0; // Reiniciar el contador del carrito
    document.getElementById('cart-count').innerText = cartCount;

    // Actualizar el contenido del carrito
    const cartItemsContainer = document.getElementById('cart-items');
    cartItemsContainer.innerHTML = '<p>El carrito está vacío.</p>';

    // Mostrar una notificación
    showNotification('El carrito ha sido vaciado.');
}

function changeImage(mainImageId, newSrc) {
    document.getElementById(mainImageId).src = newSrc;
}

function expandImage(img) {
    var modal = document.getElementById("imageModal");
    var expandedImg = document.getElementById("expandedImg");
    modal.style.display = "block";
    expandedImg.src = img.src;
}

function closeModal() {
    document.getElementById("imageModal").style.display = "none";
}

function checkout() {
    alert("Funcionalidad de finalizar compra aún no implementada.");
}

//función para buscar productos
document.getElementById('search-input').addEventListener('input', () => {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const productRow = document.getElementById('product-row');

    if (searchTerm.trim() === '') {
        // Si el campo de búsqueda está vacío, mostrar todos los productos
        productRow.innerHTML = '';
        productosCargados = 0; // Reiniciar el contador de productos cargados
        addMoreProducts(); // Cargar nuevamente los productos
    } else {
        // Filtrar y mostrar productos coincidentes
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

// Función para cargar más productos
function addMoreProducts() {
    const productRow = document.getElementById('product-row');
    const totalProductos = productos.length;
    console.log(productosCargados, productosPorPagina)
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

    // Si ya se cargaron todos los productos, ocultar el botón
    if (productosCargados >= totalProductos) {
        document.querySelector('.add-more').style.display = 'none';
    }
}