require('dotenv').config();
const express = require("express");
const cors = require("cors");
const bodyParser= require('body-parser')

const path = require('path');
const List     = require('./models/List');
const Usuario = require('./models/Usuarios');
const Items = require('./models/Estatus');
const authRouter = require('./routes/auth');
const {dbConnection} =require('./DB/config')

//const passportLocalMoongose = require('passport-local-mongoose')

const port = process.env.PORT || 4000; // Use process.env.PORT if defined, otherwise default to 3000
const hostname = "0.0.0.0"; // Listen on all available network interfaces

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(express.json());
app.use(cors());
//DB Conection carpeta DB
dbConnection();



app.use('/api/auth', authRouter); 

//obtener todos los elementos
app.get('/home', async (req, res) => { 
  try {
    const allItems = await Items.find(); 
    res.json(allItems); 
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message });
  }
});


//agregrar elementos
app.post("/", async function(req, res){
  try {
    const itemName =  req.body.name;
    const itemPrice = req.body.price;
    const itemCheck = req.body.check;

    const nuevoItems = new Items({
      name: itemName,
      price: itemPrice,
      check: itemCheck
    });

    await nuevoItems.save();
    //console.log("EstadoFinal added successfully.");
    res.redirect("/");
  } catch (err) {
    console.error(err); // Maneja el error de guardar en la base de datos
    res.status(500).send("Error al guardar en la base de datos");
  }
});


//////////////agregando 
app.get('/home/:userId', async (req, res) => {

  try {
    const userId = req.params.userId;
    // Buscar todos los elementos asociados al usuario
    const usuario = await Usuario.findById(userId).populate('lista');
    //console.log(usuario)
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    const userItemsId = await List.findOne({ "name": userId });
    if (userItemsId) {
      const userItems = userItemsId.itemsList;
      //console.log(userItems);
      res.json(userItems);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message });
  }
});

app.post("/:userId", async function(req, res){

  //console.log(req.body)
  try {
    const itemName = req.body.name;
    const itemPrice = req.body.price;
    const itemCheck = req.body.check;
    const listId = req.body.uid;
    if (itemName !== '' && itemPrice !== '' && itemCheck !== '') {
      // Crear un nuevo elemento
      const nuevoItem = new Items({
        name: itemName,
        price: itemPrice,
        check: itemCheck,
        userId: listId  // Ajusta según tus necesidades
      });

      // Guardar el nuevo elemento en la colección items
      await nuevoItem.save();

      // Actualizar el campo itemsList en el modelo List
      const list = await List.findOne({ "name": listId });
      list.itemsList.push(nuevoItem);  // Aquí usamos directamente el objeto nuevoItem
      await list.save();

      //console.log("Elemento agregado con éxito a la colección itemsList.");
      res.status(200).json({ message: "Elemento agregado con éxito a la colección itemsList" });
    } else {
      //console.log("Campos vacíos, no se agregó ningún elemento.");
      res.status(400).json({ message: "Campos vacíos, no se agregó ningún elemento." });
    }

  } catch (err) {
    console.error(err);
    res.status(500).send("Error al guardar en la base de datos");
  }
});

app.patch("/editCheck/:itemId", async function(req, res){
  const itemId = req.params.itemId;
  const { check } = req.body;
  //console.log(itemId,check)
  try {
    // Encontrar el elemento por ID y actualizar sus campos
    const updatedItem = await List.updateOne(
      { 'itemsList._id': itemId },
      { $set: { 'itemsList.$.check': check } }
    );

    //console.log(updatedItem )
    if (updatedItem) {
      // Éxito: Se ha modificado al menos un elemento
      res.status(200).json({ message: 'Elemento actualizado correctamente' });
    } else {
      // Error: No se encontró el elemento o no se realizó ninguna modificación
      res.status(404).json({ message: 'Elemento no encontrado o no se realizó ninguna modificación' });
    }
  } catch (error) {
    console.error("Error al editar el elemento:", error);
    res.status(500).send("Error interno del servidor al editar el elemento");
  }
});

app.patch("/edit/:itemId", async function(req, res){
  const itemId = req.params.itemId;
  const { name, price } = req.body;
  //console.log(itemId,name,price)
  try {
    // Encontrar el elemento por ID y actualizar sus campos
    const updatedName = await List.updateOne(
      { 'itemsList._id': itemId },
      { $set: { 'itemsList.$.name': name } }
    );
    const updatedPrice = await List.updateOne(
      { 'itemsList._id': itemId },
      { $set: { 'itemsList.$.price': price } }
    );
    if (updatedName && updatedPrice) {
      // Éxito: Se ha modificado al menos un elemento
      res.status(200).json({ message: 'Elemento actualizado correctamente' });
    } else {
      // Error: No se encontró el elemento o no se realizó ninguna modificación
      res.status(404).json({ message: 'Elemento no encontrado o no se realizó ninguna modificación' });
    }
  } catch (error) {
    console.error("Error al editar el elemento:", error);
    res.status(500).send("Error interno del servidor al editar el elemento");
  }

});

app.patch("/delete/:itemId", async function(req, res){
  const itemId = req.params.itemId;

  try {
    // Eliminar el elemento en MongoDB usando el ID
    const result = await List.updateOne(
      {},
      { $pull: { 'itemsList': { _id: itemId } } }
    );
      //console.log(result)
     if (result.nModified > 0) {
       // Éxito: Se ha eliminado al menos un elemento
       res.status(200).json({ message: 'Elemento eliminado correctamente' });
     } else {
       // Error: No se encontró el elemento o no se realizó ninguna modificación
       res.status(404).json({ message: 'Elemento no encontrado o no se realizó ninguna modificación' });
     }
  } catch (error) {
    console.error("Error al eliminar el elemento:", error);
    res.status(500).send("Error interno del servidor al eliminar el elemento");
  }
});
/// final



//borar elementos
app.post("/delete/:itemId", async function(req, res){
  const itemId = req.params.itemId;

  try {
    // Eliminar el elemento en MongoDB usando el ID
    await Items.deleteOne({ _id: itemId });
    // Redirigir a la página principal después de eliminar el elemento
    res.redirect("/");
  } catch (error) {
    console.error("Error al eliminar el elemento:", error);
    res.status(500).send("Error interno del servidor al eliminar el elemento");
  }
});


app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
}); 

  //editar elementos
  // app.post("/edit/:itemId", async function(req, res){
  //   const itemId = req.params.itemId;
  //   const { name, price } = req.body;
  //   console.log(itemId,name,price)
  //   try {
  //     // Encontrar el elemento por ID y actualizar sus campos
  //     await Items.updateMany({_id: itemId}, {
  //       name: name,
  //       price: price
  //     });
    
  //     // Redirigir a la página principal después de editar el elemento
  //     res.redirect("/");
  //   } catch (error) {
  //     console.error("Error al editar el elemento:", error);
  //     res.status(500).send("Error interno del servidor al editar el elemento");
  //   }
  // });
  //actuaizar checkBox
  // app.patch("/editCheck/:itemId", async function(req, res){
  //   const itemId = req.params.itemId;
  //   const { check } = req.body;
  //   console.log(itemId,check)
  //   try {
  //     // Encontrar el elemento por ID y actualizar sus campos
  //     await Items.updateMany({_id: itemId}, {
  //       check:check
  //     });
    
  //     // Redirigir a la página principal después de editar el elemento
  //     res.status(200).send("Elemento actualizado correctamente");
  //   } catch (error) {
  //     console.error("Error al editar el elemento:", error);
  //     res.status(500).send("Error interno del servidor al editar el elemento");
  //   }
  // });
