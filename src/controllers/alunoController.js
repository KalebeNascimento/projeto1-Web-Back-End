const Receita = require('../models/Receita');
const Categoria = require('../models/Categoria');
const Habilidade = require('../models/Habilidade');
const Aluno = require('../models/Aluno');

const alunoController = {
  dashboard(req, res) {
    const receitas = Receita.findByAluno(req.session.usuario.id);
    const habilidades = Aluno.getHabilidades(req.session.usuario.id);
    res.render('aluno/dashboard', {
      title: 'Meu Painel',
      usuario: req.session.usuario,
      receitas,
      habilidades,
      success: req.flash('success'),
      error: req.flash('error')
    });
  },

  // ── RECEITAS ─────────────────────────────────────────────
  listarReceitas(req, res) {
    const receitas = Receita.findByAluno(req.session.usuario.id);
    res.render('aluno/receitas/index', {
      title: 'Minhas Receitas',
      usuario: req.session.usuario,
      receitas,
      success: req.flash('success'),
      error: req.flash('error')
    });
  },

  novaReceita(req, res) {
    const categorias = Categoria.findAll();
    const alunos = Aluno.findAllAlunos().filter(a => a.id !== req.session.usuario.id);
    res.render('aluno/receitas/create', {
      title: 'Nova Receita',
      usuario: req.session.usuario,
      categorias,
      alunos,
      error: req.flash('error')
    });
  },

  criarReceita(req, res) {
    const { nome, descricao, link_externo } = req.body;
    let categorias = req.body.categorias || [];
    let coautores = req.body.coautores || [];

    if (!Array.isArray(categorias)) categorias = [categorias];
    if (!Array.isArray(coautores)) coautores = [coautores];

    if (!nome) {
      req.flash('error', 'O nome da receita é obrigatório.');
      return res.redirect('/aluno/receitas/nova');
    }

    const receitaId = Receita.create({ nome, descricao, link_externo, criado_por: req.session.usuario.id });

    const todosAlunos = [String(req.session.usuario.id), ...coautores];
    const alunosUnicos = [...new Set(todosAlunos)].map(Number);
    Receita.setAlunos(receitaId, alunosUnicos);
    Receita.setCategorias(receitaId, categorias.map(Number).filter(Boolean));

    req.flash('success', 'Receita cadastrada com sucesso!');
    res.redirect('/aluno/receitas');
  },

  editarReceita(req, res) {
    const receita = Receita.findById(req.params.id);
    if (!receita || !Receita.isResponsavel(req.params.id, req.session.usuario.id)) {
      req.flash('error', 'Receita não encontrada ou sem permissão.');
      return res.redirect('/aluno/receitas');
    }

    const categorias = Categoria.findAll();
    const alunos = Aluno.findAllAlunos();
    const categoriasAtuais = Receita.getCategorias(req.params.id).map(c => c.id);
    const alunosAtuais = Receita.getAlunos(req.params.id).map(a => a.id);

    res.render('aluno/receitas/edit', {
      title: 'Editar Receita',
      usuario: req.session.usuario,
      receita,
      categorias,
      alunos,
      categoriasAtuais,
      alunosAtuais,
      error: req.flash('error')
    });
  },

  atualizarReceita(req, res) {
    const receita = Receita.findById(req.params.id);
    if (!receita || !Receita.isResponsavel(req.params.id, req.session.usuario.id)) {
      req.flash('error', 'Receita não encontrada ou sem permissão.');
      return res.redirect('/aluno/receitas');
    }

    const { nome, descricao, link_externo } = req.body;
    let categorias = req.body.categorias || [];
    let coautores = req.body.coautores || [];

    if (!Array.isArray(categorias)) categorias = [categorias];
    if (!Array.isArray(coautores)) coautores = [coautores];

    if (!nome) {
      req.flash('error', 'O nome da receita é obrigatório.');
      return res.redirect(`/aluno/receitas/${req.params.id}/editar`);
    }

    Receita.update(req.params.id, { nome, descricao, link_externo });

    const alunosIds = coautores.map(Number).filter(Boolean);
    if (!alunosIds.includes(req.session.usuario.id)) alunosIds.push(req.session.usuario.id);
    Receita.setAlunos(req.params.id, [...new Set(alunosIds)]);
    Receita.setCategorias(req.params.id, categorias.map(Number).filter(Boolean));

    req.flash('success', 'Receita atualizada com sucesso!');
    res.redirect('/aluno/receitas');
  },

  excluirReceita(req, res) {
    const receita = Receita.findById(req.params.id);
    if (!receita || !Receita.isResponsavel(req.params.id, req.session.usuario.id)) {
      req.flash('error', 'Receita não encontrada ou sem permissão.');
      return res.redirect('/aluno/receitas');
    }
    Receita.delete(req.params.id);
    req.flash('success', 'Receita excluída com sucesso!');
    res.redirect('/aluno/receitas');
  },

  // ── HABILIDADES ──────────────────────────────────────────
  listarHabilidades(req, res) {
    const minhasHabilidades = Aluno.getHabilidades(req.session.usuario.id);
    const todasHabilidades = Habilidade.findAll();
    const habilidadesIds = minhasHabilidades.map(h => h.id);
    const disponíveis = todasHabilidades.filter(h => !habilidadesIds.includes(h.id));

    res.render('aluno/habilidades/index', {
      title: 'Minhas Habilidades',
      usuario: req.session.usuario,
      minhasHabilidades,
      disponíveis,
      success: req.flash('success'),
      error: req.flash('error')
    });
  },

  adicionarHabilidade(req, res) {
    const { habilidade_id, nivel } = req.body;
    const nivelNum = parseInt(nivel);

    if (!habilidade_id || isNaN(nivelNum) || nivelNum < 0 || nivelNum > 10) {
      req.flash('error', 'Selecione uma habilidade e informe um nível entre 0 e 10.');
      return res.redirect('/aluno/habilidades');
    }

    if (Aluno.hasHabilidade(req.session.usuario.id, habilidade_id)) {
      req.flash('error', 'Você já possui essa habilidade. Use a opção de editar.');
      return res.redirect('/aluno/habilidades');
    }

    Aluno.addHabilidade(req.session.usuario.id, habilidade_id, nivelNum);
    req.flash('success', 'Habilidade adicionada com sucesso!');
    res.redirect('/aluno/habilidades');
  },

  editarHabilidade(req, res) {
    const { nivel } = req.body;
    const nivelNum = parseInt(nivel);

    if (isNaN(nivelNum) || nivelNum < 0 || nivelNum > 10) {
      req.flash('error', 'Nível deve ser entre 0 e 10.');
      return res.redirect('/aluno/habilidades');
    }

    Aluno.updateHabilidade(req.session.usuario.id, req.params.habilidadeId, nivelNum);
    req.flash('success', 'Nível atualizado com sucesso!');
    res.redirect('/aluno/habilidades');
  },

  removerHabilidade(req, res) {
    Aluno.removeHabilidade(req.session.usuario.id, req.params.habilidadeId);
    req.flash('success', 'Habilidade removida com sucesso!');
    res.redirect('/aluno/habilidades');
  }
};

module.exports = alunoController;
