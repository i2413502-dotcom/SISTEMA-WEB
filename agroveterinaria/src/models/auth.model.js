const db = require('../config/db');

const findByEmail = async (correo) => {
    const [rows] = await db.query(
        'SELECT * FROM persona WHERE correo = ?', [correo]
    );
    return rows[0];
};

const findCliente = async (idPersona) => {
    const [rows] = await db.query(
        'SELECT * FROM cliente WHERE id_persona = ?', [idPersona]
    );
    return rows[0];
};

const findColaborador = async (idPersona) => {
    const [rows] = await db.query(
        'SELECT * FROM colaborador WHERE id_persona = ?', [idPersona]
    );
    return rows[0];
};

const createPersona = async ({ nombres, correo, password }) => {
    const [result] = await db.query(
        `INSERT INTO persona (nombres, correo, password, estado, fecha_creacion) 
         VALUES (?, ?, ?, 'ACTIVO', NOW())`,
        [nombres, correo, password]
    );
    return result.insertId;
};

const createCliente = async (idPersona, idTipoDocumento, numeroDocumento) => {
    await db.query(
        'INSERT INTO cliente (id_persona, id_tipo_documento, numero_documento) VALUES (?, ?, ?)',
        [idPersona, idTipoDocumento, numeroDocumento]
    );
};

module.exports = { 
    findByEmail, 
    findCliente, 
    findColaborador, 
    createPersona, 
    createCliente 
};