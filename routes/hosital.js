var express = require('express');

var mdAutenticacion = require('../middleware/autenticacion');

var app = express();

// Importo el modelo
var Hospital = require('../models/hospital');

// ==============================
// Obtener todos los Hospitales
// ==============================
app.get( '/', (reques, response, next) => {

    // Parameto opcional para la paginacion
    var desde = reques.query.desde || 0;
    desde = Number(desde);
    
    Hospital.find({})
        // skip() para saltarse un numero x de registros
        .skip(desde)      
        // Limitar la cantidad de registros que quiero mostrar
        .limit(5)
        // .populate() Para indicar que campos de la otra tabla deseo mostrar
        // como primer argumento va el nombre del modelo en minusculas, como segundo argumento los campos a mostrar
        .populate('usuario', 'nombre email')
        .exec( (err, hospitales) => {
            
            if ( err ) {
                // 500 asociado a base de datos
                response.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando hospital.',
                    errors: err
                });
            }
        
            if ( hospitales ) {
                // contar el numero de usuarios 
                Hospital.count( {}, (err, conteo) => {
                    response.status(200).json({
                        ok: true,
                        hospitales: hospitales,
                        total: conteo
                    });

                    if ( err ) {
                        // 500 asociado a base de datos
                        response.status(500).json({
                            ok: false,
                            mensaje: 'Error contando hospitales.',
                            errors: err
                        });
                    }
                });
            }

        });
});

// ==============================
// Actualizar hospital
// :id indica que existe un recurso obligatorio
// ==============================
app.put('/:id', mdAutenticacion.veridicaToken, (reques, response) => {

    // obtener el id
    var id = reques.params.id;
    var body = reques.body;

    // Saber si un hospital esiste
    Hospital.findById( id, (err, hospital ) => {      

        if ( err ) {
            // el return es por que si esta funcion trae error quiero que salga de ella terminando la ejecucion
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital.',
                errors: err
            });
        }
    
        // Si no viene hospital
        if ( !hospital ) {
            return response.status(400).json({
                ok: false,
                mensaje: 'Error. El hospital con el id: ' + id + ' no existe.',
                errors: { message: 'No existe un hospital con ese ID'}
            });
        }

        // actualizo los fatos de hospital
        hospital.nombre = body.nombre;
        hospital.usuario = reques.usuario._id;


        // realizo la gravacion 
        hospital.save( (err, hospitalGuardado ) => {

            if ( err ) {
                return response.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital.',
                    errors: err
                });
            }

            if ( hospitalGuardado ) {
                // 201 Recurso creado
                response.status(200).json({
                    ok: true,
                    hospital: hospitalGuardado
                });
            }

        });
        
    });

});

// ==============================
// Crear un nuevo hospital
// mdAutenticacion.veridicaToken Se pasa pomo parametro y no como funcion para que se ejecutecuando es llamado
// ==============================
app.post('/', mdAutenticacion.veridicaToken, (reques, response) => {

    // Extraigo el body
    var body = reques.body;

    // Creo un nuevo hospital
    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: reques.usuario._id
    });


    // Guardar el nuevo hospital
    hospital.save( (err, hospitalGuardado) => {
        
        if ( err ) {
            
            return response.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital.',
                errors: err
            });
        }
    
        if ( hospitalGuardado ) {
            // 201 Recurso creado
            response.status(201).json({
                ok: true,
                hospital: hospitalGuardado,
                hospitalToken: reques.hospital
            });
        }
    });

});

// ==============================
// Borrar un hospital por el id
// ==============================
app.delete('/:id', mdAutenticacion.veridicaToken, (reques, response) => {

    // obtengo el id
    var id = reques.params.id;

    // Referencia al modelo mandandole el id que se desea eliminar
    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {

        if ( err ) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital.',
                errors: err
            });
        }

        if ( !hospitalBorrado ) {
            return response.status(400).json({
                ok: false,
                mensaje: 'Error. El hospital con el id: ' + id + ' no existe.',
                errors: { message: 'No existe un hospital con ese ID.'}
            });
        }

        if ( hospitalBorrado ) {
            response.status(200).json({
                ok: true,
                hospital: hospitalBorrado
            });
        }
        
    });

});

module.exports = app;