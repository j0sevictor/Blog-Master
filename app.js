// Carregando Módulos
    const express = require('express')
    const handlebars = require('express-handlebars')
    const bodyParser = require('body-parser')
    const admin = require('./routes/admin')
    const path = require('path')
    const mongoose = require('mongoose')
    const session = require('express-session')
    const flash = require('connect-flash')

// Constantes
    const PORTA = '3000'

// Configurações
    const app = express()

    //session e flash
        app.use(session({
            secret: 'dsf$#$@#SD!#RD#@FRD21es',
            resave: true,
            saveUninitialized: true
        }))
        app.use(flash())
    //MIDLEWARE
        app.use((req, res, next) => {
            res.locals.success_msg  = req.flash('success_msg')
            res.locals.error_msg = req.flash('error_msg')
            next()
        })
    //body-parser
        app.use(bodyParser.urlencoded({extended: true}))
        app.use(bodyParser.json())
    //handlebars
        const hhd = handlebars.create({
            defaultLayout: 'main',
            helpers: {}
        })
        app.engine('handlebars', hhd.engine)
        app.set('view engine', 'handlebars')      
    //mongoose
        mongoose.set('strictQuery', true)
        mongoose.connect('mongodb://127.0.0.1:27017/blog', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }).then(() => {
            console.log('Conectado ao banco')
        }).catch((erro) => {
            console.log('Falha ao se conectar ao banco. ' + erro)
        })      
    //Public - pasta de arquivos estáticos
        app.use(express.static(path.join(__dirname,'public')))

// Rotas da aplicação
    // Rotas definidas no arquivo admin.js
    app.use('/admin', admin)

// Outros
    app.listen(PORTA, () => {
        console.log('Servidor: ON')
    })
