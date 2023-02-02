const { Schema, model } = require('mongoose')

const UsuarioSchema = new Schema({
    nome: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    senha: {
        type: String,
        require: true
    },
    eAdmin: {
        type: Boolean,
        default: false
    }
})

Usuario = model('usuarios', UsuarioSchema)
module.exports = Usuario