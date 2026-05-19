const Receita = require('../models/Receita');
const Categoria = require('../models/Categoria');
const Habilidade = require('../models/Habilidade');
const Aluno = require('../models/Aluno');

const alunoController = {
  async dashboard(req, res) {
    const [receitas, habilidades] = await Promise.all([
      Receita.findByAluno(req.session.usuario.id),
      Aluno.getHabilidades(req.session.usuario.id),
    ]);
    res.render('aluno/dashboard', {
      title: 'Meu Painel',
      usuario: req.session.usuario,
      receitas,
      habilidades,
      success: req.flash('success'),
      error: req.flash('error'),
    });
  },

  // ── RECEITAS ─────────────────────────────────────────────
  async listarReceitas(req, res) {
    const receitas = await Receita.findByAluno(req.session.usuario.id);
    res.render('aluno/receitas/index', {
      title: 'Minhas Receitas',
      usuario: req.session.usuario,
      receitas,
      success: req.flash('success'),
      error: req.flash('error'),
    });
  },

  async novaReceita(req, res) {
    const [categorias, todosAlunos] = await Promise.all([
      Categoria.findAll(),
      Aluno.findAllAlunos(),
    ]);
    const alunos = todosAlunos.filter(a => a.id !== req.session.usuario.id);
    res.render('aluno/receitas/create', {
      title: 'Nova Receita',
      usuario: req.session.usuario,
      categorias,
      alunos,
      error: req.flash('error'),
    });
  },

  async criarReceita(req, res) {
    const { nome, descricao, link_externo } = req.body;
    let categorias = req.body.categorias || [];
    let coautores = req.body.coautores || [];

    if (!Array.isArray(categorias)) categorias = [categorias];
    if (!Array.isArray(coautores)) coautores = [coautores];

    if (!nome) {
      req.flash('error', 'O nome da receita é obrigatório.');
      return res.redirect('/aluno/receitas/nova');
    }

    const receitaId = await Receita.create({ nome, descricao, link_externo, criado_por: req.session.usuario.id });

    const todosAlunos = [String(req.session.usuario.id), ...coautores];
    const alunosUnicos = [...new Set(todosAlunos)].map(Number);
    await Receita.setAlunos(receitaId, alunosUnicos);
    await Receita.setCategorias(receitaId, categorias.map(Number).filter(Boolean));

    req.flash('success', 'Receita cadastrada com sucesso!');
    res.redirect('/aluno/receitas');
  },

  async editarReceita(req, res) {
    const [receita, responsavel] = await Promise.all([
      Receita.findById(req.params.id),
      Receita.isResponsavel(req.params.id, req.session.usuario.id),
    ]);
    if (!receita || !responsavel) {
      req.flash('error', 'Receita não encontrada ou sem permissão.');
      return res.redirect('/aluno/receitas');
    }

    const [categorias, alunos, categoriasAtuais, alunosAtuais] = await Promise.all([
      Categoria.findAll(),
      Aluno.findAllAlunos(),
      Receita.getCategorias(req.params.id),
      Receita.getAlunos(req.params.id),
    ]);

    res.render('aluno/receitas/edit', {
      title: 'Editar Receita',
      usuario: req.session.usuario,
      receita,
      categorias,
      alunos,
      categoriasAtuais: categoriasAtuais.map(c => c.id),
      alunosAtuais: alunosAtuais.map(a => a.id),
      error: req.flash('error'),
    });
  },

  async atualizarReceita(req, res) {
    const [receita, responsavel] = await Promise.all([
      Receita.findById(req.params.id),
      Receita.isResponsavel(req.params.id, req.session.usuario.id),
    ]);
    if (!receita || !responsavel) {
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

    await Receita.update(req.params.id, { nome, descricao, link_externo });

    const alunosIds = coautores.map(Number).filter(Boolean);
    if (!alunosIds.includes(req.session.usuario.id)) alunosIds.push(req.session.usuario.id);
    await Receita.setAlunos(req.params.id, [...new Set(alunosIds)]);
    await Receita.setCategorias(req.params.id, categorias.map(Number).filter(Boolean));

    req.flash('success', 'Receita atualizada com sucesso!');
    res.redirect('/aluno/receitas');
  },

  async excluirReceita(req, res) {
    const [receita, responsavel] = await Promise.all([
      Receita.findById(req.params.id),
      Receita.isResponsavel(req.params.id, req.session.usuario.id),
    ]);
    if (!receita || !responsavel) {
      req.flash('error', 'Receita não encontrada ou sem permissão.');
      return res.redirect('/aluno/receitas');
    }
    await Receita.delete(req.params.id);
    req.flash('success', 'Receita excluída com sucesso!');
    res.redirect('/aluno/receitas');
  },

  // ── HABILIDADES ──────────────────────────────────────────
  async listarHabilidades(req, res) {
    const [minhasHabilidades, todasHabilidades] = await Promise.all([
      Aluno.getHabilidades(req.session.usuario.id),
      Habilidade.findAll(),
    ]);
    const habilidadesIds = minhasHabilidades.map(h => h.id);
    const disponíveis = todasHabilidades.filter(h => !habilidadesIds.includes(h.id));

    res.render('aluno/habilidades/index', {
      title: 'Minhas Habilidades',
      usuario: req.session.usuario,
      minhasHabilidades,
      disponíveis,
      success: req.flash('success'),
      error: req.flash('error'),
    });
  },

  async adicionarHabilidade(req, res) {
    const { habilidade_id, nivel } = req.body;
    const nivelNum = parseInt(nivel);

    if (!habilidade_id || isNaN(nivelNum) || nivelNum < 0 || nivelNum > 10) {
      req.flash('error', 'Selecione uma habilidade e informe um nível entre 0 e 10.');
      return res.redirect('/aluno/habilidades');
    }

    if (await Aluno.hasHabilidade(req.session.usuario.id, habilidade_id)) {
      req.flash('error', 'Você já possui essa habilidade. Use a opção de editar.');
      return res.redirect('/aluno/habilidades');
    }

    await Aluno.addHabilidade(req.session.usuario.id, habilidade_id, nivelNum);
    req.flash('success', 'Habilidade adicionada com sucesso!');
    res.redirect('/aluno/habilidades');
  },

  async editarHabilidade(req, res) {
    const { nivel } = req.body;
    const nivelNum = parseInt(nivel);

    if (isNaN(nivelNum) || nivelNum < 0 || nivelNum > 10) {
      req.flash('error', 'Nível deve ser entre 0 e 10.');
      return res.redirect('/aluno/habilidades');
    }

    await Aluno.updateHabilidade(req.session.usuario.id, req.params.habilidadeId, nivelNum);
    req.flash('success', 'Nível atualizado com sucesso!');
    res.redirect('/aluno/habilidades');
  },

  async removerHabilidade(req, res) {
    await Aluno.removeHabilidade(req.session.usuario.id, req.params.habilidadeId);
    req.flash('success', 'Habilidade removida com sucesso!');
    res.redirect('/aluno/habilidades');
  },
};

module.exports = alunoController;
