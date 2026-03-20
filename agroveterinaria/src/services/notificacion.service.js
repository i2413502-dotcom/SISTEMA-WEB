const db = require('../config/db');

async function enviarNotificacion(titulo, cuerpo, data = {}) {
    try {
        console.log(`📣 Notificación pendiente: ${titulo} - ${cuerpo}`);
        // Firebase FCM se activa después
    } catch (err) {
        console.error('Error notificación:', err);
    }
}

module.exports = { enviarNotificacion };