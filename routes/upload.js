var express = require('express');
// Librerias para cargar arcivos
var fileUpload = require('express-fileupload');

// Libreria para borrar archivos (FileSystem)
var fs = require('fs');


var app = express();

// Importo el modelo
var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');



// default options
app.use(fileUpload());

app.put('/:tipo/:id', (reques, response, next) => {

    var tipo = reques.params.tipo;
    var id = reques.params.id;

    // Tipos de coleccion para comprovar que existe 
    var tiposValidos = ['usuarios', 'medicos', 'hospitales'];
    // si devuelve menos uno no lo encontro
    if (tiposValidos.indexOf(tipo) < 0) {
        return response.status(400).json({
            ok: false,
            mensaje: 'Tipo de coleccion no valida.',
            errors: { message: 'Los tipos de coleccion validas son: ' + tiposValidos.join(', ') + '.' }
        });
    }

    // Compruevo si vienen archivos
    if (!reques.files) {
        return response.status(400).json({
            ok: false,
            mensaje: 'No selecciono nada.',
            errors: { message: 'Debede seleccionar una imagen.' }
        });
    }

    // Obtener nombre del archivo
    var archivo = reques.files.imagen;
    // Creo un areglo con el nombre del archivo la ultima posicion el la extension
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // Extensiones aceptadas
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    // si devuelve menos uno no lo encontro
    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return response.status(400).json({
            ok: false,
            mensaje: 'Extension no valida.',
            errors: { message: 'Las extensiones validas son: ' + extensionesValidas.join(', ') + '.' }
        });
    } else {

        // nombre de archivo personalizado 
        // id de usuario-random.extension
        var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;

        // Mover el archivo del temporal a un path
        var path = `./uploads/${ tipo }/${ nombreArchivo }`;// carpeta donde se guardaran los archivos

        // Muevo el archivo controlando que no de error
        archivo.mv(path, err => {
            if (err) {
                return response.status(500).json({
                    ok: false,
                    mensaje: 'Error al mover archivo.',
                    errors: err
                });
            } else {
                
                subirPorTipo( tipo, id, nombreArchivo, response);
                
            }
            
        })
    }
});

function subirPorTipo(tipo, id, nombreArchivo, res) {

    // Validacion usuario
    if (tipo === 'usuarios') {

        // Busco un usuario con este id
        Usuario.findById(id, (err, usuario) => {

            if (err) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Error al busqueda de usuario',
                    errors: { message: 'Error al busqueda de usuario ', err }
                });
            }

            if (!usuario) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Usuario no existe',
                    errors: { message: 'Usuario no existe' }
                });
            }
        
            // nombre viejo de la imagen del usuario
            var pathViejo = './uploads/usuarios/' + usuario.img;
            
            // Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }
        
            // Almaceno el nombre de la imagen.
            usuario.img = nombreArchivo;
            
            usuario.save((err, usuarioActualizado) => {
                
                if (err) {
                    return res.status(400).json({
                        ok: true,
                        mensaje: 'Error al actualizar imagen de usuario',
                        errors: { message: 'Error imagen de usuario no actualizada ', err }
                    });
                } 

                if ( usuarioActualizado ) {
                    usuarioActualizado.password = ':)';
                    
                    return res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de usuario actualizada',
                        usuario: usuarioActualizado
                    });
                }
        
            })
    });
    }

    // Validacion medicos
    if (tipo === 'medicos') {

        // Busco un medicos con este id
        Medico.findById(id, (err, medico) => {

            if (err) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Error al busqueda de medico',
                    errors: { message: 'Error al busqueda de medico', err }
                });
            }

            if (!medico) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Medico no existe',
                    errors: { message: 'Medico no existe' }
                });
            }
        
            // nombre viejo de la imagen del usuario
            var pathViejo = './uploads/medicos/' + medico.img;
            
            // Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }
        
            // Almaceno el nombre de la imagen.
            medico.img = nombreArchivo;
            
            medico.save((err, medicoActualizado) => {
                
                if (err) {
                    return res.status(400).json({
                        ok: true,
                        mensaje: 'Error al actualizar imagen del medico',
                        errors: { message: 'Error imagen del medico no actualizada ', err }
                    });
                }
        
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizada',
                    medico: medicoActualizado
                });
        
            })
        });
    }

    // Validacion usuario
    if (tipo === 'hospitales') {

        // Busco un usuario con este id
        Hospital.findById(id, (err, hospital) => {

            if (err) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Error al busqueda de hospital',
                    errors: { message: 'Error al busqueda de hospital', err }
                });
            }

            if (!hospital) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Hospital no existe',
                    errors: { message: 'Hospital no existe' }
                });
            }
        
            // nombre viejo de la imagen del usuario
            var pathViejo = './uploads/hospitales/' + hospital.img;
            
            // Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }
        
            // Almaceno el nombre de la imagen.
            hospital.img = nombreArchivo;
            
            hospital.save((err, hospitalActualizado) => {

                if (err) {
                    return res.status(400).json({
                        ok: true,
                        mensaje: 'Error al actualizar imagen del hospital',
                        errors: { message: 'Error imagen del hospital no actualizada ', err }
                    });
                } 
                        
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizada',
                    hospital: hospitalActualizado
                });
        
            })
        }); 
    }
}


module.exports = app;