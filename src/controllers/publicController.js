const Receita = require('../models/Receita');
const Categoria = require('../models/Categoria');
const Habilidade = require('../models/Habilidade');

const publicController = {
  async index(req, res) {
    const [receitas, categorias] = await Promise.all([
      Receita.findAll(),
      Categoria.findAll(),
    ]);
    res.render('public/index', {
      title: 'Portfólio de Receitas',
      usuario: req.session.usuario || null,
      receitas,
      categorias,
      categoriaFiltro: null,
    });
  },

  async receitasPorCategoria(req, res) {
    const categoriaId = req.params.id;
    const [categoria, categorias] = await Promise.all([
      Categoria.findById(categoriaId),
      Categoria.findAll(),
    ]);
    if (!categoria) return res.redirect('/');

    const receitas = await Receita.findByCategoria(categoriaId);
    res.render('public/index', {
      title: `Receitas: ${categoria.nome}`,
      usuario: req.session.usuario || null,
      receitas,
      categorias,
      categoriaFiltro: categoria,
    });
  },

  async relatorio(req, res) {
    const habilidades = await Habilidade.getRelatorioHabilidades();
    res.render('public/relatorio', {
      title: 'Relatório de Habilidades',
      usuario: req.session.usuario || null,
      habilidades,
    });
  },
};

module.exports = publicController;
