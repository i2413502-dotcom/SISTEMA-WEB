const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedido.controller');

router.post('/crear', pedidoController.crearPedido);
router.get('/mispedidos', pedidoController.obtenerPedidos);

module.exports = router;