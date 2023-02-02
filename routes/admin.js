const { Router } = require('express')
const router = Router()
const ObjectId = require('mongoose').Types.ObjectId
const Categoria = require('../models/Categoria')
const Postagem = require('../models/Postagem')
const categoriaSchema = require('../controllers/categoriaSchema')
const postagemSchema = require('../controllers/postagemSchema')
const { messages } = require('joi-translation-pt-br')
const { eAdmin } = require('../helpers/eAdmin')

/*
function isValidObjectId(id){     
    if (ObjectId.isValid(id)) {
        if((String) (new ObjectId(id)) === id)
            return true;              
        return false;
    }
    return false;
}
*/


// Rotas relacionadas as categorias ------------

    router.get('/categorias', eAdmin, (req, res) => {
        Categoria.find().sort({nome: 'asc'}).lean().then((categorias) => {  
            return res.render('admin/categorias', {categorias: categorias})
        }).catch((erro) => {
            req.flash('error_msg', 'Não foi possível trazer as categorias')
            return res.render('admin/categorias')
        })
    })

    router.get('/categoria/adicionar', eAdmin, (req, res) => {
        return res.render('admin/adicionarCategoria')
    })

    router.get('/categoria/excluir/:id', eAdmin, (req, res) => {
        Categoria.findById(req.params.id).lean().then((categoria) => {
            return res.render('admin/excluirCategoria', {categoria: categoria})
        }).catch((erro) => {
            req.flash('error_msg', 'Categoria não existe.')
            return res.redirect('/admin/categorias')
        })
    })

    router.get('/categoria/editar/:id', eAdmin, (req, res) => {
        Categoria.findById(req.params.id).lean().then((categoria) => {
            return res.render('admin/editarCategoria', {categoria: categoria})
        }).catch((erro) => {
            req.flash('error_msg', 'Categoria não existe')
            return res.redirect('/admin/categorias')
        })
    })

    router.post('/categoria/nova', (req, res) => {
        let categoriaForm = {
            nome: req.body.nome,
            slug: req.body.slug
        }

        const { value, error } = categoriaSchema.validate(categoriaForm, { messages })

        if (error) {
            return res.render('admin/adicionarCategoria', {nome: categoriaForm.nome, slug: categoriaForm.slug, erro: error.message})
        }

        categoriaForm = value

        Categoria.create({
            nome: categoriaForm.nome,
            slug: categoriaForm.slug
        }).then(() => {
            req.flash('success_msg', 'Categoria "' + categoriaForm.nome + '" criada com sucesso!')
            return res.redirect('/admin/categorias')
        }).catch((erro) => {
            req.flash('error_msg', 'Categoria não salva pelo sistema, titulo/slug pode já estar em uso. ' + erro)
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
        let categoriaForm = {
            nome: req.body.nome,
            slug: req.body.slug
        }

        const { value, error } = categoriaSchema.validate(categoriaForm, { messages })

        if (error) {
            return res.render('admin/editarCategoria', {nome: categoriaForm.nome, slug: categoriaForm.slug, erro: error.message})
        }

        categoriaForm = value

        Categoria.findByIdAndUpdate(req.body.id, {
            nome: categoriaForm.nome,
            slug: categoriaForm.slug
        }).then(() => {
            req.flash('success_msg', 'Categoria "' + categoriaForm.nome + '" foi atualizada com sucesso!')
            return res.redirect('/admin/categorias')
        }).catch((erro) => {
            req.flash('error_msg', 'Categoria não salva pelo sistema, titulo/slug pode já estar em uso. ' + erro)
            return res.redirect('/admin/categoria/editar/' + req.body.id)
        })
    })

// Rotas relacionadas as postagens ----------------------------

    router.get('/postagens', eAdmin, (req, res) => {
        Postagem.find().populate('categoria').sort({categoria: 'asc', data_postagem: 'desc'}).lean().then((postagens) => {
            return res.render('admin/postagens', {postagens: postagens})
        })
    })

    router.get('/postagem/adicionar', eAdmin, (req, res) => {
        Categoria.find().lean().then((categorias) => {
            return res.render('admin/adicionarPostagem', {categorias: categorias})
        }).catch((erro) => {
            req.flash('error_msg', 'Erro no carregamento das categorias. ' + erro)
            return res.redirect('/postagens')
        })
    })

    router.get('/postagem/excluir/:id', eAdmin, (req, res) => {
        Postagem.findById(req.params.id).lean().then((postagem) => {
            return res.render('admin/excluirPostagem', {postagem: postagem})
        }).catch((erro) => {
            req.flash('error_msg', 'Postagem não existe')
            return res.redirect('/admin/postagens')
        })
    })

    router.get('/postagem/editar/:id', eAdmin, (req, res) => {
        Postagem.findById(req.params.id).lean().then((postagem) => {
            Categoria.find().lean().then((categorias) => {
                return res.render('admin/editarPostagem', {postagem: postagem, post_id: postagem._id, categorias: categorias})
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

    router.post('/postagem/nova', (req, res) => {
        let postagemForm = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            slug: req.body.slug,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
        }
       
        const { value, error } = postagemSchema.validate(postagemForm, { messages })

        if (error){
            Categoria.find().lean().then((categorias) => {
                return res.render('admin/adicionarPostagem', {categorias: categorias, erro: error.message, postagem: postagemForm})
            }).catch((erro) => {
                req.flash('error_msg', 'Erro no carregamento das categorias. ' + erro)
                return res.redirect('/admin/postagens')
            })
            return
        }

        postagemForm = value

        Postagem.create({
            titulo: postagemForm.titulo,
            descricao: postagemForm.descricao,
            slug: postagemForm.slug,
            conteudo: postagemForm.conteudo,
            categoria: postagemForm.categoria
        }).then(() => {
            req.flash('success_msg', 'Postagem "' + postagemForm.titulo + '" foi publicada com sucesso!')
            res.redirect('/admin/postagens')
        }).catch((erro) => {
            erro = 'Titulo/slug pode já estar sendo usado. ' + erro
            Categoria.find().lean().then((categorias) => {
                res.render('admin/adicionarPostagem', {postagem: postagemForm, categorias: categorias, erro: erro})
            }).catch((erro) => {
                req.flash('error_msg', 'Erro no carregamento das categorias. ' + erro)
                return res.redirect('/admin/postagens')
            })
        })

    })

    router.post('/postagem/editar/confirmado', (req, res) => {
        let postagemForm = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            slug: req.body.slug,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
        }

        const { value, error } = postagemSchema.validate(postagemForm, { messages }) 

        if (error){
            Categoria.find().lean().then((categorias) => {
                return res.render('admin/editarPostagem', {categorias: categorias, erro: error.message, postagem: postagemForm, post_id: req.body.id})
            }).catch((erro) => {
                req.flash('error_msg', 'Erro no carregamento das categorias. ' + erro)
                return res.redirect('/admin/postagens')
            })
            return
        }

        postagemForm = value

        Postagem.findByIdAndUpdate(req.body.id, postagemForm).then((postagem) => {
            req.flash('success_msg', 'Postagem "' + postagem.titulo + '" editada com sucesso!')
            return res.redirect('/admin/postagens')
        }).catch((erro) => {
            req.flash('error_msg', 'Erro durate a edição, titulo/slug pode já estar sendo usado. ' + erro)
            return res.redirect('/admin/postagem/editar/' + req.body.id)
        })
    })

module.exports = router