const joi = require('joi')

const postagemSchema = new joi.object({
    titulo: joi.string().trim().min(2).max(255).required(),
    descricao: joi.string().trim().min(2).required(),
    slug: joi.string().trim().min(2).required(),
    conteudo: joi.string().trim().required(),
    categoria: joi.string().alphanum().required()
})

module.exports = postagemSchema