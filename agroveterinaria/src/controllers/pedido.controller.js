const pedidoModel = require('../models/pedido.model');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

exports.crearPedido = async (req, res) => {
    try {
        // Verificar token
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ mensaje: 'No autorizado' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const id_persona = decoded.id;

        // Obtener id_cliente
        const [clienteRows] = await db.query(
            'SELECT id_cliente FROM cliente WHERE id_persona = ?',
            [id_persona]
        );
        if (!clienteRows.length) {
            return res.status(404).json({ mensaje: 'Cliente no encontrado' });
        }
        const id_cliente = clienteRows[0].id_cliente;

        const { carrito, datosEnvio, datosComprobante, 
                metodoPago, codigoTransaccion } = req.body;

        // Tipo comprobante: boleta=1, factura=2
        const id_tipo_comprobante = datosComprobante.tipo === 'factura' ? 2 : 1;

        // Tipo pago: yape=1, tarjeta=2
        const id_tipo_pago = metodoPago === 'yape' ? 1 : 2;

        // Crear pedido
        const id_pedido = await pedidoModel.crearPedido({
            id_cliente,
            id_zona: datosEnvio.id_zona,
            id_tipo_comprobante,
            total: datosEnvio.total,
            costo_envio: datosEnvio.costo_envio,
            direccion_entrega: datosEnvio.direccion
        });

        // Crear detalles y actualizar stock
        await pedidoModel.crearDetallePedido(id_pedido, carrito);

        // Crear pago
        await pedidoModel.crearPago(
            id_pedido, 
            id_tipo_pago, 
            datosEnvio.total, 
            codigoTransaccion
        );

        // Crear comprobante
        const comprobante = await pedidoModel.crearComprobante(
            id_pedido, 
            datosComprobante.tipo
        );

        // Obtener pedido completo
        const pedidoCompleto = await pedidoModel.obtenerPedidoCompleto(id_pedido);

        res.status(201).json({
            mensaje: 'Pedido creado exitosamente',
            id_pedido,
            comprobante,
            pedido: pedidoCompleto
        });

    } catch (err) {
        console.error('Error al crear pedido:', err);
        res.status(500).json({ mensaje: 'Error al procesar el pedido' });
    }
};

exports.obtenerPedidos = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ mensaje: 'No autorizado' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const id_persona = decoded.id;

        const [clienteRows] = await db.query(
            'SELECT id_cliente FROM cliente WHERE id_persona = ?',
            [id_persona]
        );
        if (!clienteRows.length) return res.json([]);

        const id_cliente = clienteRows[0].id_cliente;

        const [pedidos] = await db.query(
            `SELECT p.*, tc.nombre AS tipo_comprobante
             FROM pedido p
             LEFT JOIN tipo_comprobante tc ON p.id_tipo_comprobante = tc.id_tipo_comprobante
             WHERE p.id_cliente = ?
             ORDER BY p.fecha_pedido DESC`,
            [id_cliente]
        );

        res.json(pedidos);
    } catch (err) {
        console.error(err);
        res.status(500).json({ mensaje: 'Error al obtener pedidos' });
    }
};