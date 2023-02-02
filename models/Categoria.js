const { Schema, model } = require('mongoose')

const categoriaSchema = new Schema({
    nome: {
        type: String,
        require: true,
        unique: true
    },
    slug: {
        type: String,
        require: true,
        unique: true
    },
    data_criado: {
        type: Date,
        default: Date.now()
    }
})

const Categoria = model('categorias', categoriaSchema)

module.exports = Categoria