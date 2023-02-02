const localStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

// Model usuario
const Usuario = require('../models/Usuario')

module.exports = (passport) => {
    passport.use(new localStrategy({usernameField: 'email', passwordField: 'senha'}, (email, senha, done) => {
        Usuario.findOne({email: email}).then((usuario) => {
            if (!usuario) {
                return done(null, false, {message: 'Email não registrado'})
            }

            bcrypt.compareSync(senha, usuario.senha, (erro, autenticado) => {
                if (autenticado) {
                    return done(null, usuario)
                } else {
                    return done(null, false, {message: 'Senha incorreta'})
                }
            })
        })
    }))
}