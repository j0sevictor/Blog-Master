const { Router } = require('express')
const router = Router()
const Usuario = require('../models/Usuario')
const { messages } = require('joi-translation-pt-br')
const usuarioSchema = require('../controllers/usuarioSchema')
const bcrypt = require('bcryptjs')

const passport = require('passport')
require('../config/auth')(passport)

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

router.post('/login/verificacao', passport.authenticate('local', {
    failureRedirect: '/usuario/login',
    successRedirect: '/',
    failureFlash: true
})
)

router.get('/logout', (req, res) => {
    req.logout((erro) => {
        if (erro) {
            req.flash('error_msg', 'Erro no processo de logout. ' + erro)
        } else {
            req.flash('success_msg', 'Deslogado com sucesso!')
        }
        res.redirect('/')
    })
})

module.exports = router