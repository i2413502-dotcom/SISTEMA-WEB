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

        res.json({ token, rol, nombre: persona.nombres });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error en login" });
    }
};

const register = async (req, res) => {
    try {
        const { nombres, correo, password, tipoDocumento, numeroDocumento } = req.body;

        if (!nombres || !correo || !password) {
            return res.status(400).json({ mensaje: "Campos obligatorios faltantes" });
        }

        const existe = await authModel.findByEmail(correo);
        if (existe) return res.status(400).json({ mensaje: "Correo ya registrado" });

        const hash = await bcrypt.hash(password, 10);
        const idPersona = await authModel.createPersona({ nombres, correo, password: hash });

        const idTipoDoc = tipoDocumento === 'RUC' ? 2 : 1;
        await authModel.createCliente(idPersona, idTipoDoc, numeroDocumento);

        const token = jwt.sign(
            { id: idPersona, rol: 'CLIENTE' },
            process.env.JWT_SECRET,
            { expiresIn: '4h' }
        );

        res.status(201).json({ token, rol: 'CLIENTE', nombre: nombres });

    } catch (err) {
        console.error(err);
        res.status(500).json({ mensaje: "Error en registro" });
    }
};

module.exports = { login, register };