const passport = require('passport')

exports.autenticarUsuario = passport.authenticate('local', {
    successRedirect: '/administracion',
    failureRedirect: '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Ambos cambios son obligatorios'    
})

// revisa si el usuario esta autenticado o no
exports.usuarioAutenticado = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next()
    }

    // si no esta autenticado
    return res.redirect('/iniciar-sesion')
}

exports.cerrarSesion = (req, res, next) => {
    req.logout(() => {
        req.flash('correcto', 'Cerraste sesión correctamente')
        res.redirect('/iniciar-sesion')
        next()
    })    
}