
const mongoose = require("mongoose");

const dbConnection = async()=>{
    try{
        //mongoose.connect("mongodb+srv://admin-aldo:Egipto36@shoplist.uuywaik.mongodb.net/shopList", {useNewUrlParser: true});
        mongoose.connect( process.env.DB_CNN, {useNewUrlParser: true});
        //mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true});
          
        console.log('MongoDB activa');  
    }catch(error){
        console.log(error);
        throw new Error('error iniciando MongoDB');
    }
}

module.exports ={
    dbConnection
}

