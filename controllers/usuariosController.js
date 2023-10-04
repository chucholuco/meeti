const Usuarios = require('../models/Usuarios')
const enviarEmail = require('../handlers/emails')

exports.formCrearCuenta = (req, res) => {
    res.render('crear-cuenta', {
        nombrePagina: 'Crea tu Cuenta'
    })
}

exports.crearNuevaCuenta = async (req, res) => {
    const usuario = req.body

    req.checkBody('confirmar', 'El password confirmado no puede ir vacio').notEmpty()
    req.checkBody('confirmar', 'El password es diferente').equals(req.body.password)

    // leer los errores de express
    const erroresExpress = req.validationErrors()
    
    try {
        await Usuarios.create(usuario)

        // Url de confirmacion
        const url = `http://${req.headers.host}/confirmar-cuenta/${usuario.email}`

        // enviar email de confirmacion
        await enviarEmail.enviarEmail({
            usuario,
            url,
            subject: 'Confirma tu cuenta de Meeti',
            archivo: 'confirmar-cuenta'
        })

        // Flash Message y redireccionar
        req.flash('exito', 'Hemos enviado un email, confirma tu cuenta')
        res.redirect('/iniciar-sesion')
        
    } catch (error) {
        const erroresSequelize = error.errors.map(err => err.message)
        // extraer unicamente el msg de los errores
        const errExp = erroresExpress.map(err => err.msg)
        

        // unir los errores de express y sequelizer
        const listaErrores = [...erroresSequelize, ...errExp]

        req.flash('error', listaErrores)
        res.redirect('./crear-cuenta')
    }       
}

// Confirma la suscripcion del usuario
exports.confirmarCuenta = async (req, res, next) => {
    // verificar que el usuario existe
    const usuario = await Usuarios.findOne({ where: {email: req.params.correo}})
    
    //si no existe, redireccionar
    if(!usuario) {
        req.flash('error', 'No existe esa cuenta')
        res.redirect('/crear-cuenta')
        return next()
    }

    // si existe confirmar subsiscripcion y redireccionar
    usuario.activo = 1
    await usuario.save()

    req.flash('exito', 'La cuenta se ha confirmado, ya puedes iniciar sesion')
    res.redirect('/iniciar-sesion')
}

// formulario para crear sesion
exports.formIniciarSesion = (req, res) => {
    res.render('iniciar-sesion', {
        nombrePagina: 'Iniciar Sesion'
    })
}

