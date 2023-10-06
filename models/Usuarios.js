const Sequilize = require('sequelize')
const db = require('../config/db')
const bcrypt = require('bcrypt-nodejs')

const Usuarios = db.define('usuarios', {
    id: {
        type: Sequilize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: Sequilize.STRING(60),
    imagen: Sequilize.STRING(60),
    descripcion: Sequilize.TEXT,
    email: {
        type: Sequilize.STRING(30),
        allowNull: false,
        validate: {
            isEmail: { msg: 'Agrega un correo valido'}
        },
        unique: {
            args: true,
            msg: 'Usuario ya registrado'
        }        
    },
    password: {
        type: Sequilize.STRING(60),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'El password no puede ir vacio'
            }
        }
    },
    activo: {
        type: Sequilize.INTEGER,
        defaultValue: 0
    },
    tokenPassword: Sequilize.STRING,
    expiraToken: Sequilize.DATE
}, {
    hooks: {
        beforeCreate(usuario) {
            usuario.password = Usuarios.prototype.hashPassword(usuario.password)
        }
    }
})

// Metodo para comparar passwords
Usuarios.prototype.validarPassword = function(password) {
    return bcrypt.compareSync(password, this.password)
}

Usuarios.prototype.hashPassword = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null)
}

module.exports = Usuarios