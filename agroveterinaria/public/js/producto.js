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

        // Ficha técnica según categoría
        let fichaTecnica = '';

        if (p.id_categoria === 2) {
            // Medicamentos
            fichaTecnica = `
            <div class="mt-4">
                <h5 class="fw-bold text-success border-bottom pb-2">
                    <i class="bi bi-clipboard2-pulse me-2"></i>Ficha Técnica
                </h5>
                <table class="table table-sm table-bordered">
                    ${p.marca ? `<tr><td class="fw-bold bg-light" style="width:40%">Marca</td><td>${p.marca}</td></tr>` : ''}
                    ${p.composicion ? `<tr><td class="fw-bold bg-light">Composición</td><td>${p.composicion}</td></tr>` : ''}
                    ${p.modo_uso ? `<tr><td class="fw-bold bg-light">Modo de uso</td><td>${p.modo_uso}</td></tr>` : ''}
                    ${p.presentacion ? `<tr><td class="fw-bold bg-light">Presentación</td><td>${p.presentacion}</td></tr>` : ''}
                    ${p.ficha_tecnica ? `<tr><td class="fw-bold bg-light">Indicaciones</td><td>${p.ficha_tecnica}</td></tr>` : ''}
                    ${p.fecha_vencimiento ? `<tr><td class="fw-bold bg-light">Vencimiento</td><td>${new Date(p.fecha_vencimiento).toLocaleDateString('es-PE')}</td></tr>` : ''}
                </table>
                <div class="alert alert-warning mt-2 small">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    <strong>Advertencia:</strong> Consulte con un veterinario antes de administrar este producto.
                </div>
            </div>`;
        } else if (p.id_categoria === 1) {
            // Alimentos
            fichaTecnica = `
            <div class="mt-4">
                <h5 class="fw-bold text-success border-bottom pb-2">
                    <i class="bi bi-egg-fried me-2"></i>Información del Producto
                </h5>
                <table class="table table-sm table-bordered">
                    ${p.marca ? `<tr><td class="fw-bold bg-light" style="width:40%">Marca</td><td>${p.marca}</td></tr>` : ''}
                    ${p.composicion ? `<tr><td class="fw-bold bg-light">Composición</td><td>${p.composicion}</td></tr>` : ''}
                    ${p.presentacion ? `<tr><td class="fw-bold bg-light">Presentación</td><td>${p.presentacion}</td></tr>` : ''}
                    ${p.ficha_tecnica ? `<tr><td class="fw-bold bg-light">Información nutricional</td><td>${p.ficha_tecnica}</td></tr>` : ''}
                    ${p.fecha_vencimiento ? `<tr><td class="fw-bold bg-light">Vencimiento</td><td>${new Date(p.fecha_vencimiento).toLocaleDateString('es-PE')}</td></tr>` : ''}
                </table>
            </div>`;
        } else if (p.id_categoria === 3) {
            // Accesorios
            fichaTecnica = `
            <div class="mt-4">
                <h5 class="fw-bold text-success border-bottom pb-2">
                    <i class="bi bi-tags me-2"></i>Detalles del Producto
                </h5>
                <table class="table table-sm table-bordered">
                    ${p.marca ? `<tr><td class="fw-bold bg-light" style="width:40%">Marca</td><td>${p.marca}</td></tr>` : ''}
                    ${p.colores ? `<tr><td class="fw-bold bg-light">Colores disponibles</td><td>${p.colores}</td></tr>` : ''}
                    ${p.presentacion ? `<tr><td class="fw-bold bg-light">Presentación</td><td>${p.presentacion}</td></tr>` : ''}
                    ${p.ficha_tecnica ? `<tr><td class="fw-bold bg-light">Especificaciones</td><td>${p.ficha_tecnica}</td></tr>` : ''}
                </table>
            </div>`;
        }

        document.getElementById('producto-detalle').innerHTML = `
            <div class="col-md-6 text-center">
                <img src="${img}" alt="${p.nombre}" class="product-img shadow img-fluid"
                     onerror="this.onerror=null;this.src='${IMG_ERROR}';">
            </div>
            <div class="col-md-6">
                <nav aria-label="breadcrumb">
                    <ol class="breadcrumb small">
                        <li class="breadcrumb-item"><a href="/" class="text-success">Inicio</a></li>
                        <li class="breadcrumb-item"><a href="/" class="text-success">${p.categoria || 'General'}</a></li>
                        <li class="breadcrumb-item active">${p.nombre}</li>
                    </ol>
                </nav>

                <span class="badge bg-success mb-2">${p.categoria || 'General'}</span>
                ${p.tipo_animal ? `<span class="badge bg-info text-dark mb-2 ms-1">${p.tipo_animal}</span>` : ''}
                ${p.marca ? `<span class="badge bg-secondary mb-2 ms-1">${p.marca}</span>` : ''}

                <h2 class="fw-bold mt-1">${p.nombre}</h2>
                <h3 class="text-success fw-bold">S/. ${parseFloat(p.precio_venta).toFixed(2)}</h3>

                <p class="text-muted">${p.descripcion || 'Sin descripción disponible.'}</p>

                <div class="d-flex align-items-center gap-3 mb-3">
                    <span class="fw-bold">Disponibilidad:</span>
                    ${p.stock_actual > 10
                        ? `<span class="badge bg-success px-3 py-2"><i class="bi bi-check-circle me-1"></i>En stock (${p.stock_actual} unidades)</span>`
                        : p.stock_actual > 0
                        ? `<span class="badge bg-warning text-dark px-3 py-2"><i class="bi bi-exclamation-circle me-1"></i>Pocas unidades (${p.stock_actual})</span>`
                        : `<span class="badge bg-danger px-3 py-2"><i class="bi bi-x-circle me-1"></i>Agotado</span>`
                    }
                </div>

                <div class="d-flex align-items-center gap-3 mb-4">
                    <label class="fw-bold">Cantidad:</label>
                    <div class="d-flex align-items-center gap-2">
                        <button class="btn btn-outline-secondary btn-sm rounded-circle" onclick="restar()">-</button>
                        <input type="number" id="cantidad" value="1" min="1" max="${p.stock_actual}"
                               class="form-control text-center" style="width:65px;">
                        <button class="btn btn-outline-secondary btn-sm rounded-circle" onclick="sumar(${p.stock_actual})">+</button>
                    </div>
                </div>

                <div class="d-flex gap-2 flex-wrap">
                    ${p.stock_actual > 0 ? `
                    <button class="btn btn-success px-4 py-2" 
                            onclick="agregarAlCarrito(${p.id_producto}, '${p.nombre.replace(/'/g, "\\'")}', ${p.precio_venta}, '${p.imagen ? p.imagen.trim() : ''}', ${p.stock_actual})">
                        <i class="bi bi-cart-plus me-2"></i>Agregar al carrito
                    </button>` : ''}
                    <a href="/" class="btn btn-outline-secondary px-4 py-2">
                        <i class="bi bi-arrow-left me-2"></i>Volver
                    </a>
                </div>

                ${fichaTecnica}
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
            alert('No hay suficiente stock disponible');
            return;
        }
        existe.cantidad = nuevaCantidad;
    } else {
        carrito.push({
            id_producto: id,
            nombre,
            precio: parseFloat(precio),
            imagen,
            cantidad
        });
    }

    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarContadorCarrito();

    // Toast
    const toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#06A049;color:white;padding:12px 20px;border-radius:10px;z-index:9999;box-shadow:0 4px 15px rgba(0,0,0,0.2);';
    toast.innerHTML = `<i class="bi bi-cart-check me-2"></i>"${nombre}" agregado al carrito`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
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
            <div class="col-6 col-md-3">
                <div class="card shadow-sm h-100">
                    <a href="/detalleproducto.html?id=${p.id_producto}" class="text-decoration-none text-dark">
                        <img src="${img}" alt="${p.nombre}" class="card-img-top recommended-img"
                             onerror="this.onerror=null;this.src='${IMG_ERROR}';">
                        <div class="card-body p-2 text-center">
                            <h6 class="card-title text-truncate small">${p.nombre}</h6>
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