const { Router } = require('express')
const router = Router()
const Usuario = require('../models/Usuario')
const { messages } = require('joi-translation-pt-br')
const usuarioSchema = require('../controllers/usuarioSchema')
const bcrypt = require('bcryptjs')

router.get('/registro', (req, res) => {
    res.render('usuario/registro')
})

router.post('/registro/cadastrar', (req, res) => {
    let usuarioForm = {
        nome: req.body.nome,
        email: req.body.email,
        senha: req.body.senha
    }

    const { error, value } = usuarioSchema.validate(usuarioForm, { messages })

    if (error){
        return res.render('usuario/registro', {usuario: usuarioForm, erro: error.message})
    } else if (usuarioForm.senha != req.body.senha2) {
        return res.render('usuario/registro', {usuario: usuarioForm, erro: 'Senhas diferentes'})
    }

    Usuario.findOne({email: usuarioForm.email}).then((usuario) => {
        if (usuario){
            return res.render('usuario/registro', {usuario: usuarioForm, erro: 'Email já cadastrado'})
        } else{
            usuarioForm = value
            usuarioForm.senha = bcrypt.hashSync(usuarioForm.senha, 10)

            Usuario.create(usuarioForm).then(() => {
                req.flash('success_msg', 'Usuario cadastrado com suscesso')
                return res.redirect('/')
            }).catch((erro) => {
                req.flash('error_msg', 'Erro no registro usuario não cadastrado')
                return res.redirect('/')
            })
        }
    }).catch((erro) => {
        req.flash('error_msg', 'Erro no registro usuario não cadastrado')
        return res.redirect('/')
    })

})

router.get('/login', (req, res) => {
    res.render('usuario/login')
})

router.post('/login/logar', (req, res) => {
    Usuario.findOne({email: req.body.email}).then((usuario) => {
        if (usuario) {

            if (bcrypt.compareSync(req.body.senha, usuario.senha)){
                req.flash('success_msg', 'Logado com sucesso')
                res.redirect('/')
            } else {
                res.render('usuario/login', {email: usuario.email, erro: 'Senha Incorreta'})
            }
            
        } else {
            res.render('usuario/login', {email: req.body.email, erro: 'Email não registrado'})
        }
    }).catch((erro) => {
        req.flash('error_msg', 'Não logado. Erro na requisição de login')
        res.redirect('/')
    })
})

module.exports = router