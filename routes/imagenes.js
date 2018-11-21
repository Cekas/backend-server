const express = require('express');
const app = express();

// Para nabegar entre caretas de una forma optima
const path = require('path');
const fs = require('fs');

app.get( '/:tipo/:img', (reques, response, next) => {

    var tipo = reques.params.tipo;
    var img = reques.params.img;

    //creo la ruta de la imagen para encontrarla c:/....... o localhost.............
    // __dirname Obtengo la ruta actual completa , el segundo argumento es una concatenacion a la ruta
    var pathImagen = path.resolve( __dirname, `../uploads/${ tipo }/${ img }` );

    // verifico si el path es valido
    if ( fs.existsSync( pathImagen ) ) {
        response.sendFile( pathImagen );
    } else {
        // En caso contrario aplico la imagen por defecto
        var pathNoImagen = path.resolve( __dirname, `../assets/no-img.jpg` );
        response.sendFile( pathNoImagen );

    }
});

module.exports = app;