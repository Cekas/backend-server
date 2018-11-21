var express = require('express');

var mdAutenticacion = require('../middleware/autenticacion');

var app = express();

// Importo el modelo
var Medico = require('../models/medico');

// ==============================
// Obtener todos los Medicoes
// ==============================
app.get( '/', (reques, response, next) => {

    // Parameto opcional para la paginacion
    var desde = reques.query.desde || 0;
    desde = Number(desde);


    Medico.find({})
        // skip() para saltarse un numero x de registros
        .skip(desde)      
        // Limitar la cantidad de registros que quiero mostrar
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec( (err, medicos) => {
            
            if ( err ) {
                // 500 asociado a base de datos
                response.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando medico.',
                    errors: err
                });
            }
        
            if ( medicos ) {
                // contar el numero de usuarios 
                Medico.count( {}, (err, conteo) => {
                    response.status(200).json({
                        ok: true,
                        medicos: medicos,
                        total: conteo
                    });

                    if ( err ) {
                        // 500 asociado a base de datos
                        response.status(500).json({
                            ok: false,
                            mensaje: 'Error contando medicos.',
                            errors: err
                        });
                    }
                });
            }

        });
});

// ==============================
// Actualizar medico
// :id indica que existe un recurso obligatorio
// ==============================
app.put('/:id', mdAutenticacion.veridicaToken, (reques, response) => {

    // obtener el id
    var id = reques.params.id;
    var body = reques.body;

    // Saber si un medico esiste
    Medico.findById( id, (err, medico ) => {      

        if ( err ) {
            // el return es por que si esta funcion trae error quiero que salga de ella terminando la ejecucion
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico.',
                errors: err
            });
        }
    
        // Si no viene medico
        if ( !medico ) {
            return response.status(400).json({
                ok: false,
                mensaje: 'Error. El medico con el id: ' + id + ' no existe.',
                errors: { message: 'No existe un medico con ese ID'}
            });
        }

        // actualizo los fatos de medico
        medico.nombre = body.nombre;
        medico.usuario = reques.usuario._id;
        medico.hospital = body.hospital;



        // realizo la gravacion 
        medico.save( (err, medicoGuardado ) => {

            if ( err ) {
                return response.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico.',
                    errors: err
                });
            }

            if ( medicoGuardado ) {
                // 201 Recurso creado
                response.status(200).json({
                    ok: true,
                    medico: medicoGuardado
                });
            }

        });
        
    });

});

// ==============================
// Crear un nuevo medico
// mdAutenticacion.veridicaToken Se pasa pomo parametro y no como funcion para que se ejecutecuando es llamado
// ==============================
app.post('/', mdAutenticacion.veridicaToken, (reques, response) => {

    // Extraigo el body
    var body = reques.body;

    // Creo un nuevo medico
    var medico = new Medico({
        nombre: body.nombre,
        usuario: reques.usuario._id,
        hospital: body.hospital

    });


    // Guardar el nuevo medico
    medico.save( (err, medicoGuardado) => {
        
        if ( err ) {
            
            return response.status(400).json({
                ok: false,
                mensaje: 'Error al crear medico.',
                errors: err
            });
        }
    
        if ( medicoGuardado ) {
            // 201 Recurso creado
            response.status(201).json({
                ok: true,
                medico: medicoGuardado,
                medicoToken: reques.medico
            });
        }
    });

});

// ==============================
// Borrar un medico por el id
// ==============================
app.delete('/:id', mdAutenticacion.veridicaToken, (reques, response) => {

    // obtengo el id
    var id = reques.params.id;

    // Referencia al modelo mandandole el id que se desea eliminar
    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {

        if ( err ) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico.',
                errors: err
            });
        }

        if ( !medicoBorrado ) {
            return response.status(400).json({
                ok: false,
                mensaje: 'Error. El medico con el id: ' + id + ' no existe.',
                errors: { message: 'No existe un medico con ese ID.'}
            });
        }

        if ( medicoBorrado ) {
            response.status(200).json({
                ok: true,
                medico: medicoBorrado
            });
        }
        
    });

});

module.exports = app;