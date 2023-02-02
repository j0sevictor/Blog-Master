const joi = require('joi')

const categoriaSchema = new joi.object({
    nome: joi.string().trim().min(2).max(50).required(),
    slug: joi.string().trim().min(2).max(50).required()
})

module.exports = categoriaSchema
