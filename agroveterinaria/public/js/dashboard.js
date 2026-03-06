let modalProducto;
let productosLista = [];

// ============================================================
// ACCESO
// ============================================================
function verificarAcceso() {
    const token = localStorage.getItem('token');
    const rol   = localStorage.getItem('rol');
    if (!token || rol !== 'COLABORADOR') {
        window.location.href = '/login.html';
    }
    const nombre = localStorage.getItem('nombre');
    if (nombre) document.getElementById('nombre-admin').innerText = nombre;
}

// ============================================================
// NAVEGACIÓN
// ============================================================
function mostrarSeccion(seccion, link) {
    const secciones = ['inicio', 'pedidos', 'productos', 'clientes', 'categorias', 'animales'];
    secciones.forEach(s => {
        document.getElementById(`seccion-${s}`).classList.add('d-none');
    });
    document.getElementById(`seccion-${seccion}`).classList.remove('d-none');

    const titulos = {
        inicio:      'Dashboard',
        pedidos:     'Gestión de Pedidos',
        productos:   'Inventario de Productos',
        clientes:    'Clientes Registrados',
        categorias:  'Categorías de Producto',
        animales:    'Tipos de Animal'
    };
    document.getElementById('titulo-seccion').innerText = titulos[seccion];

    document.querySelectorAll('.sidebar .nav-link').forEach(l => l.classList.remove('active'));
    if (link) link.classList.add('active');

    if (seccion === 'pedidos')    cargarPedidos();
    if (seccion === 'productos')  cargarProductos();
    if (seccion === 'clientes')   cargarClientes();
    if (seccion === 'categorias') cargarCategorias();
    if (seccion === 'animales')   cargarAnimales();
}

function cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('nombre');
    window.location.href = '/login.html';
}

// ============================================================
// ESTADÍSTICAS
// ============================================================
async function cargarEstadisticas() {
    try {
        const res  = await fetch('/api/dashboard');
        const data = await res.json();
        document.getElementById('stat-clientes').innerText   = data.clientes;
        document.getElementById('stat-pendientes').innerText = data.pedidosPendientes;
        document.getElementById('stat-productos').innerText  = data.productos;
        document.getElementById('stat-stock').innerText      = data.stockBajo;
    } catch (err) {
        console.error('Error cargando estadísticas:', err);
    }
}

// ============================================================
// HELPER — color badge estado pedido
// ============================================================
function getBadgeEstado(estado) {
    const colores = {
        'PENDIENTE':  'warning text-dark',
        'PAGADO':     'info text-dark',
        'ENVIADO':    'primary',
        'ENTREGADO':  'success',
        'CANCELADO':  'danger'
    };
    return colores[estado] || 'secondary';
}

// ============================================================
// PEDIDOS RECIENTES
// ============================================================
async function cargarPedidosRecientes() {
    try {
        const token = localStorage.getItem('token');
        const res   = await fetch('/api/pedidos', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const pedidos  = await res.json();
        const recientes = pedidos.slice(0, 5);
        const tbody    = document.getElementById('tabla-pedidos-recientes');

        if (!recientes.length) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No hay pedidos</td></tr>';
            return;
        }

        tbody.innerHTML = recientes.map(p => `
            <tr>
                <td><strong>#${p.id_pedido}</strong></td>
                <td>${p.cliente_nombre}</td>
                <td class="text-success fw-bold">S/. ${parseFloat(p.total).toFixed(2)}</td>
                <td>${p.zona || '-'}</td>
                <td><span class="badge bg-${getBadgeEstado(p.estado)}">${p.estado}</span></td>
                <td>${new Date(p.fecha_pedido).toLocaleDateString('es-PE')}</td>
                <td>
                    <select class="form-select form-select-sm" style="width:130px"
                            onchange="actualizarEstado(${p.id_pedido}, this.value)">
                        <option ${p.estado==='PENDIENTE' ?'selected':''}>PENDIENTE</option>
                        <option ${p.estado==='ENVIADO'   ?'selected':''}>ENVIADO</option>
                        <option ${p.estado==='ENTREGADO' ?'selected':''}>ENTREGADO</option>
                        <option ${p.estado==='CANCELADO' ?'selected':''}>CANCELADO</option>
                    </select>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Error cargando pedidos recientes:', err);
    }
}

// ============================================================
// PEDIDOS
// ============================================================
async function cargarPedidos() {
    try {
        const token = localStorage.getItem('token');
        const res   = await fetch('/api/pedidos', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const pedidos = await res.json();
        const tbody   = document.getElementById('tabla-pedidos');

        if (!pedidos.length) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No hay pedidos</td></tr>';
            return;
        }

        tbody.innerHTML = pedidos.map(p => `
            <tr>
                <td><strong>#${p.id_pedido}</strong></td>
                <td>${p.cliente_nombre}</td>
                <td>${p.direccion_entrega}</td>
                <td class="text-success fw-bold">S/. ${parseFloat(p.total).toFixed(2)}</td>
                <td><span class="badge bg-${getBadgeEstado(p.estado)}">${p.estado}</span></td>
                <td>${new Date(p.fecha_pedido).toLocaleDateString('es-PE')}</td>
                <td>
                    <select class="form-select form-select-sm" style="width:130px"
                            onchange="actualizarEstado(${p.id_pedido}, this.value)">
                        <option ${p.estado==='PENDIENTE' ?'selected':''}>PENDIENTE</option>
                        <option ${p.estado==='ENVIADO'   ?'selected':''}>ENVIADO</option>
                        <option ${p.estado==='ENTREGADO' ?'selected':''}>ENTREGADO</option>
                        <option ${p.estado==='CANCELADO' ?'selected':''}>CANCELADO</option>
                    </select>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Error cargando pedidos:', err);
    }
}

async function actualizarEstado(id, estado) {
    try {
        const token = localStorage.getItem('token');
        await fetch(`/api/dashboard/pedidos/${id}/estado`, {
            method:  'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            body:    JSON.stringify({ estado })
        });
        cargarEstadisticas();
    } catch (err) {
        console.error('Error actualizando estado:', err);
    }
}

// ============================================================
// PRODUCTOS
// ============================================================
async function cargarProductos() {
    try {
        const res = await fetch('/api/productos');
        productosLista = await res.json();
        const tbody = document.getElementById('tabla-productos');

        if (!productosLista.length) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No hay productos</td></tr>';
            return;
        }

        tbody.innerHTML = productosLista.map(p => {
            const stockEstado = p.stock_actual <= p.stock_minimo
                ? '<span class="badge bg-danger">Stock Bajo</span>'
                : '<span class="badge bg-success">Normal</span>';
            return `
            <tr>
                <td>${p.id_producto}</td>
                <td><strong>${p.nombre}</strong></td>
                <td>${p.categoria}</td>
                <td class="text-success fw-bold">S/. ${parseFloat(p.precio_venta).toFixed(2)}</td>
                <td>${p.stock_actual}</td>
                <td>${stockEstado}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1"
                            onclick="editarProducto(${p.id_producto})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger"
                            onclick="eliminarProducto(${p.id_producto})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>`;
        }).join('');
    } catch (err) {
        console.error('Error cargando productos:', err);
    }
}

function mostrarModalProducto() {
    document.getElementById('modal-titulo').innerText = 'Nuevo Producto';
    document.getElementById('formProducto').reset();
    document.getElementById('prod-id').value = '';
    modalProducto.show();
}

function editarProducto(id) {
    const p = productosLista.find(x => x.id_producto === id);
    if (!p) return;
    document.getElementById('modal-titulo').innerText    = 'Editar Producto';
    document.getElementById('prod-id').value             = p.id_producto;
    document.getElementById('prod-nombre').value         = p.nombre;
    document.getElementById('prod-descripcion').value    = p.descripcion || '';
    document.getElementById('prod-precio').value         = p.precio_venta;
    document.getElementById('prod-stock').value          = p.stock_actual;
    document.getElementById('prod-categoria').value      = p.id_categoria;
    document.getElementById('prod-imagen').value         = p.imagen || '';
    modalProducto.show();
}

async function guardarProducto() {
    const id   = document.getElementById('prod-id').value;
    const data = {
        nombre:       document.getElementById('prod-nombre').value,
        descripcion:  document.getElementById('prod-descripcion').value,
        precio_venta: document.getElementById('prod-precio').value,
        stock_actual: document.getElementById('prod-stock').value,
        id_categoria: document.getElementById('prod-categoria').value,
        imagen:       document.getElementById('prod-imagen').value,
        id_tipo_animal: 1,
        stock_minimo:   5
    };
    const url    = id ? `/api/productos/${id}` : '/api/productos';
    const method = id ? 'PUT' : 'POST';
    try {
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (res.ok) { modalProducto.hide(); cargarProductos(); cargarEstadisticas(); }
        else alert('Error al guardar producto');
    } catch (err) {
        alert('Error al guardar producto');
    }
}

async function eliminarProducto(id) {
    if (!confirm('¿Seguro que deseas eliminar este producto?')) return;
    try {
        const res = await fetch(`/api/productos/${id}`, { method: 'DELETE' });
        if (res.ok) { cargarProductos(); cargarEstadisticas(); }
    } catch (err) {
        alert('Error al eliminar producto');
    }
}

// ============================================================
// CLIENTES
// ============================================================
async function cargarClientes() {
    try {
        const token = localStorage.getItem('token');
        const res   = await fetch('/api/clientes', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const clientes = await res.json();
        const tbody    = document.getElementById('tabla-clientes');

        if (!clientes.length) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No hay clientes</td></tr>';
            return;
        }

        tbody.innerHTML = clientes.map((c, i) => `
            <tr>
                <td>${i + 1}</td>
                <td><strong>${c.nombres}</strong></td>
                <td>${c.correo}</td>
                <td>${c.telefono || '-'}</td>
                <td>${c.numero_documento || '-'}</td>
                <td>${new Date(c.fecha_registro).toLocaleDateString('es-PE')}</td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Error cargando clientes:', err);
    }
}

// ============================================================
// CATEGORÍAS
// ============================================================
async function cargarCategorias() {
    try {
        const res = await fetch('/api/categorias');
        categoriasLista = await res.json();
        const tbody = document.getElementById('tabla-categorias');

        if (!categoriasLista.length) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No hay categorías</td></tr>';
            return;
        }

        tbody.innerHTML = categoriasLista.map(c => `
            <tr>
                <td>${c.id_categoria}</td>
                <td><strong>${c.nombre}</strong></td>
                <td>${c.descripcion || '-'}</td>
                <td>
                    <span class="badge bg-${c.estado === 'ACTIVO' ? 'success' : 'secondary'}">
                        ${c.estado}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1"
                            onclick="editarCategoria(${c.id_categoria})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger"
                            onclick="eliminarCategoria(${c.id_categoria})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Error cargando categorías:', err);
    }
}

function mostrarModalCategoria() {
    document.getElementById('modal-cat-titulo').innerText  = 'Nueva Categoría';
    document.getElementById('cat-id').value                = '';
    document.getElementById('cat-nombre').value            = '';
    document.getElementById('cat-descripcion').value       = '';
    document.getElementById('cat-estado').value            = 'ACTIVO';
    modalCategoria.show();
}

function editarCategoria(id) {
    const c = categoriasLista.find(x => x.id_categoria === id);
    if (!c) return;
    document.getElementById('modal-cat-titulo').innerText  = 'Editar Categoría';
    document.getElementById('cat-id').value                = c.id_categoria;
    document.getElementById('cat-nombre').value            = c.nombre;
    document.getElementById('cat-descripcion').value       = c.descripcion || '';
    document.getElementById('cat-estado').value            = c.estado;
    modalCategoria.show();
}

async function guardarCategoria() {
    const id   = document.getElementById('cat-id').value;
    const data = {
        nombre:      document.getElementById('cat-nombre').value,
        descripcion: document.getElementById('cat-descripcion').value,
        estado:      document.getElementById('cat-estado').value
    };
    const url    = id ? `/api/categorias/${id}` : '/api/categorias';
    const method = id ? 'PUT' : 'POST';
    try {
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (res.ok) { modalCategoria.hide(); cargarCategorias(); }
        else { const err = await res.json(); alert(err.mensaje || 'Error al guardar'); }
    } catch (err) {
        alert('Error al guardar categoría');
    }
}

async function eliminarCategoria(id) {
    if (!confirm('¿Seguro que deseas eliminar esta categoría?')) return;
    try {
        const res = await fetch(`/api/categorias/${id}`, { method: 'DELETE' });
        if (res.ok) cargarCategorias();
        else { const err = await res.json(); alert(err.mensaje || 'No se puede eliminar'); }
    } catch (err) {
        alert('Error al eliminar');
    }
}

// ============================================================
// ANIMALES
// ============================================================
async function cargarAnimales() {
    try {
        const res = await fetch('/api/animales');
        animalesLista = await res.json();
        const tbody = document.getElementById('tabla-animales');

        if (!animalesLista.length) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No hay animales</td></tr>';
            return;
        }

        tbody.innerHTML = animalesLista.map(a => `
            <tr>
                <td>${a.id_tipo_animal}</td>
                <td><strong>${a.nombre}</strong></td>
                <td>
                    <span class="badge bg-${a.estado === 'ACTIVO' ? 'success' : 'secondary'}">
                        ${a.estado}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1"
                            onclick="editarAnimal(${a.id_tipo_animal})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger"
                            onclick="eliminarAnimal(${a.id_tipo_animal})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Error cargando animales:', err);
    }
}

function mostrarModalAnimal() {
    document.getElementById('modal-ani-titulo').innerText = 'Nuevo Tipo de Animal';
    document.getElementById('ani-id').value               = '';
    document.getElementById('ani-nombre').value           = '';
    document.getElementById('ani-estado').value           = 'ACTIVO';
    modalAnimal.show();
}

function editarAnimal(id) {
    const a = animalesLista.find(x => x.id_tipo_animal === id);
    if (!a) return;
    document.getElementById('modal-ani-titulo').innerText = 'Editar Tipo de Animal';
    document.getElementById('ani-id').value               = a.id_tipo_animal;
    document.getElementById('ani-nombre').value           = a.nombre;
    document.getElementById('ani-estado').value           = a.estado;
    modalAnimal.show();
}

async function guardarAnimal() {
    const id   = document.getElementById('ani-id').value;
    const data = {
        nombre: document.getElementById('ani-nombre').value,
        estado: document.getElementById('ani-estado').value
    };
    const url    = id ? `/api/animales/${id}` : '/api/animales';
    const method = id ? 'PUT' : 'POST';
    try {
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (res.ok) { modalAnimal.hide(); cargarAnimales(); }
        else { const err = await res.json(); alert(err.mensaje || 'Error al guardar'); }
    } catch (err) {
        alert('Error al guardar animal');
    }
}

async function eliminarAnimal(id) {
    if (!confirm('¿Seguro que deseas eliminar este animal?')) return;
    try {
        const res = await fetch(`/api/animales/${id}`, { method: 'DELETE' });
        if (res.ok) cargarAnimales();
        else { const err = await res.json(); alert(err.mensaje || 'No se puede eliminar'); }
    } catch (err) {
        alert('Error al eliminar');
    }
}

// ============================================================
// INIT
// ============================================================
window.addEventListener('DOMContentLoaded', () => {
    verificarAcceso();
    modalProducto  = new bootstrap.Modal(document.getElementById('modalProducto'));
    modalCategoria = new bootstrap.Modal(document.getElementById('modalCategoria'));
    modalAnimal    = new bootstrap.Modal(document.getElementById('modalAnimal'));
    cargarEstadisticas();
    cargarPedidosRecientes();
});