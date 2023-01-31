const express = require('express')
const router = express.Router()
const ObjectId = require('mongoose').Types.ObjectId
const Categoria = require('../models/Categoria')
const Postagem = require('../models/Postagem')
const { validarCategoria, mensagens_ptbr } = require('../controllers/categoriaSchema')

function vazio(valor){
    if (!valor || typeof valor == undefined || valor == null){
        return true
    }
    return true
}

function isValidObjectId(id){     
    if (ObjectId.isValid(id)) {
        if((String) (new ObjectId(id)) === id)
            return true;              
        return false;
    }
    return false;
}

router.get('/', (req, res) => {
    return res.render('admin/index')
})

// Rotas relacionadas as categorias ------------

    router.get('/categorias', (req, res) => {
        Categoria.find().sort({nome: 'asc'}).lean().then((categorias) => {  
            return res.render('admin/categorias', {categorias: categorias})
        }).catch((erro) => {
            req.flash('error_msg', 'Não foi possível trazer as categorias')
            return res.render('admin/categorias')
        })
    })

    router.get('/categoria/adicionar', (req, res) => {
        return res.render('admin/adicionarCategoria')
    })

    router.get('/categoria/excluir/:id', (req, res) => {
        Categoria.findById(req.params.id).lean().then((categoria) => {
            return res.render('admin/excluirCategoria', {categoria: categoria})
        }).catch((erro) => {
            req.flash('error_msg', 'Categoria não existe')
            return res.redirect('/admin/categorias')
        })
    })

    router.get('/categoria/editar/:id', (req, res) => {
        Categoria.findById(req.params.id).lean().then((categoria) => {
            return res.render('admin/editarCategoria', {categoria: categoria})
        }).catch((erro) => {
            req.flash('error_msg', 'Categoria não existe')
            return res.redirect('/admin/categorias')
        })
    })

    router.post('/categoria/nova', (req, res) => {
        const cat = {
            nome: req.body.nome,
            slug: req.body.slug
        }

        const { error } = validarCategoria(cat, mensagens_ptbr)

        if (error) {
            return res.render('admin/adicionarCategoria', {erros: erros, nome: nome, slug: slug})
        }

        Categoria.create({
            nome: req.body.nome,
            slug: req.body.slug
        }).then(() => {
            req.flash('success_msg', 'Categoria "' + req.body.nome + '" criada com sucesso!')
            return res.redirect('/admin/categorias')
        }).catch((erro) => {
            req.flash('error_msg', 'Categoria não salva pelo sistema')
            return res.redirect('/admin/categoria/adicionar')
        })
    })

    router.post('/categoria/excluir/confirmado', (req, res) => {
        Categoria.findByIdAndDelete(req.body.id).lean().then((categoria) => {
            req.flash('success_msg', 'Categoria "' + categoria.nome + '" foi excluida')
            return res.redirect('/admin/categorias')
        }).catch((erro) => {
            req.flash('error_msg', 'Erro na exclusão')
            return res.redirect('/admin/categorias')
        })
    })

    router.post('/categoria/editar/confirmado', (req, res) => {
        let nome = req.body.nome
        let slug = req.body.slug
        let erros = []

        if (!nome || typeof nome == undefined || nome == null) {
            erros.push({texto: 'Nome inválido'})
        }
        if (!slug || typeof slug == undefined || slug == null) {
            erros.push({texto: 'Slug inválido'})
        }

        if (erros.length > 0) {
            return res.render('admin/editarCategoria', {erros: erros, nome: nome, slug: slug})
        }

        Categoria.findByIdAndUpdate(req.body.id, {
            nome: nome,
            slug: slug
        }).then(() => {
            req.flash('success_msg', 'Categoria "' + nome + '" foi atualizada com sucesso!')
            return res.redirect('/admin/categorias')
        }).catch((erro) => {
            req.flash('error_msg', 'Categoria não atualizada pelo sistema')
            return res.redirect('/admin/categoria/editar/' + req.body.id)
        })
    })

// Rotas relacionadas as postagens ----------------------------

    router.get('/postagens', (req, res) => {
        Postagem.find().populate('categoria').sort({categoria: 'asc', data_postagem: 'desc'}).lean().then((postagens) => {
            return res.render('admin/postagens', {postagens: postagens})
        })
    })

    router.get('/postagem/adicionar', (req, res) => {
        Categoria.find().lean().then((categorias) => {
            return res.render('admin/adicionarPostagem', {categorias: categorias})
        }).catch((erro) => {
            req.flash('error_msg', 'Erro no carregamento das categorias. ' + erro)
            return res.redirect('/postagens')
        })
    })

    router.get('/postagem/excluir/:id', (req, res) => {
        Postagem.findById(req.params.id).lean().then((postagem) => {
            return res.render('admin/excluirPostagem', {postagem: postagem})
        }).catch((erro) => {
            req.flash('error_msg', 'Postagem não existe')
            return res.redirect('/admin/postagens')
        })
    })

    router.get('/postagem/editar/:id', (req, res) => {
        Postagem.findById(req.params.id).lean().then((postagem) => {
            Categoria.find().lean().then((categorias) => {
                return res.render('admin/editarPostagem', {postagem: postagem, categorias: categorias})
            })
        }).catch((erro) => {
            req.flash('error_msg', 'Postagem não existe')
            return res.redirect('/admin/postagens')
        })
    })

    router.post('/postagem/excluir/confirmado', (req, res) => {
        Postagem.findByIdAndDelete(req.body.id).then((postagem) => {
            req.flash('success_msg', 'Postagem "' + postagem.titulo + '" foi excluida')
            return res.redirect('/admin/postagens')
        }).catch((erro) => {
            req.flash('error_msg', 'Postagem não existe')
            return res.redirect('/admin/postagens')
        })
    })

    router.post('/postagem/editar/confirmado', (req, res) => {
        const form = {
            _id: req.body.id,
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            slug: req.body.slug,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
        }
        erros = []

        if (!form.titulo || typeof form.titulo == undefined || form.titulo == null){
            erros.push({texto: 'Título inválido'})
        }
        if (!form.descricao || typeof form.descricao == undefined || form.descricao == null){
            erros.push({texto: 'Descrição inválida'})
        }
        if (!form.slug || typeof form.slug == undefined || form.slug == null){
            erros.push({texto: 'Slug inválido'})
        }
        if (!form.conteudo || typeof form.conteudo == undefined || form.conteudo == null){
            erros.push({texto: 'Conteúdo inválido'})
        }

        if (!form.categoria || typeof form.categoria == undefined || form.categoria == null){
            erros.push({texto: 'Selecione uma categoria'})
        }

        if (!isValidObjectId(form.categoria)){
            erros.push({texto: 'Categoria inválida'})
        } 
        
        if (!isValidObjectId(form._id)){
            req.flash('error_msg', 'Postagem não existe')
            return res.redirect('/admin/postagens')
        } 

        if (erros.length > 0){
            Categoria.find().lean().then((categorias) => {
                return res.render('admin/editarPostagem', {categorias: categorias, erros: erros, postagem: form})
            }).catch((erro) => {
                req.flash('error_msg', 'Erro no carregamento das categorias. ' + erro)
                return res.redirect('/admin/postagens')
            })
        }

        Postagem.findByIdAndUpdate(form._id, form).then((postagem) => {
            req.flash('success_msg', 'Postagem "' + postagem.titulo + '" editada com sucesso!')
            return res.redirect('/admin/postagens')
        }).catch((erro) => {
            req.flash('error_msg', 'Erro durate a edição. ' + erro)
            return res.redirect('/admin/postagem/editar/' + postagem._id)
        })
    })

    router.post('/postagem/nova', (req, res) => {
        const form = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            slug: req.body.slug,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
        }
        erros = []

        if (!form.titulo || typeof form.titulo == undefined || form.titulo == null || form.titulo == ""){
            erros.push({texto: 'Título inválido'})
        }
        if (!form.descricao || typeof form.descricao == undefined || form.descricao == null){
            erros.push({texto: 'Descrição inválida'})
        }
        if (!form.slug || typeof form.slug == undefined || form.slug == null){
            erros.push({texto: 'Slug inválido'})
        }
        if (!form.conteudo || typeof form.conteudo == undefined || form.conteudo == null){
            erros.push({texto: 'Conteúdo inválido'})
        }

        if (!form.categoria || typeof form.categoria == undefined || form.categoria == null){
            erros.push({texto: 'Selecione uma categoria'})
        }

        if (!isValidObjectId(form.categoria)){
            erros.push({texto: 'Categoria inválida'})
        }

        if (erros.length > 0){
            Categoria.find().lean().then((categorias) => {
                return res.render('admin/adicionarPostagem', {categorias: categorias, erros: erros, form: form})
            }).catch((erro) => {
                req.flash('error_msg', 'Erro no carregamento das categorias. ' + erro)
                return res.redirect('/admin/postagens')
            })
        }

        Postagem.create({
            titulo: form.titulo,
            descricao: form.descricao,
            slug: form.slug,
            conteudo: form.conteudo,
            categoria: form.categoria
        }).then(() => {
            req.flash('success_msg', 'Postagem "' + form.titulo + '" foi publicada com sucesso!')
            return res.redirect('/admin/postagens')
        }).catch((erro) => {
            req.flash('error_msg', 'Erro, postagem não publicada. ' + erro)
            return res.render('admin/adicionarPostagem', {form: form})
        })

    })

module.exports = router