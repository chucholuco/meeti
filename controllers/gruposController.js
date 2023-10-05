const Categorias = require('../models/Categorias')
const Grupos = require('../models/Grupos')

exports.formNuevoGrupo = async (req, res) => {

    const categorias = await Categorias.findAll()

    res.render('nuevo-grupo', {
        nombrePagina: 'Crear un nuevo grupo',
        categorias
    })
}

// Almacena los grupos en la base de datos
exports.crearGrupo = async (req, res) => {
    const grupo = req.body
    
    try {
        // Almacenar en BD
        await Grupos.create(grupo)
        req.flash('exito', 'Se ha creado el Grupo Correctamente')
        res.redirect('/administracion')
    } catch (error) {
        console.log(error)
        req.flash('error', error)
        res.redirect('/nuevo-grupo')
    }
}