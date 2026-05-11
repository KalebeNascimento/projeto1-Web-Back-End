const db = require('../config/database');

const Habilidade = {
  findAll() {
    return db.prepare("SELECT * FROM habilidades ORDER BY nome").all();
  },

  findById(id) {
    return db.prepare("SELECT * FROM habilidades WHERE id = ?").get(id);
  },

  create({ nome }) {
    const result = db.prepare("INSERT INTO habilidades (nome) VALUES (?)").run(nome);
    return result.lastInsertRowid;
  },

  update(id, { nome }) {
    db.prepare("UPDATE habilidades SET nome = ? WHERE id = ?").run(nome, id);
  },

  delete(id) {
    db.prepare("DELETE FROM habilidades WHERE id = ?").run(id);
  },

  getRelatorioHabilidades() {
    const totalAlunos = db.prepare("SELECT COUNT(*) as total FROM alunos WHERE tipo = 'aluno'").get().total;
    const habilidades = db.prepare(`
      SELECT h.id, h.nome,
             COUNT(ah.aluno_id) as total_alunos,
             ROUND(AVG(ah.nivel), 1) as media_nivel
      FROM habilidades h
      LEFT JOIN aluno_habilidade ah ON ah.habilidade_id = h.id
      GROUP BY h.id, h.nome
      ORDER BY h.nome
    `).all();

    return habilidades.map(h => ({
      ...h,
      proporcao: totalAlunos > 0 ? Math.round((h.total_alunos / totalAlunos) * 100) : 0
    }));
  }
};

module.exports = Habilidade;
