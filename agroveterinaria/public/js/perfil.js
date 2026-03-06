let perfilData = null;

function actualizarContadorCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const total = carrito.reduce((sum, i) => sum + i.cantidad, 0);
    const badge = document.getElementById('cart-count');
    if (badge) badge.innerText = total;
}

function verificarLogin() {
    const token = localStorage.getItem('token');
    const rol = localStorage.getItem('rol');
    if (!token || rol !== 'CLIENTE') {
        window.location.href = '/login.html';
    }
}

function mostrarSeccion(seccion) {
    const secciones = ['datos', 'pedidos', 'password'];
    secciones.forEach(s => {
        document.getElementById(`seccion-${s}`).classList.add('d-none');
    });
    document.getElementById(`seccion-${seccion}`).classList.remove('d-none');

    document.querySelectorAll('.nav-perfil .nav-link').forEach(l => l.classList.remove('active'));
    event.target.closest('.nav-link').classList.add('active');

    if (seccion === 'pedidos') cargarPedidos();
}

function cerrarSesion() {
    localStorage.clear();
    window.location.href = '/login.html';
}

async function cargarPerfil() {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch('/api/auth/perfil', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        perfilData = await res.json();

        // Header
        document.getElementById('perfil-nombre').innerText =
            `${perfilData.nombres} ${perfilData.apellido_paterno || ''}`;
        document.getElementById('perfil-correo').innerText = perfilData.correo;

        // Formulario datos
        document.getElementById('datos-nombres').value = perfilData.nombres || '';
        document.getElementById('datos-apellido-paterno').value = perfilData.apellido_paterno || '';
        document.getElementById('datos-apellido-materno').value = perfilData.apellido_materno || '';
        document.getElementById('datos-telefono').value = perfilData.telefono || '';
        document.getElementById('datos-correo').value = perfilData.correo || '';
        document.getElementById('datos-documento').value =
            `${perfilData.tipo_documento || ''}: ${perfilData.numero_documento || ''}`;

    } catch (err) {
        console.error('Error cargando perfil:', err);
    }
}

async function cargarPedidos() {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch('/api/pedidos/mispedidos', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const pedidos = await res.json();
        const container = document.getElementById('lista-pedidos');

        if (!pedidos.length) {
            container.innerHTML = `
                <div class="text-center py-5 text-muted">
                    <i class="bi bi-bag-x" style="font-size:3rem;"></i>
                    <h5 class="mt-3">No tienes pedidos aún</h5>
                    <a href="/" class="btn btn-agro mt-2">Ver productos</a>
                </div>`;
            return;
        }

        const colores = {
            'PENDIENTE': 'warning text-dark',
            'ENVIADO': 'primary',
            'ENTREGADO': 'success',
            'CANCELADO': 'danger'
        };

        container.innerHTML = pedidos.map(p => `
            <div class="card mb-3 shadow-sm">
                <div class="card-body">
                    <div class="row align-items-center">
                        <div class="col-md-3">
                            <h6 class="fw-bold mb-0">Pedido #${p.id_pedido}</h6>
                            <small class="text-muted">
                                ${new Date(p.fecha_pedido).toLocaleDateString('es-PE')}
                            </small>
                        </div>
                        <div class="col-md-3">
                            <span class="badge bg-${colores[p.estado] || 'secondary'} badge-estado">
                                ${p.estado}
                            </span>
                        </div>
                        <div class="col-md-3">
                            <span class="text-muted small">${p.tipo_comprobante || ''}</span>
                        </div>
                        <div class="col-md-3 text-end">
                            <h5 class="fw-bold text-success mb-0">
                                S/. ${parseFloat(p.total).toFixed(2)}
                            </h5>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

    } catch (err) {
        console.error('Error cargando pedidos:', err);
    }
}

// Guardar datos personales
document.getElementById('formDatos').addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const mensaje = document.getElementById('mensaje-datos');

    try {
        const res = await fetch('/api/auth/actualizar-perfil', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({
                nombres: document.getElementById('datos-nombres').value.trim(),
                apellido_paterno: document.getElementById('datos-apellido-paterno').value.trim(),
                apellido_materno: document.getElementById('datos-apellido-materno').value.trim(),
                telefono: document.getElementById('datos-telefono').value.trim()
            })
        });

        const data = await res.json();
        mensaje.textContent = data.mensaje;
        mensaje.className = `alert ${res.ok ? 'alert-success' : 'alert-danger'}`;
        mensaje.classList.remove('d-none');

        if (res.ok) {
            localStorage.setItem('nombre', document.getElementById('datos-nombres').value.trim());
        }

    } catch (err) {
        mensaje.textContent = 'Error al guardar cambios';
        mensaje.className = 'alert alert-danger';
        mensaje.classList.remove('d-none');
    }
});

// Cambiar contraseña
document.getElementById('formPassword').addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const mensaje = document.getElementById('mensaje-password');

    const passNueva = document.getElementById('pass-nueva').value;
    const passConfirmar = document.getElementById('pass-confirmar').value;

    if (passNueva !== passConfirmar) {
        mensaje.textContent = 'Las contraseñas no coinciden';
        mensaje.className = 'alert alert-danger';
        mensaje.classList.remove('d-none');
        return;
    }

    try {
        const res = await fetch('/api/auth/cambiar-password', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({
                passwordActual: document.getElementById('pass-actual').value,
                passwordNueva: passNueva
            })
        });

        const data = await res.json();
        mensaje.textContent = data.mensaje;
        mensaje.className = `alert ${res.ok ? 'alert-success' : 'alert-danger'}`;
        mensaje.classList.remove('d-none');

        if (res.ok) document.getElementById('formPassword').reset();

    } catch (err) {
        mensaje.textContent = 'Error al cambiar contraseña';
        mensaje.className = 'alert alert-danger';
        mensaje.classList.remove('d-none');
    }
});

window.addEventListener('DOMContentLoaded', () => {
    verificarLogin();
    cargarPerfil();
    actualizarContadorCarrito();
});