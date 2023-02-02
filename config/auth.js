const localStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs')

// Model usuario
const Usuario = require('../models/Usuario')

module.exports = (passport) => {
    passport.use(new localStrategy({usernameField: 'email', passwordField: 'senha'}, (email, senha, done) => {
        Usuario.findOne({email: email}, (erro, usuario) => {
            if (erro) {
                return done(erro)
            }
            if (!usuario) {
                return done(null, false, {message: 'Email não registrado'})
            }

            const autenticado = bcrypt.compareSync(senha, usuario.senha)

            if (!autenticado) {
                return done(null, false, {message: 'Senha incorreta'})
            }
            
            return done(null, usuario)
        })
    }))

    passport.serializeUser((usuario, done) => {
        done(null, usuario.id)
    })

    passport.deserializeUser((id, done) => {
        Usuario.findById(id, (err, usuario) => {
            done(null, usuario)
        })
    })
}