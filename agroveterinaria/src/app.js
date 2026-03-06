require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api/productos', require('./routes/producto.routes.js'));
app.use('/api/auth',      require('./routes/auth.routes.js'));
app.use('/api/categorias', require('./routes/categoria.routes.js'));
app.use('/api/animales', require('./routes/animal.routes.js'));
app.use('/api/carrito',   require('./routes/carrito.routes.js'));
app.use('/api/pedidos',   require('./routes/pedido.routes.js'));
app.use('/api/clientes',  require('./routes/cliente.routes.js'));
app.use('/api/ubigeo',    require('./routes/ubigeo.routes.js'));
app.use('/',              require('./routes/dashboard.routes.js'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('Servidor corriendo en puerto ' + PORT);
});