var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEDD;

// ==============================
// Verificar token
// Middleware o lógica de intercambio de información entre aplicaciones 
// ==============================
exports.veridicaToken = function(reques, response, next) {

    // Recibo el token por el url
    var token = reques.query.token;

    // Realizo la comprobacion
    // Token, Semilla de seguridad y colcack
    jwt.verify(token, SEED, (err, decoded) => {

        if (err) {
            // 401 No se encuantra autorizado
            response.status(401).json({
                ok: false,
                mensaje: 'Error token incorrecto.',
                errors: err
            });
        }


        reques.usuario = decoded.usuario;

        // response.status(200).json({
        //     ok: true,
        //     decoded: decoded
        // });

        // next indica que si no se encuentran errores puede continuar con el resto de funciones
        next();
    });
}