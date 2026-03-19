require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const multer  = require('multer');
const fs      = require('fs');

const app = express();

// ── Carpeta de uploads ───────────────────────────────────────
const uploadDir = path.join(__dirname, '..', 'public', 'img', 'productos');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ── Configuración de multer (subida de imágenes) ─────────────
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename:    (req, file, cb) => {
        const ext    = path.extname(file.originalname);
        const nombre = Date.now() + '-' + Math.round(Math.random() * 1e6) + ext;
        cb(null, nombre);
    }
});
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const tipos = /jpeg|jpg|png|webp|gif/;
        cb(null, tipos.test(path.extname(file.originalname).toLowerCase()));
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

// ── Ruta para subir imagen de producto ──────────────────────
app.post('/api/upload/imagen-producto', upload.single('imagen'), (req, res) => {
    if (!req.file) return res.status(400).json({ mensaje: 'No se recibió imagen' });
    res.json({ nombre: req.file.filename, url: `/img/productos/${req.file.filename}` });
});

// ── Rutas de la app ──────────────────────────────────────────
app.use('/api/productos',     require('./routes/producto.routes.js'));
app.use('/api/auth',          require('./routes/auth.routes.js'));
app.use('/api/categorias',    require('./routes/categoria.routes.js'));
app.use('/api/animales',      require('./routes/animal.routes.js'));
app.use('/api/carrito',       require('./routes/carrito.routes.js'));
app.use('/api/pedidos',       require('./routes/pedido.routes.js'));
app.use('/api/clientes',      require('./routes/cliente.routes.js'));
app.use('/api/ubigeo',        require('./routes/ubigeo.routes.js'));
app.use('/api/colaboradores', require('./routes/colaborador.routes.js'));
app.use('/',                  require('./routes/dashboard.routes.js'));
app.use('/api/inventario', require('./routes/inventario.routes.js'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Servidor corriendo en puerto ' + PORT));