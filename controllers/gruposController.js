const Categorias = require('../models/Categorias')
const Grupos = require('../models/Grupos')

const multer = require('multer')
const shortid = require('shortid')
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')

const configuracionMulter = {
    limits: {fileSize: 100000},
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, next) => {
            next(null, __dirname+'/../public/uploads/grupos/')
        },
        filename: (req, file, next) => {
            const extension = file.mimetype.split('/')[1]
            next(null, `${shortid.generate()}.${extension}`)
        }
    }),
    fileFilter(req, file, next) {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            next(null, true)
        } else {
            next(new Error('Formato no valido'), false)
        }
    }
}
const upload = multer(configuracionMulter).single('imagen')

exports.subirImagen = (req, res, next) => {
    upload(req, res, function(error) {
        if(error) {
            if (error instanceof multer.MulterError) {
                if (error.code === 'LIMIT_FILE_SIZE') {
                    req.flash('error', 'El Archivo es muy grande')
                } else {
                    req.flash('error', error.message)
                }
            } else if (error.hasOwnProperty('message')) {
                req.flash('error', error.message)
            }
            res.redirect('back')
            return
        } else {
            next()
        }
    })
}

exports.formNuevoGrupo = async (req, res) => {

    const categorias = await Categorias.findAll()

    res.render('nuevo-grupo', {
        nombrePagina: 'Crear un nuevo grupo',
        categorias
    })
}

// Almacena los grupos en la base de datos
exports.crearGrupo = async (req, res) => {

    // sanitizar
    req.sanitizeBody('nombre')
    req.sanitizeBody('url')

    const grupo = req.body
    grupo.usuarioId = req.user.id

    // leer imagen
    if (req.file) {
        grupo.imagen = req.file.filename
    }

    grupo.id = uuidv4
    
    try {
        // Almacenar en BD
        await Grupos.create(grupo)
        req.flash('exito', 'Se ha creado el Grupo Correctamente')
        res.redirect('/administracion')
    } catch (error) {
        const erroresSequelize = error.errors.map(err => err.message)        

        req.flash('error', erroresSequelize)
        res.redirect('/nuevo-grupo')
    }
}

exports.formEditarGrupo = async (req, res) => {
   
    const consultas = []
    consultas.push(Grupos.findByPk(req.params.grupoId))
    consultas.push(Categorias.findAll())

    const [grupo, categorias] = await Promise.all(consultas)

    res.render('editar-grupo', {
        nombrePagina: `Editar Grupo: ${grupo.nombre}`,
        grupo,
        categorias
    })
}

exports.editarGrupo = async (req, res) => {
    const grupo = await Grupos.findOne({where: {id: req.params.grupoId, usuarioId: req.user.id}})
    if (!grupo) {
        req.flash('error', 'Operacion no valida')
        res.redirect('/administracion')
        return next()
    }

    const { nombre, descripcion, categoriaId, url } = req.body
    grupo.nombre = nombre
    grupo.descripcion = descripcion
    grupo.categoriaId = categoriaId
    grupo.url = url

    await grupo.save()
    req.flash('exito', 'Cambios almacenados correctamente')
    res.redirect('/administracion')
}

// Muestra el formulario para editar una imagen de grupo
exports.formEditarImagen = async (req, res) => {
    const grupo = await Grupos.findOne({where: {id: req.params.grupoId, usuarioId: req.user.id}})
    res.render('imagen-grupo', { 
        nombrePagina: `Editar Imagen Grupo: ${grupo.nombre}`,
        grupo
    })
}

// Modifica la imagen en la BD y elimina la anterior
exports.editarImagen = async (req, res, next) => {
    const grupo = await Grupos.findOne({where: {id: req.params.grupoId, usuarioId: req.user.id}})
    if (!grupo) {
        req.flash('error', 'Operacion no valida')
        res.redirect('iniciar-sesion')
        return next()
    }

    // si hay imagen anterior y nuevo, significa que vamos a borrar la anterior
    if (req.file && grupo.imagen) {
        const imagenAnteriorPath = __dirname +`/../public/uploads/grupos/${grupo.imagen}`
        fs.unlink(imagenAnteriorPath, (error) => {
            if (error) {
                console.log(error)
            }
            return
        })
    }

    if (req.file) {
        grupo.imagen = req.file.filename
    }

    await grupo.save()
    req.flash('exito', 'Cambios almacenados correctamente')
    res.redirect('/administracion')
}

exports.formEliminarGrupo = async (req, res, next) => {
    const grupo = await Grupos.findOne({where: { id: req.params.grupoId, usuarioId: req.user.id }})
    if (!grupo) {
        req.flash('error', 'Operacion no valida')
        res.redirect('/administracion')
        return next()
    }

    res.render('eliminar-grupo', {
        nombrePagina: `Eliminar Grupo: ${grupo.nombre}`
    })
}

exports.eliminarGrupo = async (req, res, next) => {
    const grupo = await Grupos.findOne({where: { id: req.params.grupoId, usuarioId: req.user.id }})
   

    if (grupo.imagen) {
        const imagenAnteriorPath = __dirname +`/../public/uploads/grupos/${grupo.imagen}`
        fs.unlink(imagenAnteriorPath, (error) => {
            if (error) {
                console.log(error)
            }
            return
        })
    }

    await Grupos.destroy({
        where: {
            id: req.params.grupoId
        }
    })

    req.flash('exito', 'Grupo Eliminado')
    res.redirect('/administracion')
}