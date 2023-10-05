const Categorias = require('../models/Categorias')
const Grupos = require('../models/Grupos')

const multer = require('multer')
const shortid = require('shortid')

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