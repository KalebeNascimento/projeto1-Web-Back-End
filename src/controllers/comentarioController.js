const Comentario = require('../models/Comentario');
const Receita = require('../models/Receita');

const comentarioController = {
  async showReceita(req, res) {
    const receita = Receita.findById(req.params.id);
    if (!receita) {
      req.flash('error', 'Receita não encontrada.');
      return res.redirect('/');
    }

    receita.categorias = Receita.getCategorias(req.params.id);
    receita.alunos_responsaveis = Receita.getAlunos(req.params.id);

    let comentarios = [];
    try {
      comentarios = await Comentario.find({ receita_id: Number(req.params.id) })
        .sort({ created_at: -1 });
    } catch {
      // MongoDB indisponível, exibe receita sem comentários
    }

    res.render('public/receita', {
      title: receita.nome,
      usuario: req.session.usuario || null,
      receita,
      comentarios,
      success: req.flash('success'),
      error: req.flash('error')
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
        conteudo: conteudo.trim()
      });
      req.flash('success', 'Comentário adicionado com sucesso!');
    } catch {
      req.flash('error', 'Erro ao salvar comentário. Verifique se o MongoDB está rodando.');
    }

    res.redirect(`/receitas/${req.params.id}`);
  },

  async excluirComentario(req, res) {
    try {
      await Comentario.findByIdAndDelete(req.params.comentarioId);
      req.flash('success', 'Comentário excluído.');
    } catch {
      req.flash('error', 'Erro ao excluir comentário.');
    }
    res.redirect(`/receitas/${req.params.id}`);
  }
};

module.exports = comentarioController;
