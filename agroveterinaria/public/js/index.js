let productosBase = [];
let filtroAnimalActivo = 0;
const RUTA_IMG = '/img/productos/';
const IMG_ERROR = 'https://via.placeholder.com/300x300?text=Sin+Imagen';

// Actualizar contador carrito
function actualizarContadorCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const total = carrito.reduce((sum, i) => sum + i.cantidad, 0);
    const badge = document.getElementById('cart-count');
    if (badge) badge.innerText = total;
}

// Mostrar toast notificación
function mostrarToast(nombre) {
    const toast = document.getElementById('toastCarrito');
    const msg = document.getElementById('toast-mensaje');
    msg.innerText = `"${nombre}" agregado al carrito`;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 2500);
}

// Obtener productos desde API
async function obtenerProductos(filtros = {}) {
    try {
        let query = new URLSearchParams(filtros).toString();
        const url = '/api/productos' + (query ? '?' + query : '');
        const response = await fetch(url);
        if (!response.ok) throw new Error('Error al obtener productos');
        productosBase = await response.json();
        aplicarFiltroAnimal();
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('lista-productos').innerHTML =
            '<p class="text-center text-danger">Error al conectar con el servidor.</p>';
    }
}

// Renderizar productos
function renderizarProductos(productos) {
    const contenedor = document.getElementById('lista-productos');
    const contador = document.getElementById('contador-productos');
    if (!contenedor) return;

    if (contador) contador.innerText = productos.length;

    if (!productos.length) {
        contenedor.innerHTML = `
            <div class="col-12 text-center py-5 text-muted">
                <i class="bi bi-search" style="font-size:3rem;"></i>
                <h5 class="mt-3">No se encontraron productos.</h5>
                <button class="btn btn-outline-success mt-2" onclick="limpiarFiltros()">
                    Ver todos los productos
                </button>
            </div>`;
        return;
    }

    contenedor.innerHTML = productos.map(p => {
        const img = p.imagen ? `${RUTA_IMG}${p.imagen.trim()}` : IMG_ERROR;
        const stockBadge = p.stock_actual <= 5
            ? '<span class="badge bg-danger position-absolute top-0 end-0 m-2">Poco stock</span>'
            : '';
        return `
        <div class="col-6 col-md-3 mb-4">
            <div class="card product-card shadow-sm position-relative">
                ${stockBadge}
                <a href="/detalleproducto.html?id=${p.id_producto}" class="text-decoration-none">
                    <div class="product-img-container">
                        <img src="${img}" class="product-img" alt="${p.nombre}"
                             onerror="this.onerror=null;this.src='${IMG_ERROR}';">
                    </div>
                </a>
                <div class="card-body text-center p-2">
                    <p class="mb-1 text-muted small text-uppercase">${p.categoria || 'General'}</p>
                    <h6 class="fw-bold text-dark text-truncate mb-1">${p.nombre}</h6>
                    <h5 class="fw-bold text-success mb-2">S/. ${parseFloat(p.precio_venta).toFixed(2)}</h5>
                    <button class="btn-add mt-1" onclick="agregarAlCarrito(event, ${p.id_producto}, decodeURIComponent('${encodeURIComponent(p.nombre)}'), ${p.precio_venta}, '${p.imagen ? p.imagen.trim() : ''}', ${p.stock_actual || 0})">
    <i class="bi bi-cart-plus"></i>
</button>
                </div>
            </div>
        </div>`;
    }).join('');
}

// Filtrar por animal
function filtrarAnimal(idAnimal, btn) {
    filtroAnimalActivo = idAnimal;

    // Actualizar botones activos
    document.querySelectorAll('.filtro-animal .btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    aplicarFiltroAnimal();
}

function aplicarFiltroAnimal() {
    let filtrados = [...productosBase];
    if (filtroAnimalActivo > 0) {
        filtrados = filtrados.filter(p => p.id_tipo_animal === filtroAnimalActivo);
    }
    renderizarProductos(filtrados);
}

// Buscador en tiempo real
const inputBuscador = document.getElementById('inputBuscador');
if (inputBuscador) {
    inputBuscador.addEventListener('input', (e) => {
        const busqueda = e.target.value.toLowerCase();
        let filtrados = productosBase.filter(p =>
            p.nombre.toLowerCase().includes(busqueda) ||
            (p.categoria && p.categoria.toLowerCase().includes(busqueda))
        );
        if (filtroAnimalActivo > 0) {
            filtrados = filtrados.filter(p => p.id_tipo_animal === filtroAnimalActivo);
        }
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

// Limpiar filtros
function limpiarFiltros() {
    document.getElementById('filtroCategoria').value = '';
    document.getElementById('filtroPrecioMin').value = '';
    document.getElementById('filtroPrecioMax').value = '';
    filtroAnimalActivo = 0;
    document.querySelectorAll('.filtro-animal .btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.filtro-animal .btn').classList.add('active');
    obtenerProductos();
}

// Agregar al carrito
// Agregar al carrito
function agregarAlCarrito(event, id, nombre, precio, imagen, stock) {
    event.preventDefault();
    event.stopPropagation();

    stock = parseInt(stock) || 0;

    if (stock <= 0) {
        mostrarToast('Producto agotado');
        return;
    }

    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const existe = carrito.find(p => p.id_producto === id);

    if (existe) {
        if (existe.cantidad >= stock) {
            alert('No hay más stock disponible');
            return;
        }
        existe.cantidad += 1;
    } else {
        carrito.push({
            id_producto: id,
            nombre: nombre,
            precio: parseFloat(precio),
            imagen: imagen,
            cantidad: 1
        });
    }

    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarContadorCarrito();
    mostrarToast(nombre);
}

// Iniciar
window.addEventListener('DOMContentLoaded', () => {
    obtenerProductos();
    actualizarContadorCarrito();

    const nombre = localStorage.getItem('nombre');
    const rol = localStorage.getItem('rol');
    const btnUsuario = document.getElementById('btn-usuario');

    if (nombre && btnUsuario) {
        if (rol === 'COLABORADOR') {
            btnUsuario.href = '/dashboard.html';
            btnUsuario.title = 'Dashboard - ' + nombre;
        } else {
            btnUsuario.href = '/perfil.html';
            btnUsuario.title = 'Mi perfil - ' + nombre;
        }
    }
});