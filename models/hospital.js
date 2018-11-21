var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var hospitalSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre es necesario'] },
    img: { type: String, required: false },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' }
},
{ 
    // Para indicar el nompre de la coleccion y que no se cree por defecto
    collection: 'hospitales'
});

module.exports = mongoose.model('Hospital', hospitalSchema);