const cron = require('node-cron');
const db = require('../config/db');
const { enviarNotificacion } = require('./notificacion.service');

// Cada día a las 8:00 AM
cron.schedule('0 8 * * *', async () => {
    console.log('Verificando stock y vencimiento...');

    const [[bajoStock]] = await db.query(
        `SELECT COUNT(*) AS total FROM producto 
         WHERE stock_actual <= stock_minimo AND estado = 'ACTIVO'`
    );
    if (bajoStock.total > 0) {
        await enviarNotificacion(
            '⚠️ Productos con bajo stock',
            `Hay ${bajoStock.total} producto(s) con stock bajo.`,
            { tipo: 'bajo_stock' }
        );
    }

    const [[porVencer]] = await db.query(
        `SELECT COUNT(*) AS total FROM producto 
         WHERE fecha_vencimiento IS NOT NULL
           AND fecha_vencimiento >= NOW()
           AND fecha_vencimiento <= DATE_ADD(NOW(), INTERVAL 30 DAY)
           AND estado = 'ACTIVO'`
    );
    if (porVencer.total > 0) {
        await enviarNotificacion(
            '📅 Productos próximos a vencer',
            `Hay ${porVencer.total} producto(s) que vencen en 30 días.`,
            { tipo: 'por_vencer' }
        );
    }
});

console.log('✅ Cron de notificaciones activo');