let modalProducto;
let productosLista = [];

// Verificar que sea colaborador
function verificarAcceso() {
    const token = localStorage.getItem('token');
    const rol = localStorage.getItem('rol');
    if (!token || rol !== 'COLABORADOR') {
        window.location.href = '/login.html';
    }
    const nombre = localStorage.getItem('nombre');
    if (nombre) document.getElementById('nombre-admin').innerText = nombre;
}

// Mostrar sección
function mostrarSeccion(seccion) {
    const secciones = ['inicio', 'pedidos', 'productos', 'clientes'];
    secciones.forEach(s => {
        document.getElementById(`seccion-${s}`).classList.add('d-none');
    });
    document.getElementById(`seccion-${seccion}`).classList.remove('d-none');

    // Actualizar título
    const titulos = {
        inicio: 'Dashboard',
        pedidos: 'Gestión de Pedidos',
        productos: 'Inventario de Productos',
        clientes: 'Clientes Registrados'
    };
    document.getElementById('titulo-seccion').innerText = titulos[seccion];

    // Actualizar nav activo
    document.querySelectorAll('.sidebar .nav-link').forEach(l => l.classList.remove('active'));
    event.target.closest('.nav-link').classList.add('active');

    // Cargar datos según sección
    if (seccion === 'pedidos') cargarPedidos();
    if (seccion === 'productos') cargarProductos();
    if (seccion === 'clientes') cargarClientes();
}

// Cerrar sesión
function cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('nombre');
    window.location.href = '/login.html';
}

// Cargar estadísticas
async function cargarEstadisticas() {
    try {
        const res = await fetch('/api/dashboard');
        const data = await res.json();

        document.getElementById('stat-clientes').innerText = data.clientes;
        document.getElementById('stat-pendientes').innerText = data.pedidosPendientes;
        document.getElementById('stat-productos').innerText = data.productos;
        document.getElementById('stat-stock').innerText = data.stockBajo;
    } catch (err) {
        console.error('Error cargando estadísticas:', err);
    }
}

// Color badge estado
function getBadgeEstado(estado) {
    const colores = {
        'PENDIENTE': 'warning text-dark',
        'PAGADO': 'info text-dark',
        'ENVIADO': 'primary',
        'ENTREGADO': 'success',
        'CANCELADO': 'danger'
    };
    return colores[estado] || 'secondary';
}

// Cargar pedidos recientes (inicio)
async function cargarPedidosRecientes() {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/pedidos', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const pedidos = await res.json();
        const recientes = pedidos.slice(0, 5);

        const tbody = document.getElementById('tabla-pedidos-recientes');
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
                    <select class="form-select form-select-sm" style="width:130px;"
                            onchange="actualizarEstado(${p.id_pedido}, this.value)">
                        <option ${p.estado==='PENDIENTE'?'selected':''}>PENDIENTE</option>
                        <option ${p.estado==='ENVIADO'?'selected':''}>ENVIADO</option>
                        <option ${p.estado==='ENTREGADO'?'selected':''}>ENTREGADO</option>
                        <option ${p.estado==='CANCELADO'?'selected':''}>CANCELADO</option>
                    </select>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Error cargando pedidos:', err);
    }
}

// Cargar todos los pedidos
async function cargarPedidos() {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/pedidos', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const pedidos = await res.json();

        const tbody = document.getElementById('tabla-pedidos');
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
                    <select class="form-select form-select-sm" style="width:130px;"
                            onchange="actualizarEstado(${p.id_pedido}, this.value)">
                        <option ${p.estado==='PENDIENTE'?'selected':''}>PENDIENTE</option>
                        <option ${p.estado==='ENVIADO'?'selected':''}>ENVIADO</option>
                        <option ${p.estado==='ENTREGADO'?'selected':''}>ENTREGADO</option>
                        <option ${p.estado==='CANCELADO'?'selected':''}>CANCELADO</option>
                    </select>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Error cargando pedidos:', err);
    }
}

// Actualizar estado pedido
async function actualizarEstado(id, estado) {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/dashboard/pedidos/${id}/estado`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ estado })
        });
        if (res.ok) {
            cargarEstadisticas();
        }
    } catch (err) {
        console.error('Error actualizando estado:', err);
    }
}

// Cargar productos
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

// Mostrar modal nuevo producto
function mostrarModalProducto() {
    document.getElementById('modal-titulo').innerText = 'Nuevo Producto';
    document.getElementById('formProducto').reset();
    document.getElementById('prod-id').value = '';
    modalProducto.show();
}

// Editar producto
function editarProducto(id) {
    const p = productosLista.find(x => x.id_producto === id);
    if (!p) return;

    document.getElementById('modal-titulo').innerText = 'Editar Producto';
    document.getElementById('prod-id').value = p.id_producto;
    document.getElementById('prod-nombre').value = p.nombre;
    document.getElementById('prod-descripcion').value = p.descripcion || '';
    document.getElementById('prod-precio').value = p.precio_venta;
    document.getElementById('prod-stock').value = p.stock_actual;
    document.getElementById('prod-categoria').value = p.id_categoria;
    document.getElementById('prod-imagen').value = p.imagen || '';
    modalProducto.show();
}

// Guardar producto
async function guardarProducto() {
    const id = document.getElementById('prod-id').value;
    const data = {
        nombre: document.getElementById('prod-nombre').value,
        descripcion: document.getElementById('prod-descripcion').value,
        precio_venta: document.getElementById('prod-precio').value,
        stock_actual: document.getElementById('prod-stock').value,
        id_categoria: document.getElementById('prod-categoria').value,
        imagen: document.getElementById('prod-imagen').value,
        id_tipo_animal: 1,
        stock_minimo: 5
    };

    const url = id ? `/api/productos/${id}` : '/api/productos';
    const method = id ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (res.ok) {
            modalProducto.hide();
            cargarProductos();
            cargarEstadisticas();
        }
    } catch (err) {
        alert('Error al guardar producto');
    }
}

// Eliminar producto
async function eliminarProducto(id) {
    if (!confirm('¿Seguro que deseas eliminar este producto?')) return;
    try {
        const res = await fetch(`/api/productos/${id}`, { method: 'DELETE' });
        if (res.ok) {
            cargarProductos();
            cargarEstadisticas();
        }
    } catch (err) {
        alert('Error al eliminar producto');
    }
}

// Cargar clientes
async function cargarClientes() {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/clientes', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const clientes = await res.json();

        const tbody = document.getElementById('tabla-clientes');
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

// Iniciar
window.addEventListener('DOMContentLoaded', () => {
    verificarAcceso();
    modalProducto = new bootstrap.Modal(document.getElementById('modalProducto'));
    cargarEstadisticas();
    cargarPedidosRecientes();
});