const Producto = require('../models/producto.model');
const db = require('../config/db');

exports.listar = async (req, res) => {
    try {
        const filtros = req.query;
        const results = await Producto.obtenerProductos(filtros);
        res.json(results);
    } catch (err) {
        console.error("Error en listar productos:", err);
        res.status(500).json({ mensaje: "Error al obtener productos" });
    }
};

exports.obtenerPorId = async (req, res) => {
    try {
        const producto = await Producto.obtenerProductoPorId(req.params.id);
        if (!producto) return res.status(404).json({ mensaje: "Producto no encontrado" });
        res.json(producto);
    } catch (err) {
        console.error("Error en obtener producto por ID:", err);
        res.status(500).json({ mensaje: "Error al obtener producto" });
    }
};

exports.crear = async (req, res) => {
    try {
        const imagen = req.file ? req.file.filename : null;

        const result = await Producto.crearProducto({
            nombre:            req.body.nombre,
            descripcion:       req.body.descripcion       || null,
            imagen,
            precio_venta:      req.body.precio_venta,
            id_categoria:      req.body.id_categoria,
            id_tipo_animal:    req.body.id_tipo_animal,
            stock_actual:      req.body.stock_actual,
            stock_minimo:      req.body.stock_minimo      || 5,
            codigo_barra:      req.body.codigo_barra      || null,
            fecha_vencimiento: req.body.fecha_vencimiento || null,
        });

        res.json({
            mensaje: 'Producto creado correctamente',
            id: result.insertId
        });
    } catch (error) {
        console.error('Error en crear producto:', error);
        res.status(500).json({
            mensaje: 'Error al crear producto',
            error: error.message
        });
    }
};

exports.actualizar = async (req, res) => {
    try {
        await Producto.actualizarProducto(req.params.id, req.body);
        res.json({ mensaje: "Producto actualizado" });
    } catch (err) {
        console.error("Error en actualizar producto:", err);
        res.status(500).json({ mensaje: "Error al actualizar producto" });
    }
};

exports.eliminar = async (req, res) => {
    try {
        await Producto.eliminarProducto(req.params.id);
        res.json({ mensaje: "Producto eliminado" });
    } catch (err) {
        console.error("Error en eliminar producto:", err);
        res.status(500).json({ mensaje: "Error al eliminar producto" });
    }
};