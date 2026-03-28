const multer = require('multer');
const path   = require('path');
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/producto.controller');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

router.get('/',       ctrl.listar);
router.get('/:id',    ctrl.obtenerPorId);
router.post('/',      ctrl.crear);
router.put('/:id',    ctrl.actualizar);
router.delete('/:id', ctrl.eliminar);
router.post('/', upload.single('imagen'), ctrl.crear);

module.exports = router;