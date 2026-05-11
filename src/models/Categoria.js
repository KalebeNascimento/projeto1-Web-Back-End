const db = require('../config/database');

const Categoria = {
  findAll() {
    return db.prepare("SELECT * FROM categorias ORDER BY nome").all();
  },

  findById(id) {
    return db.prepare("SELECT * FROM categorias WHERE id = ?").get(id);
  },

  create({ nome }) {
    const result = db.prepare("INSERT INTO categorias (nome) VALUES (?)").run(nome);
    return result.lastInsertRowid;
  },

  update(id, { nome }) {
    db.prepare("UPDATE categorias SET nome = ? WHERE id = ?").run(nome, id);
  },

  delete(id) {
    db.prepare("DELETE FROM categorias WHERE id = ?").run(id);
  }
};

module.exports = Categoria;
