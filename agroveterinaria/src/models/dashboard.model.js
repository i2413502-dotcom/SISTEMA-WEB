const db = require('../config/db');

exports.getDashboardData = async () => {
    const [[clientes]] = await db.query("SELECT COUNT(*) total FROM cliente");
    const [[pedidosPendientes]] = await db.query("SELECT COUNT(*) total FROM pedido WHERE estado='PENDIENTE'");
    const [[pedidosEntregados]] = await db.query("SELECT COUNT(*) total FROM pedido WHERE estado='ENTREGADO'");
    const [[productos]] = await db.query("SELECT COUNT(*) total FROM producto WHERE estado='ACTIVO'");
    const [[stockBajo]] = await db.query("SELECT COUNT(*) total FROM producto WHERE stock_actual <= stock_minimo AND estado='ACTIVO'");

    return {
        clientes: clientes.total,
        pedidosPendientes: pedidosPendientes.total,
        pedidosEntregados: pedidosEntregados.total,
        productos: productos.total,
        stockBajo: stockBajo.total
    };
};

exports.getPedidos = async () => {
    const [rows] = await db.query(`
        SELECT 
            p.id_pedido, p.fecha_pedido, p.total, p.costo_envio,
            p.direccion_entrega, p.estado,
            per.nombres AS cliente_nombre,
            z.nombre_zona AS zona,
            tc.nombre AS tipo_comprobante
        FROM pedido p
        JOIN cliente c ON p.id_cliente = c.id_cliente
        JOIN persona per ON c.id_persona = per.id_persona
        LEFT JOIN zona_envio z ON p.id_zona = z.id_zona
        LEFT JOIN tipo_comprobante tc ON p.id_tipo_comprobante = tc.id_tipo_comprobante
        ORDER BY p.fecha_pedido DESC
    `);
    return rows;
};

exports.actualizarEstadoPedido = async (id, estado) => {
    await db.query("UPDATE pedido SET estado=? WHERE id_pedido=?", [estado, id]);
};