const Receita = require('../models/Receita');
const Categoria = require('../models/Categoria');
const Habilidade = require('../models/Habilidade');

const publicController = {
  index(req, res) {
    const receitas = Receita.findAll();
    const categorias = Categoria.findAll();
    res.render('public/index', {
      title: 'Portfólio de Receitas',
      usuario: req.session.usuario || null,
      receitas,
      categorias,
      categoriaFiltro: null
    });
  },

  receitasPorCategoria(req, res) {
    const categoriaId = req.params.id;
    const categoria = Categoria.findById(categoriaId);
    if (!categoria) return res.redirect('/');

    const receitas = Receita.findByCategoria(categoriaId);
    const categorias = Categoria.findAll();
    res.render('public/index', {
      title: `Receitas: ${categoria.nome}`,
      usuario: req.session.usuario || null,
      receitas,
      categorias,
      categoriaFiltro: categoria
    });
  },

  relatorio(req, res) {
    const habilidades = Habilidade.getRelatorioHabilidades();
    res.render('public/relatorio', {
      title: 'Relatório de Habilidades',
      usuario: req.session.usuario || null,
      habilidades
    });
  }
};

module.exports = publicController;
