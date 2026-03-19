const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/inventario.controller');

router.get('/bajo-stock',  ctrl.bajoPorStock);
router.get('/por-vencer',  ctrl.porVencer);

module.exports = router;