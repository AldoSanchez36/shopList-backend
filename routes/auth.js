// Rutas de usuario y autenticacion
// host + /api/auth
const {check} = require('express-validator') 
const  { Router } = require('express');
const router = Router();
const {CrearUsuario,RevalidarUsuario,LoginUsuario} = require('../controllers/auth');
const { validarCampos } = require('../middelwares/validar-campos');
const { validarJWT } = require('../middelwares/validar-jwt');


router.post("/register",
        [
            check('name','el nombre es obligatorio').not().isEmpty(),
            check('email','el email es obligatorio').isEmail(),
            check('pwd','el password debe ser de 6 caracteres').isLength({min:6}),
            validarCampos
        ]
        ,CrearUsuario);//post

//login
router.post("/",
        [
            check('email','el email es obligatorio').isEmail(),
            check('pwd','el password debe ser de 6 caracteres').isLength({min:6}),
            validarCampos
        ]
        ,LoginUsuario);//post


router.get("/renew",validarJWT,RevalidarUsuario);

module.exports = router;