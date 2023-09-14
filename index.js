const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const path = require('path')
const router = require('./routes')
const routes = require('./routes')

require('dotenv').config({path: 'variables.env'})


const app = express()

// Habilitar EJS como template engine
app.use(expressLayouts)
app.set('view engine', 'ejs')

// Ubicacion Vistas
app.set('views', path.join(__dirname, './views'))

// Archivos estaticos
app.use(express.static('public'))

//Routing
app.use('/', router())

// Agrega el puerto
app.listen(process.env.PORT, () => {
    console.log('El servidor esta funcinando')
})