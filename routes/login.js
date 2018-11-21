var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

const SEED = require('../config/config').SEDD;

var app = express();


// Importo el modelo
var Usuario = require('../models/usuario');

app.post('/', (reques, response) => {

    // Recivo el body
    var body = reques.body;

    // la condicion de busqueda es que el campo email que se manda tiene que ser igual al mail del modelo
    Usuario.findOne( { email: body.email }, (err, usuarioBD) =>{

        if ( err ) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuarios.',
                errors: err
            });
        }

        if ( !usuarioBD ) {
            return response.status(400).json({
                ok: false,
                // - Email Elimminar para produccion
                mensaje: 'Error. Credenciales incorrectas. - Email',
                errors: { message: 'Error. Credenciales incorrectas.'}
            });
        }

        // Berificar contraseña
        if ( !bcrypt.compareSync( body.password, usuarioBD.password ) ) {
            return response.status(400).json({
                ok: false,
                // - Email Elimminar para produccion
                mensaje: 'Error. Credenciales incorrectas. - password',
                errors: { message: 'Error. Credenciales incorrectas.'}
            });
        }

        // vacio la contraseña para no mandarla en el token
        usuarioBD.password = ':)';

        // Crear token
        // {usuario: usuarioBD } es el peilout, la data que quiero colocar en el token
        // Como segundo parametro se manda seed la semilla que harra unico nuestro tokent
        // Por ultimo es la fecha de expiracion del token en este caso sera de 4 horas
        var token = jwt.sign( {usuario: usuarioBD}, SEED, {expiresIn: 14400 } );

        response.status(200).json({
            ok: true,
            usuarioBD: usuarioBD,
            token: token,
            id: usuarioBD._id
        });

    });
});












module.exports = app;