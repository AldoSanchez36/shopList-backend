const {response} = require('express');
const jwt = require('jsonwebtoken');

const validarJWT = (req,res = response,next)=>{
    // x-token headers
    const token = req.headers['x-token'] || '';
console.log(token)
    if(!token){
        return res.status(401).json({msg: 'No hay Token'})
    }

    try{
        const decoded = jwt.verify(token,process.env.SECRET_TOKEN);
    }catch{
        console.log(error);
        return res.status(500).send({ msg: "Token invalido"});
    }

next();
}

module.exports ={
    validarJWT:validarJWT
}