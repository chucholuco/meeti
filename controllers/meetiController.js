const Grupos = require('../models/Grupos')
const Meeti = require('../models/Meeti')

exports.formNuevoMeeti = async (req, res) => {
    const grupos = await Grupos.findAll({where: { usuarioId: req.user.id }})

    res.render('nuevo-meeti', {
        nombrePagina: 'Crear nuevo Meeti',
        grupos
    })
}

exports.crearMeti = async (req, res) => {
    const meeti = req.body

    meeti.usuarioId = req.user.id
    
    const point = { type: 'Point', coordinates: [parseFloat(req.body.lat), parseFloat(req.body.lng)]}
    meeti.ubicacion = point

    if (req.body.cupo === '') {
        meeti.cupo = 0
    }

    try {
        await Meeti.create(meeti)
        req.flash('exito', 'Se ha creado el Meeti correctamente')
        res.redirect('/administracion')
    } catch (error) {
        const erroresSequelize = error.errors.map(err => err.message)        
        req.flash('error', erroresSequelize)
        res.redirect('/nuevo-meeti')
    }
}

exports.sanitizarMeeti = (req, res, next) => {
    req.sanitizeBody('titulo')
    req.sanitizeBody('invitado')
    req.sanitizeBody('cupo')
    req.sanitizeBody('fecha')
    req.sanitizeBody('hora')
    req.sanitizeBody('direccion')
    req.sanitizeBody('ciudad')
    req.sanitizeBody('estado')
    req.sanitizeBody('pais')
    req.sanitizeBody('lat')
    req.sanitizeBody('lng')
    req.sanitizeBody('grupoId')

    next()
}

exports.formEditarrMeeti = async (req, res, next) => {
    const consultas = []
    consultas.push(Grupos.findAll({ where: {usuarioId: req.user.id}}))
    consultas.push(Meeti.findByPk(req.params.id))
    
    const [grupos, meeti] = await Promise.all(consultas)

    if (!grupos || !meeti) {
        req.flash('error', 'Operacion no valida')
        res.redirect('/administracion')
        return next()
    }

    res.render('editar-meeti', {
        nombrePagina: `Editar Meeti: ${meeti.titulo}`,
        grupos,
        meeti
    })

}

exports.editarMeeti = async (req, res, next) => {
    const meeti = await Meeti.findOne({ where: { id: req.params.id, usuarioId: req.user.id } })

    if (!meeti) {
        req.flash('error', 'Operacion no valida')
        res.redirect('/administracion')
        return next()
    }

    const {grupoId, titulo, invitado, fecha, hora, cupo, descripcion, direccion, ciudad, estado, pais, lat, lng} = req.body

    meeti.grupoId = grupoId
    meeti.titulo = titulo
    meeti.invitado = invitado
    meeti.fecha = fecha
    meeti.hora = hora
    meeti.cupo = cupo
    meeti.descripcion = descripcion
    meeti.direccion = direccion
    meeti.ciudad = ciudad
    meeti.estado = estado
    meeti.pais = pais

    const point = {type: 'Point', coordinates: [parseFloat(lat), parseFloat(lng)]}
    meeti.ubicacion = point

    await meeti.save()

    req.flash('exito', 'Cambios guardados correctamente')
    res.redirect('/administracion')
}

exports.formEliminarMeeti = async (req, res, next) => {
    const meeti = await Meeti.findOne({ where: { id: req.params.id, usuarioId: req.user.id } })
    if (!meeti) {
        req.flash('error', 'Operacion no valida')
        res.redirect('/administracion')
        return next()
    }

    res.render('eliminar-meeti', {
        nombrePagina: `Eliminar Meeti: ${meeti.titulo}`
    })
}

exports.eliminarMeeti = async (req, res) => {
    await Meeti.destroy({
        where: {
            id: req.params.id
        }
    })

    req.flash('exito', 'Meeti Eliminado')
        res.redirect('/administracion')
}