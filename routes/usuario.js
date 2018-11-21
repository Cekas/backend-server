var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middleware/autenticacion');

var app = express();

// Importo el modelo
var Usuario = require('../models/usuario');

// ==============================
// Obtener todos los usuarios
// ==============================
app.get('/', (reques, response, next) => {

    // Parameto opcional para la paginacion
    var desde = reques.query.desde || 0;
    desde = Number(desde);

    // nombre email img role campos a mostar
    Usuario.find({}, 'nombre email img role')
        // skip() para saltarse un numero x de registros
        .skip(desde)
        // Limitar la cantidad de registros que quiero mostrar
        .limit(5)
        .exec((err, usuarios) => {

            if (err) {
                // 500 asociado a base de datos
                response.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando usuarios.',
                    errors: err
                });
            }

            if (usuarios) {
                // contar el numero de usuarios 
                Usuario.count({}, (err, conteo) => {
                    response.status(200).json({
                        ok: true,
                        usuarios: usuarios,
                        total: conteo
                    });

                    if (err) {
                        // 500 asociado a base de datos
                        response.status(500).json({
                            ok: false,
                            mensaje: 'Error contando usuarios.',
                            errors: err
                        });
                    }
                });
            }

        });
});

// ==============================
// Actualizar usuario
// :id indica que existe un recurso obligatorio
// ==============================
app.put('/:id', mdAutenticacion.veridicaToken, (reques, response) => {

    // obtener el id
    var id = reques.params.id;
    var body = reques.body;

    // Saber si un usuario esiste
    Usuario.findById(id, (err, usuario) => {

        if (err) {
            // el return es por que si esta funcion trae error quiero que salga de ella terminando la ejecucion
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario.',
                errors: err
            });
        }

        // Si no viene usuario
        if (!usuario) {
            return response.status(400).json({
                ok: false,
                mensaje: 'Error. El usuario con el id: ' + id + ' no existe.',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }

        // actualizo los fatos de usuario
        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        // realizo la gravacion 
        usuario.save((err, usuarioGuardado) => {

            if (err) {
                return response.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario.',
                    errors: err
                });
            }

            // reescribo la contraseña para que no se mande la encriptacion.
            usuarioGuardado.password = ':)';

            if (usuarioGuardado) {
                // 201 Recurso creado
                response.status(200).json({
                    ok: true,
                    usuario: usuarioGuardado
                });
            }

        });

    });

});

// ==============================
// Crear un nuevo usuario
// mdAutenticacion.veridicaToken Se pasa pomo parametro y no como funcion para que se ejecutecuando es llamado
// ==============================
app.post('/', mdAutenticacion.veridicaToken, (reques, response) => {

    // Extraigo el body
    var body = reques.body;

    // Creo un nuevo usurio
    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        // bcrypt.hashSync(body.password, 10) Encripto el parametro con 10 saltos
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });


    // Guardar el nuevo usuario
    usuario.save((err, usuarioGuardado) => {

        if (err) {

            return response.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario.',
                errors: err
            });
        }

        if (usuarioGuardado) {
            // 201 Recurso creado
            response.status(201).json({
                ok: true,
                usuario: usuarioGuardado,
                usuarioToken: reques.usuario
            });
        }
    });

});

// ==============================
// Borrar un usuario por el id
// ==============================
app.delete('/:id', mdAutenticacion.veridicaToken, (reques, response) => {

    // obtengo el id
    var id = reques.params.id;

    // Referencia al modelo mandandole el id que se desea eliminar
    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

        if (err) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario.',
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return response.status(400).json({
                ok: false,
                mensaje: 'Error. El usuario con el id: ' + id + ' no existe.',
                errors: { message: 'No existe un usuario con ese ID.' }
            });
        }

        if (usuarioBorrado) {
            response.status(200).json({
                ok: true,
                usuario: usuarioBorrado
            });
        }

    });

});

module.exports = app;