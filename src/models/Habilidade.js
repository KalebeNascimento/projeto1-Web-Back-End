const { HabilidadeModel, AlunoModel, AlunoHabilidade } = require('./index');

const Habilidade = {
  async findAll() {
    return HabilidadeModel.findAll({ order: [['nome', 'ASC']] });
  },

  async findById(id) {
    return HabilidadeModel.findByPk(id);
  },

  async create({ nome }) {
    const habilidade = await HabilidadeModel.create({ nome });
    return habilidade.id;
  },

  async update(id, { nome }) {
    await HabilidadeModel.update({ nome }, { where: { id } });
  },

  async delete(id) {
    await HabilidadeModel.destroy({ where: { id } });
  },

  async getRelatorioHabilidades() {
    const totalAlunos = await AlunoModel.count({ where: { tipo: 'aluno' } });
    const habilidades = await HabilidadeModel.findAll({ order: [['nome', 'ASC']] });

    const resultado = await Promise.all(habilidades.map(async (h) => {
      const rows = await AlunoHabilidade.findAll({ where: { habilidade_id: h.id } });
      const total_alunos = rows.length;
      const media_nivel = total_alunos > 0
        ? Math.round((rows.reduce((s, r) => s + r.nivel, 0) / total_alunos) * 10) / 10
        : 0;
      return {
        id: h.id,
        nome: h.nome,
        total_alunos,
        media_nivel,
        proporcao: totalAlunos > 0 ? Math.round((total_alunos / totalAlunos) * 100) : 0,
      };
    }));

    return resultado;
  },
};

module.exports = Habilidade;
