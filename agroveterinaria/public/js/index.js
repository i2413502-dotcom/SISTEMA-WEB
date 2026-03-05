let productosBase = [];
const RUTA_IMG = '/img/productos/';
const IMG_ERROR = 'https://via.placeholder.com/300x300?text=Sin+Imagen';

// Actualizar contador carrito
function actualizarContadorCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const total = carrito.reduce((sum, i) => sum + i.cantidad, 0);
    const badge = document.getElementById('cart-count');
    if (badge) badge.innerText = total;
}

// Obtener productos desde API
async function obtenerProductos(filtros = {}) {
    try {
        let query = new URLSearchParams(filtros).toString();
        const url = '/api/productos' + (query ? '?' + query : '');
        const response = await fetch(url);
        if (!response.ok) throw new Error('Error al obtener productos');
        productosBase = await response.json();
        renderizarProductos(productosBase);
    } catch (error) {
        console.error("Error:", error);
        document.getElementById('lista-productos').innerHTML =
            '<p class="text-center text-danger">Error al conectar con el servidor.</p>';
    }
}

// Renderizar productos
function renderizarProductos(productos) {
    const contenedor = document.getElementById('lista-productos');
    if (!contenedor) return;

    if (!productos.length) {
        contenedor.innerHTML = `
            <div class="col-12 text-center py-5 text-muted">
                <h5>No se encontraron productos.</h5>
            </div>`;
        return;
    }

    contenedor.innerHTML = productos.map(p => {
        const img = p.imagen ? `${RUTA_IMG}${p.imagen.trim()}` : IMG_ERROR;
        return `
        <div class="col-md-3 mb-4">
            <div class="card product-card shadow-sm">
                <a href="/detalleproducto.html?id=${p.id_producto}" class="text-decoration-none">
                    <div class="product-img-container">
                        <img src="${img}" class="product-img" alt="${p.nombre}"
                             onerror="this.onerror=null;this.src='${IMG_ERROR}';">
                    </div>
                </a>
                <div class="card-body text-center">
                    <p class="mb-1 text-muted small text-uppercase">${p.categoria || 'General'}</p>
                    <h6 class="fw-bold text-dark text-truncate">${p.nombre}</h6>
                    <h5 class="fw-bold text-success">S/. ${parseFloat(p.precio_venta).toFixed(2)}</h5>
                    <button class="btn-add mt-2" 
                        onclick="agregarAlCarrito(event, ${p.id_producto}, '${p.nombre}', ${p.precio_venta}, '${p.imagen ? p.imagen.trim() : ''}')">
                        <i class="bi bi-cart-plus"></i>
                    </button>
                </div>
            </div>
        </div>`;
    }).join('');
}

// Buscador en tiempo real
const inputBuscador = document.getElementById('inputBuscador');
if (inputBuscador) {
    inputBuscador.addEventListener('input', (e) => {
        const busqueda = e.target.value.toLowerCase();
        const filtrados = productosBase.filter(p =>
            p.nombre.toLowerCase().includes(busqueda) ||
            (p.categoria && p.categoria.toLowerCase().includes(busqueda))
        );
        renderizarProductos(filtrados);
    });
}

// Aplicar filtros
function aplicarFiltros() {
    const categoria = document.getElementById('filtroCategoria').value;
    const precio_min = document.getElementById('filtroPrecioMin').value;
    const precio_max = document.getElementById('filtroPrecioMax').value;

    const filtros = {};
    if (categoria) filtros.categoria = categoria;
    if (precio_min) filtros.precio_min = precio_min;
    if (precio_max) filtros.precio_max = precio_max;

    obtenerProductos(filtros);
}

// Agregar al carrito
function agregarAlCarrito(event, id, nombre, precio, imagen) {
    event.preventDefault();
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const existe = carrito.find(p => p.id_producto === id);
    if (existe) {
        existe.cantidad += 1;
    } else {
        carrito.push({ 
            id_producto: id, 
            nombre, 
            precio: parseFloat(precio), 
            imagen, 
            cantidad: 1 
        });
    }
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarContadorCarrito();

    // Feedback visual
    const btn = event.target.closest('button');
    const original = btn.innerHTML;
    btn.innerHTML = '<i class="bi bi-check-lg"></i>';
    btn.style.backgroundColor = '#047a37';
    setTimeout(() => { 
        btn.innerHTML = original; 
        btn.style.backgroundColor = ''; 
    }, 1000);
}

// Iniciar
window.addEventListener('DOMContentLoaded', () => {
    obtenerProductos();
    actualizarContadorCarrito();

    // Mostrar nombre si está logueado
    const nombre = localStorage.getItem('nombre');
    if (nombre) {
        const btn = document.getElementById('btn-usuario');
        if (btn) btn.title = 'Hola, ' + nombre;
    }
});