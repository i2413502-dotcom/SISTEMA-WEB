let tipoSeleccionado = null;
let datosPersona = null;

async function cargarDatosPersona() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const res = await fetch('/api/auth/perfil', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (res.ok) {
            datosPersona = await res.json();
        }
    } catch (err) {
        console.error('Error cargando perfil:', err);
    }
}

function seleccionarTipo(tipo) {
    tipoSeleccionado = tipo;

    document.getElementById('card-boleta').classList.remove('seleccionado');
    document.getElementById('card-factura').classList.remove('seleccionado');
    document.getElementById('form-boleta').classList.add('d-none');
    document.getElementById('form-factura').classList.add('d-none');
    document.getElementById('mensaje-tipo').classList.add('d-none');

    if (tipo === 'boleta') {
        document.getElementById('card-boleta').classList.add('seleccionado');
        document.getElementById('form-boleta').classList.remove('d-none');

        // Autocompletar con datos del cliente
        if (datosPersona) {
            if (datosPersona.numero_documento) {
                document.getElementById('dni').value = datosPersona.numero_documento;
            }
            const nombreCompleto = `${datosPersona.nombres} ${datosPersona.apellido_paterno || ''} ${datosPersona.apellido_materno || ''}`.trim();
            document.getElementById('nombre-boleta').value = nombreCompleto;
        }
    } else {
        document.getElementById('card-factura').classList.add('seleccionado');
        document.getElementById('form-factura').classList.remove('d-none');
    }
}

function validarDNI() {
    const dni = document.getElementById('dni').value.trim();
    const resultado = document.getElementById('resultado-dni');

    if (dni.length !== 8 || isNaN(dni)) {
        resultado.innerHTML = '<span class="text-danger">El DNI debe tener 8 dígitos</span>';
        return;
    }
    resultado.innerHTML = '<span class="text-success"><i class="bi bi-check-circle me-1"></i>DNI válido</span>';
}

function validarRUC() {
    const ruc = document.getElementById('ruc').value.trim();
    const resultado = document.getElementById('resultado-ruc');

    if (ruc.length !== 11 || isNaN(ruc)) {
        resultado.innerHTML = '<span class="text-danger">El RUC debe tener 11 dígitos</span>';
        return;
    }
    if (!ruc.startsWith('10') && !ruc.startsWith('20')) {
        resultado.innerHTML = '<span class="text-danger">RUC inválido. Debe empezar con 10 o 20</span>';
        return;
    }
    resultado.innerHTML = '<span class="text-success"><i class="bi bi-check-circle me-1"></i>RUC válido</span>';
}

function continuarPago() {
    if (!tipoSeleccionado) {
        document.getElementById('mensaje-tipo').classList.remove('d-none');
        return;
    }

    let datosComprobante = { tipo: tipoSeleccionado };

    if (tipoSeleccionado === 'boleta') {
        const dni = document.getElementById('dni').value.trim();
        const nombre = document.getElementById('nombre-boleta').value.trim();

        if (!dni || !nombre) {
            alert('Por favor completa los datos de la boleta');
            return;
        }
        if (dni.length !== 8) {
            alert('El DNI debe tener 8 dígitos');
            return;
        }

        datosComprobante.dni = dni;
        datosComprobante.nombre = nombre;

    } else {
        const ruc = document.getElementById('ruc').value.trim();
        const razonSocial = document.getElementById('razon-social').value.trim();
        const direccionFiscal = document.getElementById('direccion-fiscal').value.trim();

        if (!ruc || !razonSocial) {
            alert('Por favor completa los datos de la factura');
            return;
        }
        if (ruc.length !== 11) {
            alert('El RUC debe tener 11 dígitos');
            return;
        }

        datosComprobante.ruc = ruc;
        datosComprobante.razon_social = razonSocial;
        datosComprobante.direccion_fiscal = direccionFiscal;
    }

    localStorage.setItem('datosComprobante', JSON.stringify(datosComprobante));
    window.location.href = '/pago.html';
}

function cargarResumen() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const datosEnvio = JSON.parse(localStorage.getItem('datosEnvio'));

    if (!datosEnvio || carrito.length === 0) {
        window.location.href = '/';
        return;
    }

    let subtotal = 0;
    const container = document.getElementById('resumen-items');

    container.innerHTML = carrito.map(item => {
        const precio = parseFloat(item.precio) || 0;
        const cantidad = parseInt(item.cantidad) || 1;
        const itemSubtotal = precio * cantidad;
        subtotal += itemSubtotal;
        return `
        <div class="d-flex justify-content-between mb-2">
            <span>${item.nombre} x${cantidad}</span>
            <span class="text-success fw-bold">S/. ${itemSubtotal.toFixed(2)}</span>
        </div>`;
    }).join('');

    document.getElementById('resumen-subtotal').innerText = 'S/. ' + subtotal.toFixed(2);
    document.getElementById('resumen-envio').innerText = 'S/. ' + parseFloat(datosEnvio.costo_envio).toFixed(2);
    document.getElementById('resumen-total').innerText = 'S/. ' + parseFloat(datosEnvio.total).toFixed(2);

    document.getElementById('resumen-envio-datos').innerHTML = `
        <p class="mb-1"><i class="bi bi-person me-1"></i>${datosEnvio.nombre}</p>
        <p class="mb-1"><i class="bi bi-telephone me-1"></i>${datosEnvio.telefono}</p>
        <p class="mb-1"><i class="bi bi-geo-alt me-1"></i>${datosEnvio.direccion}</p>
        <p class="mb-0"><i class="bi bi-map me-1"></i>${datosEnvio.nombre_distrito}, ${datosEnvio.nombre_provincia}</p>
    `;
}

window.addEventListener('DOMContentLoaded', async () => {
    await cargarDatosPersona();
    cargarResumen();
});