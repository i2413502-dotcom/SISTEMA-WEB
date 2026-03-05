const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/dashboard.controller');

router.get('/api/dashboard',          ctrl.getDashboardData);
router.get('/api/pedidos',            ctrl.getPedidos);
router.put('/api/pedidos/:id/estado', ctrl.actualizarEstadoPedido);

module.exports = router;