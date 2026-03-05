function cargarConfirmacion() {
    const ultimoPedido = JSON.parse(localStorage.getItem('ultimoPedido'));

    if (!ultimoPedido) {
        window.location.href = '/';
        return;
    }

    const { id_pedido, comprobante, pedido } = ultimoPedido;

    // Número de pedido y comprobante
    document.getElementById('numero-pedido').innerHTML = `
        Pedido N° <strong>${id_pedido}</strong> &nbsp;|&nbsp;
        Comprobante: <strong>${comprobante.serie}-${comprobante.numero}</strong>
    `;

    // Detalle del pedido
    const detalleContainer = document.getElementById('detalle-pedido');
    
    let itemsHTML = '';
    if (pedido.detalles && pedido.detalles.length > 0) {
        itemsHTML = pedido.detalles.map(item => `
            <div class="detalle-item d-flex justify-content-between">
                <span>${item.producto_nombre} x${item.cantidad}</span>
                <span class="fw-bold">S/. ${parseFloat(item.subtotal).toFixed(2)}</span>
            </div>
        `).join('');
    }

    detalleContainer.innerHTML = `
        ${itemsHTML}
        <div class="d-flex justify-content-between mt-2">
            <span>Costo de envío:</span>
            <span>S/. ${parseFloat(pedido.costo_envio).toFixed(2)}</span>
        </div>
        <div class="d-flex justify-content-between fw-bold fs-5 mt-2 text-success">
            <span>Total pagado:</span>
            <span>S/. ${parseFloat(pedido.total).toFixed(2)}</span>
        </div>
        <div class="mt-3">
            <span class="badge bg-success px-3 py-2">
                <i class="bi bi-check-circle me-1"></i>Pago completado
            </span>
            <span class="badge bg-warning text-dark px-3 py-2 ms-2">
                <i class="bi bi-clock me-1"></i>Pedido pendiente de envío
            </span>
        </div>
    `;

    // Datos de envío
    document.getElementById('detalle-envio').innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <p class="mb-1"><strong>Cliente:</strong> ${pedido.cliente_nombre}</p>
                <p class="mb-1"><strong>Dirección:</strong> ${pedido.direccion_entrega}</p>
                <p class="mb-1"><strong>Zona:</strong> ${pedido.nombre_zona}</p>
            </div>
            <div class="col-md-6">
                <p class="mb-1"><strong>Comprobante:</strong> ${pedido.tipo_comprobante}</p>
                <p class="mb-1"><strong>Estado:</strong> 
                    <span class="text-warning fw-bold">Pendiente de envío</span>
                </p>
                <p class="mb-1"><strong>Fecha:</strong> 
                    ${new Date(pedido.fecha_pedido).toLocaleDateString('es-PE')}
                </p>
            </div>
        </div>
    `;
}

window.addEventListener('DOMContentLoaded', cargarConfirmacion);