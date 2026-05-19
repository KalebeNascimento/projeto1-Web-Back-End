const Comentario = require('../models/Comentario');
const Receita = require('../models/Receita');

const comentarioController = {
  async showReceita(req, res) {
    const receita = await Receita.findById(req.params.id);
    if (!receita) {
      req.flash('error', 'Receita não encontrada.');
      return res.redirect('/');
    }

    const [categorias, alunos_responsaveis, comentarios] = await Promise.all([
      Receita.getCategorias(req.params.id),
      Receita.getAlunos(req.params.id),
      Comentario.findAll({
        where: { receita_id: Number(req.params.id) },
        order: [['created_at', 'DESC']],
      }),
    ]);

    receita.categorias = categorias;
    receita.alunos_responsaveis = alunos_responsaveis;

    res.render('public/receita', {
      title: receita.nome,
      usuario: req.session.usuario || null,
      receita,
      comentarios,
      success: req.flash('success'),
      error: req.flash('error'),
    });
  },

  async criarComentario(req, res) {
    const { autor_nome, conteudo } = req.body;

    if (!autor_nome || !conteudo) {
      req.flash('error', 'Nome e comentário são obrigatórios.');
      return res.redirect(`/receitas/${req.params.id}`);
    }

    try {
      await Comentario.create({
        receita_id: Number(req.params.id),
        autor_nome: autor_nome.trim(),
        conteudo: conteudo.trim(),
      });
      req.flash('success', 'Comentário adicionado com sucesso!');
    } catch {
      req.flash('error', 'Erro ao salvar comentário.');
    }

    res.redirect(`/receitas/${req.params.id}`);
  },

  async excluirComentario(req, res) {
    try {
      await Comentario.destroy({ where: { id: req.params.comentarioId } });
      req.flash('success', 'Comentário excluído.');
    } catch {
      req.flash('error', 'Erro ao excluir comentário.');
    }
    res.redirect(`/receitas/${req.params.id}`);
  },
};

module.exports = comentarioController;
