const{Schema,model} = require("mongoose");

const ItemsSchema = Schema({
    name: {
        type: String,
    },
    price: {
        type: String,
    },
    check: {
        type: Boolean,
    }
});

module.exports= model('Items',ItemsSchema)