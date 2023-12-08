const express = require('express');
const bcrypt = require('bcryptjs');
const {validationResult} = require('express-validator');
const Usuarios = require('../models/Usuarios');
const List = require('../models/List');
const jwt = require('jsonwebtoken');


const CrearUsuario = async (req, res = express.response) => {
    const { email, pwd } = req.body;

    try {
        let usuario = await Usuarios.findOne({ email });

        if (usuario) {
            return res.status(400).json({
                ok: false,
                uid: usuario.id,
                msg: 'Este correo ya existe',
            });
        }

        // Encriptar la contraseña antes de almacenarla
        const salt = await bcrypt.genSalt(10);
        const hashedPwd = await bcrypt.hash(pwd, salt);

        usuario = new Usuarios({ email, pwd: hashedPwd });

        await usuario.save();

        // Crear una nueva lista con el nombre igual al uid del usuario
        // if (!usuario.lista) {
        // const listaNombre = usuario.id;
        // const nuevaLista = new List({ name: listaNombre, items: [] });
        // await nuevaLista.save();

        // // Asigna la lista al usuario
        // usuario.lista = nuevaLista.id;
        // await usuario.save();

        // }
        res.status(201).json({
            ok: true,
            msg: 'Usuario registrado exitosamente',
            redirect: '/',
            alert: false,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Por favor, notifica al administrador. error en registro',
            alert: false,
        });
    }
};



const LoginUsuario = async (req, res = express.response) => {
    const { email, pwd } = req.body;

    try {
        let usuario = await Usuarios.findOne({ email });

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                msg: 'Credenciales inválidas',
            });
        }

        // Verificar la contraseña utilizando bcrypt.compare
        const validPwd = await bcrypt.compare(pwd, usuario.pwd);

        if (!validPwd) {
            return res.status(400).json({
                ok: false,
                msg: 'Credenciales inválidas',
            });
        }

        // Verificamos si el usuario ya tiene una lista asociada
        if (!usuario.lista) {
            // Crear una nueva lista con el nombre igual al uid del usuario
            const listaNombre = usuario.id;
            const nuevaLista = new List({ name: listaNombre, items: [] });
            await nuevaLista.save();

            // Asigna la lista al usuario
            usuario.lista = nuevaLista.id;
            await usuario.save();
        }

        // Generar un token de autenticación
        const token = jwt.sign({ uid: usuario.id }, process.env.SECRET_TOKEN);

        res.status(200).json({
            ok: true,
            uid: usuario.id,
            name: usuario.name,
            token,
            redirect: '/shop'
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Por favor, notifica al administrador.',
        });
    }
};

const RevalidarUsuario  = async(req,res= express.response)=>{

    const {uid,name} = req;

    const token = jwt.sign({ uid:uid}, process.env.SECRET_TOKEN);

    res.json({
        ok:true,
        msg:'renew',
        uid,
        //token
    })
}



module.exports ={
    CrearUsuario,RevalidarUsuario,LoginUsuario
}