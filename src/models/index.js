const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// ── Model definitions ─────────────────────────────────────

const AlunoModel = sequelize.define('Aluno', {
  nome:  { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  senha: { type: DataTypes.STRING, allowNull: false },
  tipo:  { type: DataTypes.STRING, allowNull: false, defaultValue: 'aluno' },
}, {
  tableName: 'alunos',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

const CategoriaModel = sequelize.define('Categoria', {
  nome: { type: DataTypes.STRING, allowNull: false, unique: true },
}, {
  tableName: 'categorias',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

const HabilidadeModel = sequelize.define('Habilidade', {
  nome: { type: DataTypes.STRING, allowNull: false, unique: true },
}, {
  tableName: 'habilidades',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

const ReceitaModel = sequelize.define('Receita', {
  nome:         { type: DataTypes.STRING, allowNull: false },
  descricao:    { type: DataTypes.TEXT },
  link_externo: { type: DataTypes.STRING },
  criado_por:   { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName: 'receitas',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

const ComentarioModel = sequelize.define('Comentario', {
  receita_id:  { type: DataTypes.INTEGER, allowNull: false },
  autor_nome:  { type: DataTypes.STRING(100), allowNull: false },
  conteudo:    { type: DataTypes.STRING(1000), allowNull: false },
}, {
  tableName: 'comentarios',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

// ── Junction tables ───────────────────────────────────────

const ReceitaCategoria = sequelize.define('ReceitaCategoria', {}, {
  tableName: 'receita_categoria',
  timestamps: false,
});

const ReceitaAluno = sequelize.define('ReceitaAluno', {}, {
  tableName: 'receita_aluno',
  timestamps: false,
});

const AlunoHabilidade = sequelize.define('AlunoHabilidade', {
  nivel: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
}, {
  tableName: 'aluno_habilidade',
  timestamps: false,
});

// ── Associations ──────────────────────────────────────────

ReceitaModel.belongsTo(AlunoModel, { as: 'criador', foreignKey: 'criado_por' });
AlunoModel.hasMany(ReceitaModel, { foreignKey: 'criado_por', as: 'ReceitasCriadas' });

ReceitaModel.belongsToMany(AlunoModel, {
  through: ReceitaAluno, foreignKey: 'receita_id', otherKey: 'aluno_id', as: 'Alunos',
});
AlunoModel.belongsToMany(ReceitaModel, {
  through: ReceitaAluno, foreignKey: 'aluno_id', otherKey: 'receita_id', as: 'Receitas',
});

ReceitaModel.belongsToMany(CategoriaModel, {
  through: ReceitaCategoria, foreignKey: 'receita_id', otherKey: 'categoria_id', as: 'Categorias',
});
CategoriaModel.belongsToMany(ReceitaModel, {
  through: ReceitaCategoria, foreignKey: 'categoria_id', otherKey: 'receita_id', as: 'Receitas',
});

AlunoModel.belongsToMany(HabilidadeModel, {
  through: AlunoHabilidade, foreignKey: 'aluno_id', otherKey: 'habilidade_id', as: 'Habilidades',
});
HabilidadeModel.belongsToMany(AlunoModel, {
  through: AlunoHabilidade, foreignKey: 'habilidade_id', otherKey: 'aluno_id', as: 'Alunos',
});

ReceitaModel.hasMany(ComentarioModel, { foreignKey: 'receita_id' });
ComentarioModel.belongsTo(ReceitaModel, { foreignKey: 'receita_id' });

module.exports = {
  sequelize,
  AlunoModel,
  CategoriaModel,
  HabilidadeModel,
  ReceitaModel,
  ComentarioModel,
  ReceitaCategoria,
  ReceitaAluno,
  AlunoHabilidade,
};
