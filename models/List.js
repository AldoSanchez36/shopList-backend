const mongoose = require('mongoose');
const Items = require('./Estatus'); // Importa el modelo de Items

const listSchema = new mongoose.Schema({
    name: String,
    itemsList: [Items.schema] // Referencia al modelo Items
});

const List = mongoose.model('List', listSchema);

module.exports = List;
