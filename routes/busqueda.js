var express = require('express');
var app = express();

// Importo el modelo
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');


//\\ //\\ //\\ //\\ //\\ //\\ //\\ //\\ //\\ //\\
//\\ ESTAS BUSQUEDAS SE TENDRIAN QUE PAGINAR //\\
//\\ //\\ //\\ //\\ //\\ //\\ //\\ //\\ //\\ //\\

// ==============================
// Busqueda por coleccion
// ==============================
app.get( '/coleccion/:tabla/:busqueda', (reques, response, next) => {
    
    var busqueda = reques.params.busqueda;
    var tabla = reques.params.tabla;

    var promesa;
    var regex = new RegExp( busqueda, 'i');

    switch( tabla ) {

        case 'usuarios':
            promesa = buscarUsuarios( busqueda, regex )
            break;
        case 'medicos':
            promesa = buscarMedicos( busqueda, regex )
            break;
        case 'hositales':
            promesa = buscarHspitales( busqueda, regex )
            break;
            
        default:
            return response.status(400).json({
                ok: false,
                mensaje: 'Los tipos de busqueda solo son: usuarios, medicos y hospitales.',
                err: {message: 'Tipo de tabla/coleccion no válido.'}
            });
    }

    promesa.then( data => {
        response.status(200).json({
            ok: true,
            // [tabla] para mostrar el resultado de lo que contiene la variable, el nombre de la tabla que introduce el usuario

            [tabla]: data,
        });
    })
});


// ==============================
// Busqueda general
// ==============================

// todo y busqueda son parametros busqueda es opcional
app.get( '/todo/:busqueda', (reques, response, next) => {

    var busqueda = reques.params.busqueda;
    
    // Creo una expresion regular pata poder pasarla como parametro en el motodo find
    // 'i' para hacer insensible la busqueda a mayusculas y minuscuas
    var regex = new RegExp( busqueda, 'i');

    // Permite mandar un arreglo de promesas 
    // Llamo a la funcion que me devuelve la data mediante una promesa. 
    // mediatne then recojo la data
    Promise.all( [ 
        buscarHspitales( busqueda, regex ), 
        buscarMedicos( busqueda, regex ),
        buscarUsuarios( busqueda, regex )
    ] )
        // Recibo un arreglo con las respuestas
        .then( respuestas => {
            response.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });
    
        });
});

function buscarHspitales( busqueda, regex ) {

    // Creo una promesa que se retorna para que la duncion retorne una promesa
    return new Promise ( ( resolve , reject ) => {

        Hospital.find({ nombre: regex })
            // Para mostrar el usuario que creo cada hospital 
            .populate('usuario', 'nombre email')
            .exec( ( err, hospitales) => {

            if (err) {
                reject('Error al cargar Hospitales: ', err);
            } else {
                // En caso de no existir error mando la data
                resolve(hospitales);
            }                
        });
    });
}

function buscarMedicos( busqueda, regex ) {

    // Creo una promesa que se retorna para que la duncion retorne una promesa
    return new Promise ( ( resolve , reject ) => {

        Medico.find({ nombre: regex })
            // Para mostrar el usuario que creo cada Medico 
            .populate('usuario', 'nombre email')
            // Muestro todos los camos de hospital
            .populate('hospital')
            .exec( ( err, medicos) => {

            if (err) {
                reject('Error al cargar Medicos: ', err);
            } else {
                // En caso de no existir error mando la data
                resolve(medicos);
            }                
        });
    });
}

function buscarUsuarios( busqueda, regex ) {

    // Creo una promesa que se retorna para que la duncion retorne una promesa
    return new Promise ( ( resolve , reject ) => {

        // {}, 'name email role' Filto para mostrar las colunas que se necesitan
        Usuario.find( {}, 'name email role' )
            // or Recibe un areglo de condiciones. En este caso las dos columas a buscar
            .or( [ {'nombre': regex}, {'email': regex} ] )
            .exec( (err, usuarios) => {

                if (err) {
                    reject('Error al cargar Usuarios: ', err);
                } else {
                    // En caso de no existir error mando la data
                    resolve(usuarios);
                }         
            });
    });
}

module.exports = app;