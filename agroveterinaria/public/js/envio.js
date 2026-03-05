let subtotalProductos = 0;

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
        const itemSubtotal = item.precio * item.cantidad;
        subtotalProductos += itemSubtotal;
        return `
        <div class="d-flex justify-content-between align-items-center mb-2">
            <div>
                <span class="fw-bold">${item.nombre}</span>
                <small class="text-muted d-block">x${item.cantidad} unidades</small>
            </div>
            <span class="text-success fw-bold">S/. ${itemSubtotal.toFixed(2)}</span>
        </div>`;
    }).join('');

    document.getElementById('resumen-subtotal').innerText = 'S/. ' + subtotalProductos.toFixed(2);
    document.getElementById('resumen-total').innerText = 'S/. ' + subtotalProductos.toFixed(2);

    // Prellenar nombre si está logueado
    const nombre = localStorage.getItem('nombre');
    if (nombre) document.getElementById('nombreEnvio').value = nombre;
}

function actualizarCostoEnvio() {
    const zona = document.getElementById('zona');
    const opcion = zona.options[zona.selectedIndex];
    const costo = parseFloat(opcion.getAttribute('data-costo') || 0);
    
    if (costo > 0) {
        document.getElementById('resumen-envio').innerText = 'S/. ' + costo.toFixed(2);
        document.getElementById('resumen-envio').classList.remove('text-muted');
        document.getElementById('resumen-envio').classList.add('text-success');
    } else {
        document.getElementById('resumen-envio').innerText = 'Por seleccionar';
        document.getElementById('resumen-envio').classList.add('text-muted');
    }

    const total = subtotalProductos + costo;
    document.getElementById('resumen-total').innerText = 'S/. ' + total.toFixed(2);
}

document.getElementById('envioForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombreEnvio').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const direccion = document.getElementById('direccion').value.trim();
    const zonaSelect = document.getElementById('zona');
    const referencias = document.getElementById('referencias').value.trim();

    if (!zonaSelect.value) {
        alert('Por favor selecciona una zona de entrega');
        return;
    }

    const opcion = zonaSelect.options[zonaSelect.selectedIndex];
    const costoEnvio = parseFloat(opcion.getAttribute('data-costo'));
    const nombreZona = opcion.text;

    // Guardar datos de envío en localStorage
    const datosEnvio = {
        nombre,
        telefono,
        direccion,
        referencias,
        id_zona: zonaSelect.value,
        nombre_zona: nombreZona,
        costo_envio: costoEnvio,
        total: subtotalProductos + costoEnvio
    };

    localStorage.setItem('datosEnvio', JSON.stringify(datosEnvio));
    window.location.href = '/comprobante.html';
});

window.addEventListener('DOMContentLoaded', () => {
    verificarLogin();
    cargarResumen();
});