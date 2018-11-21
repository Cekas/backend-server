// Importo mongoose
var mongoose = require('mongoose');
var  uniqueValidator = require('mongoose-unique-validator');

// Cargo mongoose, mediante Schema defino esquemas.
var Schema = mongoose.Schema;

// Objeto para validar los roles que se aceptaran
// value Valoeres validos, message que se lanzara en caso de error al ingresar valor
// {VALUE} Muesta el valor introducido
var rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} No es un rol permitido',
};

// versionKey: '_otraCosa' => porpiedad por deecto _V
// usuarioSchema Por combencion se inicia con el nombre de la coleccion en singular y la palabra Schema
var usuarioSchema = new Schema({
    
    // En el objeto indico el tipo y que es requtido indicando el mensaje que se a de mostrar si no se introduce.
    nombre: { type: String, required: [true, 'El nombre es necesario'] },
    // unique:true Debe ser unico.
    email: { type: String, unique: true, required: [true, 'El correo es necesario'] },
    password: { type: String, required: [true, 'La contraseña es necesaria'] },
    img: { type: String, required: false },
    // default: 'USER_ROLE' Valor por defecto
    // enum: rolesValidos para poder ejecutar la comprovacion.
    role: { type: String, required: true, default: 'USER_ROLE', enum: rolesValidos}
})

// utilizo el validador y le agrego el mensaje en caso de que salte
// {PAHT} Lee y muestrea la propiedad del campo en este caso email para los casos en los que hay varios campos unicos.
usuarioSchema.plugin( uniqueValidator, {message: '{PAHT} debe de ser único.' } );

// Exporto el archivo para poder utilizarlo desde el esterio
// los parametos que paso es el nombre para llamarlo y el objeto que quiero que se reacione.
module.exports = mongoose.model('Usuario', usuarioSchema );
