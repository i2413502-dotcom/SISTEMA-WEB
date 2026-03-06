const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authModel = require('../models/auth.model');

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
                const response = await fetch(`https://api.apis.net.pe/v1/dni?numero=${numero}`, {
                    headers: { 'Authorization': 'Bearer apis-token-dev' }
                });
                const data = await response.json();

                if (data.nombres) {
                    return res.json({
                        success: true,
                        nombres: data.nombres,
                        apellidoPaterno: data.apellidoPaterno,
                        apellidoMaterno: data.apellidoMaterno
                    });
                } else {
                    // Si la API falla, permitir ingreso manual
                    return res.json({
                        success: false,
                        mensaje: 'No se encontró el DNI, ingresa tus datos manualmente'
                    });
                }
            } catch (err) {
                return res.json({
                    success: false,
                    mensaje: 'Servicio no disponible, ingresa tus datos manualmente'
                });
            }

        } else if (tipo === 'RUC') {
            try {
                const response = await fetch(`https://api.apis.net.pe/v1/ruc?numero=${numero}`, {
                    headers: { 'Authorization': 'Bearer apis-token-dev' }
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

module.exports = { login, register, consultarDocumento, getPerfil, actualizarPerfil, cambiarPassword };