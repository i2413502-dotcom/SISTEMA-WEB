const db = require('../config/db');

exports.obtenerProductos = async (filtros = {}) => {
    let sql = `
        SELECT p.*, c.nombre AS categoria, ta.nombre AS tipo_animal
        FROM producto p
        LEFT JOIN categoria_producto c ON p.id_categoria = c.id_categoria
        LEFT JOIN tipo_animal ta ON p.id_tipo_animal = ta.id_tipo_animal
        WHERE p.estado = 'ACTIVO'
    `;
    const params = [];

    if (filtros.nombre) {
        sql += ' AND p.nombre LIKE ?';
        params.push(`%${filtros.nombre}%`);
    }
    if (filtros.categoria) {
        sql += ' AND p.id_categoria = ?';
        params.push(filtros.categoria);
    }
    if (filtros.precio_min) {
        sql += ' AND p.precio_venta >= ?';
        params.push(filtros.precio_min);
    }
    if (filtros.precio_max) {
        sql += ' AND p.precio_venta <= ?';
        params.push(filtros.precio_max);
    }

    const [rows] = await db.query(sql, params);
    return rows;
};

exports.obtenerProductoPorId = async (id) => {
    const [rows] = await db.query(
        `SELECT p.*, c.nombre AS categoria, ta.nombre AS tipo_animal
         FROM producto p
         LEFT JOIN categoria_producto c ON p.id_categoria = c.id_categoria
         LEFT JOIN tipo_animal ta ON p.id_tipo_animal = ta.id_tipo_animal
         WHERE p.id_producto = ?`,
        [id]
    );
    return rows[0];
};

exports.crearProducto = async (data) => {
    const { nombre, descripcion, imagen, precio_venta,
            id_categoria, id_tipo_animal, stock_actual, 
            stock_minimo, marca, ficha_tecnica, 
            colores, composicion, modo_uso, presentacion } = data;
    const [result] = await db.query(
        `INSERT INTO producto 
         (nombre, descripcion, imagen, precio_venta, id_categoria,
          id_tipo_animal, stock_actual, stock_minimo, marca, ficha_tecnica,
          colores, composicion, modo_uso, presentacion, estado, fecha_creacion)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVO', NOW())`,
        [nombre, descripcion, imagen, precio_venta, id_categoria,
         id_tipo_animal, stock_actual, stock_minimo || 5, 
         marca, ficha_tecnica, colores, composicion, modo_uso, presentacion]
    );
    return result;
};

exports.actualizarProducto = async (id, data) => {
    const { nombre, descripcion, precio_venta, stock_actual,
            marca, ficha_tecnica, colores, composicion, 
            modo_uso, presentacion } = data;
    const [result] = await db.query(
        `UPDATE producto SET nombre=?, descripcion=?, precio_venta=?, 
         stock_actual=?, marca=?, ficha_tecnica=?, colores=?,
         composicion=?, modo_uso=?, presentacion=?
         WHERE id_producto=?`,
        [nombre, descripcion, precio_venta, stock_actual,
         marca, ficha_tecnica, colores, composicion, 
         modo_uso, presentacion, id]
    );
    return result;
};

exports.eliminarProducto = async (id) => {
    await db.query(
        "UPDATE producto SET estado='INACTIVO' WHERE id_producto = ?",
        [id]
    );
};