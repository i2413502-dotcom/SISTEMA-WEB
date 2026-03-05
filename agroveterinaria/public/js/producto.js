const RUTA_IMG = '/img/productos/';
const IMG_ERROR = 'https://via.placeholder.com/400x400?text=Sin+Imagen';

function actualizarContadorCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const total = carrito.reduce((sum, i) => sum + i.cantidad, 0);
    const badge = document.getElementById('cart-count');
    if (badge) badge.innerText = total;
}

function obtenerIdDesdeURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

async function cargarDetalleProducto() {
    const id = obtenerIdDesdeURL();
    if (!id) {
        document.getElementById('producto-detalle').innerHTML = '<p class="text-danger">Producto no especificado.</p>';
        return;
    }

    try {
        const res = await fetch(`/api/productos/${id}`);
        if (!res.ok) throw new Error('Producto no encontrado');
        const p = await res.json();

        const img = p.imagen ? `${RUTA_IMG}${p.imagen.trim()}` : IMG_ERROR;

        document.getElementById('producto-detalle').innerHTML = `
            <div class="col-md-6 text-center">
                <img src="${img}" alt="${p.nombre}" class="product-img shadow"
                     onerror="this.onerror=null;this.src='${IMG_ERROR}';">
            </div>
            <div class="col-md-6">
                <p class="text-muted text-uppercase small">${p.categoria || 'General'}</p>
                <h2 class="fw-bold">${p.nombre}</h2>
                <h3 class="text-success fw-bold">S/. ${parseFloat(p.precio_venta).toFixed(2)}</h3>
                <p class="text-muted">${p.descripcion || 'Sin descripción disponible.'}</p>
                <p><strong>Stock disponible:</strong> 
                    <span class="${p.stock_actual > 0 ? 'text-success' : 'text-danger'}">
                        ${p.stock_actual > 0 ? p.stock_actual + ' unidades' : 'Agotado'}
                    </span>
                </p>

                <div class="cantidad-control mb-4">
                    <label class="fw-bold me-2">Cantidad:</label>
                    <button onclick="restar()">-</button>
                    <input type="number" id="cantidad" value="1" min="1" max="${p.stock_actual}">
                    <button onclick="sumar(${p.stock_actual})">+</button>
                </div>

                <div class="d-flex gap-2 flex-wrap">
                    <button class="btn btn-agregar px-4" onclick="agregarAlCarrito(${p.id_producto}, '${p.nombre}', ${p.precio_venta}, '${p.imagen ? p.imagen.trim() : ''}', ${p.stock_actual})">
                        <i class="bi bi-cart-plus me-2"></i>Agregar al carrito
                    </button>
                    <a href="/" class="btn btn-outline-secondary px-4">
                        <i class="bi bi-arrow-left me-2"></i>Volver al catálogo
                    </a>
                </div>
            </div>
        `;

        cargarRecomendados(p.id_categoria, p.id_producto);

    } catch (error) {
        document.getElementById('producto-detalle').innerHTML =
            `<p class="text-danger">${error.message}</p>`;
    }
}

function restar() {
    const input = document.getElementById('cantidad');
    if (parseInt(input.value) > 1) input.value = parseInt(input.value) - 1;
}

function sumar(stock) {
    const input = document.getElementById('cantidad');
    if (parseInt(input.value) < stock) input.value = parseInt(input.value) + 1;
}

function agregarAlCarrito(id, nombre, precio, imagen, stock) {
    const cantidad = parseInt(document.getElementById('cantidad').value);
    if (cantidad < 1 || cantidad > stock) {
        alert('Cantidad no válida');
        return;
    }

    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const existe = carrito.find(p => p.id_producto === id);
    if (existe) {
        const nuevaCantidad = existe.cantidad + cantidad;
        if (nuevaCantidad > stock) {
            alert('No hay suficiente stock');
            return;
        }
        existe.cantidad = nuevaCantidad;
    } else {
        carrito.push({ id_producto: id, nombre, precio: parseFloat(precio), imagen, cantidad });
    }

    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarContadorCarrito();

    alert(`"${nombre}" agregado al carrito`);
}

async function cargarRecomendados(idCategoria, idActual) {
    try {
        const res = await fetch(`/api/productos?categoria=${idCategoria}`);
        const productos = await res.json();
        const filtrados = productos.filter(p => p.id_producto !== parseInt(idActual));

        if (!filtrados.length) {
            document.getElementById('productos-recomendados').innerHTML =
                '<p class="text-muted">No hay recomendaciones disponibles.</p>';
            return;
        }

        document.getElementById('productos-recomendados').innerHTML = filtrados.map(p => {
            const img = p.imagen ? `${RUTA_IMG}${p.imagen.trim()}` : IMG_ERROR;
            return `
            <div class="col-md-3">
                <div class="card shadow-sm h-100">
                    <a href="/detalleproducto.html?id=${p.id_producto}" class="text-decoration-none text-dark">
                        <img src="${img}" alt="${p.nombre}" class="card-img-top recommended-img"
                             onerror="this.onerror=null;this.src='${IMG_ERROR}';">
                        <div class="card-body p-2 text-center">
                            <h6 class="card-title text-truncate">${p.nombre}</h6>
                            <p class="text-success fw-bold mb-0">S/. ${parseFloat(p.precio_venta).toFixed(2)}</p>
                        </div>
                    </a>
                </div>
            </div>`;
        }).join('');

    } catch (error) {
        document.getElementById('productos-recomendados').innerHTML = '';
    }
}

window.addEventListener('DOMContentLoaded', () => {
    cargarDetalleProducto();
    actualizarContadorCarrito();
});