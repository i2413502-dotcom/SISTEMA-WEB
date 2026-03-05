const Producto = require('../models/producto.model');

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
        const result = await Producto.crearProducto(req.body);
        res.status(201).json({ message: "Producto creado", id: result.insertId });
    } catch (err) {
        console.error("Error en crear producto:", err);
        res.status(500).json({ mensaje: "Error al crear producto" });
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