const mongoose = require("mongoose");
const{Schema,model} = require("mongoose");
const List = require('./List');

const UsuarioSchema = Schema({
    name:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true,
        unique: true
    },
    pwd:{
        type:String,
        require:true
    },

    lista: { type: mongoose.Schema.Types.ObjectId, ref: 'List' }
});


const Usuario = model('Usuario', UsuarioSchema);
module.exports= Usuario;