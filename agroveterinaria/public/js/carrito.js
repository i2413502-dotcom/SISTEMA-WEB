const RUTA_IMG = '/img/productos/';
const IMG_ERROR = 'https://via.placeholder.com/70x70?text=Sin+Imagen';

function actualizarContadorCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const total = carrito.reduce((sum, i) => sum + i.cantidad, 0);
    const badge = document.getElementById('cart-count');
    if (badge) badge.innerText = total;
}

function renderizarCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const container = document.getElementById('carrito-items');

    if (carrito.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-cart-x" style="font-size:4rem;color:#ccc;"></i>
                <h5 class="text-muted mt-3">Tu carrito está vacío</h5>
                <a href="/" class="btn mt-3" style="background-color:#06A049;color:white;">
                    Ver productos
                </a>
            </div>`;
        document.getElementById('subtotal').innerText = 'S/. 0.00';
        document.getElementById('total').innerText = 'S/. 0.00';
        return;
    }

    let subtotal = 0;
    container.innerHTML = '';

    carrito.forEach(item => {
        const itemSubtotal = item.precio * item.cantidad;
        subtotal += itemSubtotal;
        const img = item.imagen ? `${RUTA_IMG}${item.imagen.trim()}` : IMG_ERROR;

        const div = document.createElement('div');
        div.className = 'card mb-3 shadow-sm';
        div.innerHTML = `
            <div class="card-body">
                <div class="row align-items-center">
                    <div class="col-2">
                        <img src="${img}" alt="${item.nombre}" class="cart-img"
                             onerror="this.onerror=null;this.src='${IMG_ERROR}';">
                    </div>
                    <div class="col-4">
                        <h6 class="fw-bold mb-1">${item.nombre}</h6>
                        <p class="text-muted mb-0 small">S/. ${item.precio.toFixed(2)} c/u</p>
                    </div>
                    <div class="col-3 d-flex align-items-center gap-2">
                        <button class="btn btn-sm btn-outline-secondary" 
                                onclick="cambiarCantidad(${item.id_producto}, ${item.cantidad - 1})">-</button>
                        <input type="number" class="form-control form-control-sm cantidad-input" 
                               value="${item.cantidad}" min="1"
                               onchange="cambiarCantidad(${item.id_producto}, this.value)">
                        <button class="btn btn-sm btn-outline-secondary"
                                onclick="cambiarCantidad(${item.id_producto}, ${item.cantidad + 1})">+</button>
                    </div>
                    <div class="col-2 text-center fw-bold text-success">
                        S/. ${itemSubtotal.toFixed(2)}
                    </div>
                    <div class="col-1 text-center">
                        <button class="btn btn-sm btn-danger" onclick="eliminarProducto(${item.id_producto})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>`;
        container.appendChild(div);
    });

    document.getElementById('subtotal').innerText = 'S/. ' + subtotal.toFixed(2);
    document.getElementById('total').innerText = 'S/. ' + subtotal.toFixed(2);
}

function cambiarCantidad(id, cantidad) {
    cantidad = parseInt(cantidad);
    if (cantidad < 1) {
        eliminarProducto(id);
        return;
    }
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const item = carrito.find(p => p.id_producto === id);
    if (item) {
        item.cantidad = cantidad;
        localStorage.setItem('carrito', JSON.stringify(carrito));
        renderizarCarrito();
        actualizarContadorCarrito();
    }
}

function eliminarProducto(id) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    carrito = carrito.filter(p => p.id_producto !== id);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    renderizarCarrito();
    actualizarContadorCarrito();
}

function finalizarCompra() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    if (carrito.length === 0) {
        alert('Tu carrito está vacío');
        return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
        localStorage.setItem('redirectAfterLogin', 'envio');
        alert('Debes iniciar sesión para continuar');
        window.location.href = '/login.html';
        return;
    }
    window.location.href = '/envio.html';
}

window.addEventListener('DOMContentLoaded', () => {
    renderizarCarrito();
    actualizarContadorCarrito();
});
