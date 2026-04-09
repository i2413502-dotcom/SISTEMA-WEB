const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authModel = require('../models/auth.model');
const API_PERU_TOKEN = 'b4b56f8c96dcb22d915e4e446b797da7bd9ea4387ff2aa10755f12454c92d10f';
const BASE_URL = 'https://apiperu.dev/api';

const login = async (req, res) => {
    try {
        const { correo, password } = req.body;

        const persona = await authModel.findByEmail(correo);
        if (!persona) return res.status(401).json({ mensaje: "Credenciales incorrectas" });

        const valido = await bcrypt.compare(password, persona.password);
        if (!valido) return res.status(401).json({ mensaje: "Credenciales incorrectas" });

        let rol = null;
        const colaborador = await authModel.findColaborador(persona.id_persona);
        const cliente = await authModel.findCliente(persona.id_persona);

        if (colaborador) rol = 'COLABORADOR';
        else if (cliente) rol = 'CLIENTE';

        const token = jwt.sign(
            { id: persona.id_persona, rol },
            process.env.JWT_SECRET,
            { expiresIn: '4h' }
        );

        res.json({ 
            token, 
            rol, 
            nombre: persona.nombres,
            apellido: persona.apellido_paterno
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error en login" });
    }
};

const register = async (req, res) => {
    try {
        const { nombres, apellidoPaterno, apellidoMaterno, 
                telefono, correo, password, 
                tipoDocumento, numeroDocumento } = req.body;

        if (!nombres || !correo || !password) {
            return res.status(400).json({ mensaje: "Campos obligatorios faltantes" });
        }

        const existe = await authModel.findByEmail(correo);
        if (existe) return res.status(400).json({ mensaje: "Correo ya registrado" });

        const hash = await bcrypt.hash(password, 10);

        const idPersona = await authModel.createPersona({ 
            nombres, 
            apellidoPaterno, 
            apellidoMaterno,
            telefono,
            correo, 
            password: hash 
        });

        

        const idTipoDoc = tipoDocumento === 'RUC' ? 2 : 1;
        await authModel.createCliente(idPersona, idTipoDoc, numeroDocumento);

        const token = jwt.sign(
            { id: idPersona, rol: 'CLIENTE' },
            process.env.JWT_SECRET,
            { expiresIn: '4h' }
        );

        res.status(201).json({ 
            token, 
            rol: 'CLIENTE', 
            nombre: nombres 
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ mensaje: "Error en registro" });
    }
};

const consultarDocumento = async (req, res) => {
    try {
        const { tipo, numero } = req.query;

        if (!tipo || !numero) {
            return res.status(400).json({ success: false, mensaje: 'Faltan parámetros' });
        }

        if (tipo === 'DNI') {
            // Simulación API RENIEC
            // En producción usar: https://api.apis.net.pe/v1/dni?numero=
            try {
                const response = await fetch(`${BASE_URL}/dni?numero=${numero}`, {
                   method: 'GET',
            headers: {
                'Authorization': `Bearer ${API_PERU_TOKEN}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
                });
                const data = await response.json();

               if (data.success && data.data) {
            const persona = data.data;
            return res.json({
                success: true,
                nombres: persona.nombres,
                apellidoPaterno: persona.apellido_paterno,
                apellidoMaterno: persona.apellido_materno,
                nombreCompleto: persona.nombre_completo
            });
        } else {
            return res.json({
                success: false,
                mensaje: 'No se encontró el DNI, ingresa tus datos manualmente'
            });
        }

            } catch (err) {
                return res.json({
                    success: false,
                    mensaje: 'Servicio de DNI no disponible'
                });
            }

        } else if (tipo === 'RUC') {
            try {
                const response = await fetch(`${BASE_URL}/ruc?numero=${numero}`, {
                   method: 'GET',
            headers: {
                'Authorization': `Bearer ${API_PERU_TOKEN}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
                });
                const data = await response.json();

                if (data.razonSocial) {
                    return res.json({
                        success: true,
                        razonSocial: data.razonSocial,
                        direccion: data.direccion
                    });
                } else {
                    return res.json({
                        success: false,
                        mensaje: 'No se encontró el RUC, ingresa tus datos manualmente'
                    });
                }
            } catch (err) {
                return res.json({
                    success: false,
                    mensaje: 'Servicio no disponible, ingresa tus datos manualmente'
                });
            }
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, mensaje: 'Error en consulta' });
    }
};

const getPerfil = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ mensaje: 'No autorizado' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const persona = await authModel.findPersonaById(decoded.id);

        if (!persona) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

        res.json({
            id_persona: persona.id_persona,
            nombres: persona.nombres,
            apellido_paterno: persona.apellido_paterno,
            apellido_materno: persona.apellido_materno,
            correo: persona.correo,
            telefono: persona.telefono,
            numero_documento: persona.numero_documento,
            tipo_documento: persona.tipo_documento
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ mensaje: 'Error al obtener perfil' });
    }
};

const getDatosEnvio = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ mensaje: 'No autorizado' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const [rows] = await db.query(
            `SELECT per.nombres, per.apellido_paterno, per.apellido_materno,
                    per.telefono, per.correo,
                    cli.numero_documento, td.nombre AS tipo_documento,
                    cli.direccion_habitual, cli.referencia_habitual
             FROM persona per
             JOIN cliente cli ON cli.id_persona = per.id_persona
             LEFT JOIN tipo_documento td ON cli.id_tipo_documento = td.id_tipo_documento
             WHERE per.id_persona = ?`,
            [decoded.id]
        );

        if (!rows.length) return res.status(404).json({ mensaje: 'Cliente no encontrado' });
        res.json(rows[0]);

    } catch (err) {
        console.error(err);
        res.status(500).json({ mensaje: 'Error al obtener datos' });
    }
};

const guardarDireccionHabitual = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ mensaje: 'No autorizado' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { direccion, referencia } = req.body;

        const [clienteRows] = await db.query(
            'SELECT id_cliente FROM cliente WHERE id_persona = ?', [decoded.id]
        );
        if (!clienteRows.length) return res.status(404).json({ mensaje: 'Cliente no encontrado' });

        await db.query(
            'UPDATE cliente SET direccion_habitual = ?, referencia_habitual = ? WHERE id_persona = ?',
            [direccion || null, referencia || null, decoded.id]
        );

        res.json({ mensaje: 'Dirección guardada' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ mensaje: 'Error al guardar dirección' });
    }
};

const actualizarPerfil = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ mensaje: 'No autorizado' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { nombres, apellido_paterno, apellido_materno, telefono } = req.body;

        await db.query(
            `UPDATE persona SET nombres=?, apellido_paterno=?, 
             apellido_materno=?, telefono=? WHERE id_persona=?`,
            [nombres, apellido_paterno, apellido_materno, telefono, decoded.id]
        );

        res.json({ mensaje: 'Perfil actualizado correctamente' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ mensaje: 'Error al actualizar perfil' });
    }
};

const cambiarPassword = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ mensaje: 'No autorizado' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { passwordActual, passwordNueva } = req.body;

        const persona = await authModel.findPersonaById(decoded.id);
        if (!persona) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

        const valido = await bcrypt.compare(passwordActual, persona.password);
        if (!valido) return res.status(400).json({ mensaje: 'Contraseña actual incorrecta' });

        const hash = await bcrypt.hash(passwordNueva, 10);
        await db.query(
            'UPDATE persona SET password=? WHERE id_persona=?',
            [hash, decoded.id]
        );

        res.json({ mensaje: 'Contraseña cambiada correctamente' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ mensaje: 'Error al cambiar contraseña' });
    }
};

const guardarFcmToken = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ mensaje: 'No autorizado' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { fcm_token } = req.body;

        await db.query(
            'UPDATE colaborador SET fcm_token = ? WHERE id_persona = ?',
            [fcm_token, decoded.id]
        );
        res.json({ mensaje: 'Token FCM guardado' });
    } catch (err) {
        res.status(500).json({ mensaje: 'Error al guardar token FCM' });
    }
};

module.exports = { login, register, consultarDocumento, getPerfil, getDatosEnvio, guardarDireccionHabitual, actualizarPerfil, cambiarPassword, guardarFcmToken };