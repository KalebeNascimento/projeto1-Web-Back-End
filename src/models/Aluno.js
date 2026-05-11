const db = require('../config/database');
const bcrypt = require('bcryptjs');

const Aluno = {
  findAll() {
    return db.prepare("SELECT id, nome, email, tipo, created_at FROM alunos ORDER BY nome").all();
  },

  findAllAlunos() {
    return db.prepare("SELECT id, nome, email, created_at FROM alunos WHERE tipo = 'aluno' ORDER BY nome").all();
  },

  findById(id) {
    return db.prepare("SELECT id, nome, email, tipo, created_at FROM alunos WHERE id = ?").get(id);
  },

  findByEmail(email) {
    return db.prepare("SELECT * FROM alunos WHERE email = ?").get(email);
  },

  create({ nome, email, senha, tipo = 'aluno' }) {
    const hash = bcrypt.hashSync(senha, 10);
    const result = db.prepare("INSERT INTO alunos (nome, email, senha, tipo) VALUES (?, ?, ?, ?)").run(nome, email, hash, tipo);
    return result.lastInsertRowid;
  },

  update(id, { nome, email, senha }) {
    if (senha && senha.trim() !== '') {
      const hash = bcrypt.hashSync(senha, 10);
      db.prepare("UPDATE alunos SET nome = ?, email = ?, senha = ? WHERE id = ?").run(nome, email, hash, id);
    } else {
      db.prepare("UPDATE alunos SET nome = ?, email = ? WHERE id = ?").run(nome, email, id);
    }
  },

  delete(id) {
    db.prepare("DELETE FROM alunos WHERE id = ?").run(id);
  },

  validatePassword(plainPassword, hash) {
    return bcrypt.compareSync(plainPassword, hash);
  },

  getHabilidades(alunoId) {
    return db.prepare(`
      SELECT h.id, h.nome, ah.nivel
      FROM habilidades h
      JOIN aluno_habilidade ah ON ah.habilidade_id = h.id
      WHERE ah.aluno_id = ?
      ORDER BY h.nome
    `).all(alunoId);
  },

  addHabilidade(alunoId, habilidadeId, nivel) {
    db.prepare("INSERT OR REPLACE INTO aluno_habilidade (aluno_id, habilidade_id, nivel) VALUES (?, ?, ?)").run(alunoId, habilidadeId, nivel);
  },

  updateHabilidade(alunoId, habilidadeId, nivel) {
    db.prepare("UPDATE aluno_habilidade SET nivel = ? WHERE aluno_id = ? AND habilidade_id = ?").run(nivel, alunoId, habilidadeId);
  },

  removeHabilidade(alunoId, habilidadeId) {
    db.prepare("DELETE FROM aluno_habilidade WHERE aluno_id = ? AND habilidade_id = ?").run(alunoId, habilidadeId);
  },

  hasHabilidade(alunoId, habilidadeId) {
    return db.prepare("SELECT 1 FROM aluno_habilidade WHERE aluno_id = ? AND habilidade_id = ?").get(alunoId, habilidadeId);
  }
};

module.exports = Aluno;
