const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const Usuarios = require('../models/Usuarios')
const { where } = require('sequelize')

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
},
async (email, password, next) => {
    // codigo se ejecuta al llenar el formulario
    const usuario = await Usuarios.findOne({where: {email}})

    // revisar si existe o no
    if (!usuario) return next(null, false, {
        message: 'Ese usuario no existe'
    })

    const verificarPass = usuario.validarPassword(password)

    // si el password es incorrecto
    if (!verificarPass) return next(null, false, {
        message: 'Password incorrecto'
    })

    return next(null, usuario)
}
))

passport.serializeUser(function(usuario, cb) {
    cb(null, usuario)
})

passport.deserializeUser(function(usuario, cb) {
    cb(null, usuario)
})

module.exports = passport