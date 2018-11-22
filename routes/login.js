var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');


// Google
const CLIENT_ID = require('../config/config').CLIENT_ID;
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);


const SEED = require('../config/config').SEDD;

var app = express();


// Importo el modelo
var Usuario = require('../models/usuario');

// ==============================
// Autenticacion De Google
// ==============================

async function verify(token) {
    // await es una promesa que esperara a que se resuelva
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    // payload Contiene toda la informacion del usuario Google
    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.img,
        google: true
    }
}

// async para poder utilizar await 
app.post('/google', async (reques, response) => {

    var token = reques.body.token;

    // await = espera
    
    var googleUser = await verify( token )
                        .catch( e => {
                            return response.status(403).json({
                                ok: false,
                                mensaje: 'Token Google no valido.'
                            });
                        });
    
    // Compruevo su el usuario Google ya a sido registrado
    Usuario.findOne( { email: googleUser.email }, (err, usuarioBD) => {

        if ( err ) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario google en Base de datos.',
                errors: err
            });
        }

        if ( usuarioBD ) {
            if ( usuarioBD.google === false ) {
                return response.status(400).json({
                    ok: false,
                    mensaje: 'Error. Debe usar su autentificacion normal.',
                });
            } else {

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
            }
        } else {
            // El usuario no existe... hay que crearlo
            var usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            // Guardo el usuario
            usuario.save( (err, usuarioBD) => {
                
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
        }

    });


    // return response.status(200).json({
    //     ok: true,
    //     mensaje: 'Error al buscar usuarios.',
    //     googleUser: googleUser
    // });
});

// ==============================
// Autenticacion Normal
// ==============================
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