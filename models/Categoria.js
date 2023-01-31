const { Schema, model } = require('mongoose')

const categoriaSchema = new Schema({
    nome: {
        type: String,
        require: true
    },
    slug: {
        type: String,
        require: true
    },
    data_criado: {
        type: Date,
        default: Date.now()
    }
})

const Categoria = model('categorias', categoriaSchema)

module.exports = Categoria