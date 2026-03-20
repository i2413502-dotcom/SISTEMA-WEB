const db = require('../config/db');

exports.bajoPorStock = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT p.id_producto, p.nombre, p.imagen, p.precio_venta,
                   p.stock_actual, p.stock_minimo, p.stock_alerta,
                   c.nombre AS categoria
            FROM producto p
            LEFT JOIN categoria_producto c ON p.id_categoria = c.id_categoria
            WHERE p.stock_actual <= p.stock_minimo
              AND p.estado = 'ACTIVO'
            ORDER BY p.stock_actual ASC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener productos con bajo stock' });
    }
};

exports.porVencer = async (req, res) => {
    try {
        const dias = req.query.dias || 30;
        const [rows] = await db.query(`
            SELECT p.id_producto, p.nombre, p.imagen, p.precio_venta,
                   p.stock_actual, p.fecha_vencimiento,
                   DATEDIFF(p.fecha_vencimiento, NOW()) AS dias_restantes,
                   c.nombre AS categoria
            FROM producto p
            LEFT JOIN categoria_producto c ON p.id_categoria = c.id_categoria
            WHERE p.fecha_vencimiento IS NOT NULL
              AND p.fecha_vencimiento >= NOW()
              AND p.fecha_vencimiento <= DATE_ADD(NOW(), INTERVAL ? DAY)
              AND p.estado = 'ACTIVO'
            ORDER BY p.fecha_vencimiento ASC
        `, [dias]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener productos próximos a vencer' });
    }
};