// Carregando Módulos
    const express = require('express')
    const handlebars = require('express-handlebars')
    const bodyParser = require('body-parser')
    const path = require('path')
    const mongoose = require('mongoose')
    const session = require('express-session')
    const flash = require('connect-flash')
    
    const usuario = require('./routes/usuario')
    const admin = require('./routes/admin')

    const Postagem = require('./models/Postagem')
    const Categoria = require('./models/Categoria')
const passport = require('passport')

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
        app.use(passport.initialize())
        app.use(passport.session())
        app.use(flash())
    //MIDLEWARE
        app.use((req, res, next) => {
            res.locals.success_msg  = req.flash('success_msg')
            res.locals.error_msg = req.flash('error_msg')
            res.locals.error = req.flash('error')
            res.locals.user = req.user || null
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

    app.get('/', (req, res) => {
        Postagem.find().sort({data_postagem: 'desc'}).populate('categoria').lean().then((postagens) => {
            res.render('index', {postagens: postagens})
        }).catch((erro) => {
            res.render('index', {erro: erro})
        })
    })

    app.get('/postagem/ler/:slug', (req, res) => {
        Postagem.findOne({slug: req.params.slug}).populate('categoria').lean().then((postagem) => {
            if (postagem){
                res.render('postagemLeitura', {postagem: postagem})
            }else{
                req.flash('error_msg', 'Erro, postagem não existe')
                res.redirect('/')
            }
        }).catch((erro) => {
            req.flash('error_msg', 'Erro durante a pesquisa da postagem. ' + erro)
            res.redirect('/')
        })
    })

    app.get('/categorias', (req, res) => {
        Categoria.find().sort({nome: 'asc'}).lean().then((categorias) => {
            res.render('categoriasListagem', {categorias: categorias})
        }).catch((erro) => {
            req.flash('error_msg', 'Erro na requisição das categorias. ' + erro)
            res.redirect('/')
        })
    })

    app.get('/categoria/:slug', (req, res) => {
        Categoria.findOne({slug: req.params.slug}).lean().then((categoria) => {
            if (categoria){
                Postagem.find({categoria: categoria._id}).lean().then((postagens) => {
                    res.render('categoriaPostagens', {postagens: postagens, categoria: categoria})
                }).catch((erro) => {
                    req.flash('error_msg', 'Erro na requisição das postagens. ' + erro)
                    res.redirect('/')
                })
            }else{
                req.flash('error_msg', 'Essa categoria não existe.')
                res.redirect('/')
            }
        }).catch((erro) => {
            req.flash('error_msg', 'Erro na requisição da categoria. ' + erro)
            res.redirect('/')
        })
    })

    // Rotas definidas no arquivo usuario.js
    app.use('/usuario', usuario)

    // Rotas definidas no arquivo admin.js
    app.use('/admin', admin)

// Outros
    app.listen(PORTA, () => {
        console.log('Servidor: ON')
    })
