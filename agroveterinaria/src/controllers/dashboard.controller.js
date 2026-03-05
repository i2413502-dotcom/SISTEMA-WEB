const dashboardModel = require('../models/dashboard.model');

exports.getDashboardData = async (req, res) => {
    try {
        const datos = await dashboardModel.getDashboardData();
        res.json(datos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error en dashboard" });
    }
};

exports.getPedidos = async (req, res) => {
    try {
        const pedidos = await dashboardModel.getPedidos();
        res.json(pedidos);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener pedidos" });
    }
};

exports.actualizarEstadoPedido = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;
        await dashboardModel.actualizarEstadoPedido(id, estado);
        res.json({ mensaje: "Estado actualizado" });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al actualizar estado" });
    }
};