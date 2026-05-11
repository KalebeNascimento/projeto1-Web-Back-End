const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, '../../database.db');

const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS alunos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      senha TEXT NOT NULL,
      tipo TEXT NOT NULL DEFAULT 'aluno',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categorias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS habilidades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS receitas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      descricao TEXT,
      link_externo TEXT,
      criado_por INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (criado_por) REFERENCES alunos(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS receita_categoria (
      receita_id INTEGER NOT NULL,
      categoria_id INTEGER NOT NULL,
      PRIMARY KEY (receita_id, categoria_id),
      FOREIGN KEY (receita_id) REFERENCES receitas(id) ON DELETE CASCADE,
      FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS receita_aluno (
      receita_id INTEGER NOT NULL,
      aluno_id INTEGER NOT NULL,
      PRIMARY KEY (receita_id, aluno_id),
      FOREIGN KEY (receita_id) REFERENCES receitas(id) ON DELETE CASCADE,
      FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS aluno_habilidade (
      aluno_id INTEGER NOT NULL,
      habilidade_id INTEGER NOT NULL,
      nivel INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (aluno_id, habilidade_id),
      FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE,
      FOREIGN KEY (habilidade_id) REFERENCES habilidades(id) ON DELETE CASCADE
    );
  `);

  const adminExists = db.prepare("SELECT id FROM alunos WHERE tipo = 'admin'").get();
  if (!adminExists) {
    const hash = bcrypt.hashSync('admin123', 10);
    db.prepare("INSERT INTO alunos (nome, email, senha, tipo) VALUES (?, ?, ?, 'admin')")
      .run('Administrador', 'admin@portfolio.com', hash);
  }

  const categorias = ['Sobremesas', 'Pratos Principais', 'Entradas', 'Bebidas', 'Lanches', 'Saladas'];
  const insertCat = db.prepare("INSERT OR IGNORE INTO categorias (nome) VALUES (?)");
  categorias.forEach(c => insertCat.run(c));

  const habilidades = ['Confeitaria', 'Grelhados', 'Massas', 'Frutos do Mar', 'Vegetariano', 'Panificação'];
  const insertHab = db.prepare("INSERT OR IGNORE INTO habilidades (nome) VALUES (?)");
  habilidades.forEach(h => insertHab.run(h));
}

initDatabase();

module.exports = db;
