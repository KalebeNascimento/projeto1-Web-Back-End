const bcrypt = require('bcryptjs');
const { AlunoModel, HabilidadeModel, AlunoHabilidade } = require('./index');

const Aluno = {
  async findAll() {
    return AlunoModel.findAll({
      attributes: ['id', 'nome', 'email', 'tipo', 'created_at'],
      order: [['nome', 'ASC']],
    });
  },

  async findAllAlunos() {
    return AlunoModel.findAll({
      where: { tipo: 'aluno' },
      attributes: ['id', 'nome', 'email', 'created_at'],
      order: [['nome', 'ASC']],
    });
  },

  async findById(id) {
    return AlunoModel.findByPk(id, {
      attributes: ['id', 'nome', 'email', 'tipo', 'created_at'],
    });
  },

  async findByEmail(email) {
    return AlunoModel.findOne({ where: { email } });
  },

  async create({ nome, email, senha, tipo = 'aluno' }) {
    const hash = await bcrypt.hash(senha, 10);
    const aluno = await AlunoModel.create({ nome, email, senha: hash, tipo });
    return aluno.id;
  },

  async update(id, { nome, email, senha }) {
    const data = { nome, email };
    if (senha && senha.trim() !== '') {
      data.senha = await bcrypt.hash(senha, 10);
    }
    await AlunoModel.update(data, { where: { id } });
  },

  async delete(id) {
    await AlunoModel.destroy({ where: { id } });
  },

  async validatePassword(plainPassword, hash) {
    return bcrypt.compare(plainPassword, hash);
  },

  async getHabilidades(alunoId) {
    const rows = await AlunoHabilidade.findAll({
      where: { aluno_id: alunoId },
      include: [{ model: HabilidadeModel, attributes: ['id', 'nome'] }],
      order: [[HabilidadeModel, 'nome', 'ASC']],
    });
    return rows.map(r => ({ id: r.Habilidade.id, nome: r.Habilidade.nome, nivel: r.nivel }));
  },

  async addHabilidade(alunoId, habilidadeId, nivel) {
    await AlunoHabilidade.create({ aluno_id: alunoId, habilidade_id: habilidadeId, nivel });
  },

  async updateHabilidade(alunoId, habilidadeId, nivel) {
    await AlunoHabilidade.update({ nivel }, { where: { aluno_id: alunoId, habilidade_id: habilidadeId } });
  },

  async removeHabilidade(alunoId, habilidadeId) {
    await AlunoHabilidade.destroy({ where: { aluno_id: alunoId, habilidade_id: habilidadeId } });
  },

  async hasHabilidade(alunoId, habilidadeId) {
    return AlunoHabilidade.findOne({ where: { aluno_id: alunoId, habilidade_id: habilidadeId } });
  },
};

module.exports = Aluno;
