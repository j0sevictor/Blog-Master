const joi = require('joi')
const { messages } = require('joi-translation-pt-br')

const categoriaSchema = new joi.object({
    nome: joi.string().alphanum().min(2).max(50).required(),
    slug: joi.string().alphanum().min(2).required()
})

//const { error } = categoriaSchema.validate({nome: 'Victor', slug: 'dsad'}, { messages })

module.exports = {
    validarCategoria: categoriaSchema.validate,
    messagens_ptbr: messages
}