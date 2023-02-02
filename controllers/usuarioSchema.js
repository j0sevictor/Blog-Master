const joi = require('joi')

const UsuarioSchema = new joi.object({
    nome: joi.string().min(2).max(40).trim().required(),
    email: joi.string().email().trim().required(),
    senha: joi.string().min(8).max(25).trim().required()
})

module.exports = UsuarioSchema