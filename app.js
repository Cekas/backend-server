// Requires Importacion de librerias ecesarias para que funcione algo
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// Inicializar variables, donde se usara la libreria
// Defino el servidor express
var app = express();

// Body-parser, configuracion
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())


// Importar archivos de rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');
var hositalRoutes = require('./routes/hosital');
var medicoRoutes = require('./routes/medico');
var busquedaRoutes = require('./routes/busqueda');
var uploadRoutes = require('./routes/upload');
var imagenesRoutes = require('./routes/imagenes');




// Conexion a la base de datos
// 27017 Puerto por defecto
// hospitalDB Nombre de la ase de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (error, respuesta) => {

    // throw = lanzar, detiene todo el proceso y no sigue haciendo nada mas
    if (error) throw error;

    // Si sucede esta linea no se ejecuta .
    console.log('Base de datos: \x1b[32m%s\x1b[0m', 'OnLine');

});


// Server-Index Congig para encontrar archivos del servidor
// var serveIndex = require('serve-index');
// app.use(express.static(__dirname + '/'));
// app.use('/uploads', serveIndex(__dirname + '/uploads'));




// Rutas
// Defino la ruta con un midelware: Algo que se ejecuta antes de que se resuelvan otras turas
//  '/' indica desde donde, appRoutes indica que se ejecutara.
// '' sera el nombre de ruta en el buscador
app.use('/usuario', usuarioRoutes);
app.use('/hosital', hositalRoutes);
app.use('/login', loginRoutes);
app.use('/medico', medicoRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', imagenesRoutes);

// '/' Tiene que ser la ultima ruta
app.use('/', appRoutes);


// Escuchar peticiones
app.listen(3000, () => {
    // 32m color verde
    // %s sustitulle al segundo parametro
    console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m', 'OnLine');

});