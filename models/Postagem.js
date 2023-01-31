const { Schema, model } = require('mongoose')

const postagemSchema = new Schema({
    titulo: {
        type: String,
        require: true
    },
    slug: {
        type: String,
        require: true
    },
    descricao: {
        type: String,
        require: true
    },
    conteudo: {
        type: String,
        require: true
    },
    categoria: {
        type: Schema.Types.ObjectId,
        require: true,
        ref: 'categorias'
    },
    data_postagem: {
        type: Date,
        default: Date.now()
    }
})

const Postagem = model('postagens', postagemSchema)

module.exports = Postagem