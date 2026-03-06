let subtotalProductos = 0;
let costoEnvioActual = 0;
let distritoActual = null;

function verificarLogin() {
    const token = localStorage.getItem('token');
    if (!token) {
        localStorage.setItem('redirectAfterLogin', 'envio');
        window.location.href = '/login.html';
    }
}

function cargarResumen() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    if (carrito.length === 0) {
        window.location.href = '/';
        return;
    }

    const container = document.getElementById('resumen-items');
    subtotalProductos = 0;

    container.innerHTML = carrito.map(item => {
        const precio = parseFloat(item.precio) || 0;
        const cantidad = parseInt(item.cantidad) || 1;
        const itemSubtotal = precio * cantidad;
        subtotalProductos += itemSubtotal;
        return `
        <div class="d-flex justify-content-between align-items-center mb-2">
            <div>
                <span class="fw-bold">${item.nombre}</span>
                <small class="text-muted d-block">x${cantidad} unidades</small>
            </div>
            <span class="text-success fw-bold">S/. ${itemSubtotal.toFixed(2)}</span>
        </div>`;
    }).join('');

    document.getElementById('resumen-subtotal').innerText = 'S/. ' + subtotalProductos.toFixed(2);
    document.getElementById('resumen-total').innerText = 'S/. ' + subtotalProductos.toFixed(2);

    // Prellenar datos del usuario logueado
    const nombre = localStorage.getItem('nombre');
    if (nombre) document.getElementById('nombreEnvio').value = nombre;
}

// Cargar departamentos
async function cargarDepartamentos() {
    try {
        const res = await fetch('/api/ubigeo/departamentos');
        const departamentos = await res.json();
        const select = document.getElementById('departamento');
        departamentos.forEach(d => {
            const option = document.createElement('option');
            option.value = d.id_departamento;
            option.text = d.nombre;
            select.appendChild(option);
        });
    } catch (err) {
        console.error('Error cargando departamentos:', err);
    }
}

// Cargar provincias
async function cargarProvincias() {
    const idDepartamento = document.getElementById('departamento').value;
    const selectProvincia = document.getElementById('provincia');
    const selectDistrito = document.getElementById('distrito');

    selectProvincia.innerHTML = '<option value="">Seleccione...</option>';
    selectDistrito.innerHTML = '<option value="">Seleccione...</option>';
    selectProvincia.disabled = true;
    selectDistrito.disabled = true;

    if (!idDepartamento) return;

    try {
        const res = await fetch(`/api/ubigeo/provincias/${idDepartamento}`);
        const provincias = await res.json();
        provincias.forEach(p => {
            const option = document.createElement('option');
            option.value = p.id_provincia;
            option.text = p.nombre;
            selectProvincia.appendChild(option);
        });
        selectProvincia.disabled = false;
    } catch (err) {
        console.error('Error cargando provincias:', err);
    }
}

// Cargar distritos
async function cargarDistritos() {
    const idProvincia = document.getElementById('provincia').value;
    const selectDistrito = document.getElementById('distrito');

    selectDistrito.innerHTML = '<option value="">Seleccione...</option>';
    selectDistrito.disabled = true;

    if (!idProvincia) return;

    try {
        const res = await fetch(`/api/ubigeo/distritos/${idProvincia}`);
        const distritos = await res.json();
        distritos.forEach(d => {
            const option = document.createElement('option');
            option.value = d.id_distrito;
            option.text = d.nombre;
            option.setAttribute('data-costo', d.costo_envio);
            selectDistrito.appendChild(option);
        });
        selectDistrito.disabled = false;
    } catch (err) {
        console.error('Error cargando distritos:', err);
    }
}

// Actualizar costo de envío
function actualizarCostoEnvio() {
    const selectDistrito = document.getElementById('distrito');
    const opcion = selectDistrito.options[selectDistrito.selectedIndex];

    if (!selectDistrito.value) return;

    costoEnvioActual = parseFloat(opcion.getAttribute('data-costo')) || 5.00;
    distritoActual = {
        id: selectDistrito.value,
        nombre: opcion.text,
        costo: costoEnvioActual
    };

    // Mostrar badge
    const badge = document.getElementById('costo-envio-badge');
    badge.style.display = 'block';
    document.getElementById('costo-envio-texto').innerText = 'S/. ' + costoEnvioActual.toFixed(2);

    // Actualizar resumen
    document.getElementById('resumen-envio').innerText = 'S/. ' + costoEnvioActual.toFixed(2);
    document.getElementById('resumen-envio').classList.remove('text-muted');
    document.getElementById('resumen-envio').classList.add('text-success', 'fw-bold');

    const total = subtotalProductos + costoEnvioActual;
    document.getElementById('resumen-total').innerText = 'S/. ' + total.toFixed(2);
}

document.getElementById('envioForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombreEnvio').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const direccion = document.getElementById('direccion').value.trim();
    const referencias = document.getElementById('referencias').value.trim();

    const depSelect = document.getElementById('departamento');
    const provSelect = document.getElementById('provincia');
    const distSelect = document.getElementById('distrito');

    if (!distSelect.value) {
        alert('Por favor selecciona un distrito');
        return;
    }

    if (!distritoActual) {
        alert('Por favor selecciona un distrito válido');
        return;
    }

    const depNombre = depSelect.options[depSelect.selectedIndex].text;
    const provNombre = provSelect.options[provSelect.selectedIndex].text;
    const distNombre = distSelect.options[distSelect.selectedIndex].text;

    const datosEnvio = {
        nombre,
        telefono,
        direccion,
        referencias,
        id_distrito: distritoActual.id,
        nombre_distrito: distNombre,
        nombre_provincia: provNombre,
        nombre_departamento: depNombre,
        direccion_completa: `${direccion}, ${distNombre}, ${provNombre}, ${depNombre}`,
        costo_envio: costoEnvioActual,
        total: subtotalProductos + costoEnvioActual
    };

    localStorage.setItem('datosEnvio', JSON.stringify(datosEnvio));
    window.location.href = '/comprobante.html';
});

window.addEventListener('DOMContentLoaded', () => {
    verificarLogin();
    cargarResumen();
    cargarDepartamentos();
});
