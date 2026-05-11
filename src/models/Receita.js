const db = require('../config/database');

const Receita = {
  findAll() {
    return db.prepare(`
      SELECT r.*, a.nome as criador_nome,
             GROUP_CONCAT(DISTINCT c.nome) as categorias_nomes
      FROM receitas r
      JOIN alunos a ON a.id = r.criado_por
      LEFT JOIN receita_categoria rc ON rc.receita_id = r.id
      LEFT JOIN categorias c ON c.id = rc.categoria_id
      GROUP BY r.id
      ORDER BY r.created_at DESC
    `).all();
  },

  findById(id) {
    return db.prepare(`
      SELECT r.*, a.nome as criador_nome
      FROM receitas r
      JOIN alunos a ON a.id = r.criado_por
      WHERE r.id = ?
    `).get(id);
  },

  findByAluno(alunoId) {
    return db.prepare(`
      SELECT r.*, a.nome as criador_nome,
             GROUP_CONCAT(DISTINCT c.nome) as categorias_nomes
      FROM receitas r
      JOIN alunos a ON a.id = r.criado_por
      JOIN receita_aluno ra ON ra.receita_id = r.id
      LEFT JOIN receita_categoria rc ON rc.receita_id = r.id
      LEFT JOIN categorias c ON c.id = rc.categoria_id
      WHERE ra.aluno_id = ?
      GROUP BY r.id
      ORDER BY r.created_at DESC
    `).all(alunoId);
  },

  findByCategoria(categoriaId) {
    return db.prepare(`
      SELECT r.*, a.nome as criador_nome,
             GROUP_CONCAT(DISTINCT c.nome) as categorias_nomes
      FROM receitas r
      JOIN alunos a ON a.id = r.criado_por
      JOIN receita_categoria rc2 ON rc2.receita_id = r.id AND rc2.categoria_id = ?
      LEFT JOIN receita_categoria rc ON rc.receita_id = r.id
      LEFT JOIN categorias c ON c.id = rc.categoria_id
      GROUP BY r.id
      ORDER BY r.created_at DESC
    `).all(categoriaId);
  },

  create({ nome, descricao, link_externo, criado_por }) {
    const result = db.prepare(
      "INSERT INTO receitas (nome, descricao, link_externo, criado_por) VALUES (?, ?, ?, ?)"
    ).run(nome, descricao, link_externo, criado_por);
    return result.lastInsertRowid;
  },

  update(id, { nome, descricao, link_externo }) {
    db.prepare("UPDATE receitas SET nome = ?, descricao = ?, link_externo = ? WHERE id = ?")
      .run(nome, descricao, link_externo, id);
  },

  delete(id) {
    db.prepare("DELETE FROM receitas WHERE id = ?").run(id);
  },

  getCategorias(receitaId) {
    return db.prepare(`
      SELECT c.id, c.nome FROM categorias c
      JOIN receita_categoria rc ON rc.categoria_id = c.id
      WHERE rc.receita_id = ?
      ORDER BY c.nome
    `).all(receitaId);
  },

  setCategorias(receitaId, categoriaIds) {
    db.prepare("DELETE FROM receita_categoria WHERE receita_id = ?").run(receitaId);
    const insert = db.prepare("INSERT INTO receita_categoria (receita_id, categoria_id) VALUES (?, ?)");
    const insertMany = db.transaction((ids) => {
      for (const catId of ids) insert.run(receitaId, catId);
    });
    if (categoriaIds && categoriaIds.length > 0) insertMany(categoriaIds);
  },

  getAlunos(receitaId) {
    return db.prepare(`
      SELECT a.id, a.nome FROM alunos a
      JOIN receita_aluno ra ON ra.aluno_id = a.id
      WHERE ra.receita_id = ?
      ORDER BY a.nome
    `).all(receitaId);
  },

  setAlunos(receitaId, alunoIds) {
    db.prepare("DELETE FROM receita_aluno WHERE receita_id = ?").run(receitaId);
    const insert = db.prepare("INSERT INTO receita_aluno (receita_id, aluno_id) VALUES (?, ?)");
    const insertMany = db.transaction((ids) => {
      for (const alunoId of ids) insert.run(receitaId, alunoId);
    });
    if (alunoIds && alunoIds.length > 0) insertMany(alunoIds);
  },

  isResponsavel(receitaId, alunoId) {
    return db.prepare("SELECT 1 FROM receita_aluno WHERE receita_id = ? AND aluno_id = ?").get(receitaId, alunoId);
  }
};

module.exports = Receita;
