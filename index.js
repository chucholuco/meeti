const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const path = require('path')
const bodyParser = require('body-parser')
const flash = require('connect-flash')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const expressValidator = require('express-validator')
const passport = require('./config/passport')
const router = require('./routes')

// configuracion y modelos DB
const db = require('./config/db')
    require('./models/Usuarios')
    db.sync().then(() => console.log('DB Conectada')).catch((error) => console.log(error))

// variables de desarrollo    
require('dotenv').config({path: 'variables.env'})

// aplicacion principal
const app = express()

// Body parser, leer formularios
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

// Express Validator (validacion con bastantes funciones)
app.use(expressValidator())

// Habilitar EJS como template engine
app.use(expressLayouts)
app.set('view engine', 'ejs')

// Ubicacion Vistas
app.set('views', path.join(__dirname, './views'))

// Archivos estaticos
app.use(express.static('public'))

// Habilitar cookie parser
app.use(cookieParser())

// crear la sesion
app.use(session({
    secret: process.env.SECRETO,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false

}))

// Inicializar passport
app.use(passport.initialize())
app.use(passport.session())

// Agrega flash messages
app.use(flash())

// Middleware (usuario logueado, flash messages, fecha actual)
app.use((req, res, next) => {
    res.locals.mensajes = req.flash()
    const fecha = new Date()
    res.locals.year = fecha.getFullYear()
    next()
})

//Routing
app.use('/', router())

// Agrega el puerto
app.listen(process.env.PORT, () => {
    console.log('El servidor esta funcinando')
})