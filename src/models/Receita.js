const { Op } = require('sequelize');
const { ReceitaModel, AlunoModel, CategoriaModel, ReceitaCategoria, ReceitaAluno } = require('./index');

function formatReceita(r) {
  const obj = r.toJSON ? r.toJSON() : r;
  return {
    ...obj,
    criador_nome: obj.criador ? obj.criador.nome : null,
    categorias_nomes: obj.Categorias && obj.Categorias.length
      ? obj.Categorias.map(c => c.nome).join(',')
      : null,
  };
}

const includeBase = [
  { model: AlunoModel, as: 'criador', attributes: ['nome'] },
  { model: CategoriaModel, as: 'Categorias', attributes: ['nome'], through: { attributes: [] } },
];

const Receita = {
  async findAll() {
    const receitas = await ReceitaModel.findAll({
      include: includeBase,
      order: [['created_at', 'DESC']],
    });
    return receitas.map(formatReceita);
  },

  async findById(id) {
    const receita = await ReceitaModel.findByPk(id, {
      include: [{ model: AlunoModel, as: 'criador', attributes: ['nome'] }],
    });
    if (!receita) return null;
    const obj = receita.toJSON();
    return { ...obj, criador_nome: obj.criador ? obj.criador.nome : null };
  },

  async findByAluno(alunoId) {
    const receitas = await ReceitaModel.findAll({
      include: [
        ...includeBase,
        { model: AlunoModel, as: 'Alunos', where: { id: alunoId }, attributes: [], through: { attributes: [] } },
      ],
      order: [['created_at', 'DESC']],
    });
    return receitas.map(formatReceita);
  },

  async findByCategoria(categoriaId) {
    const ids = (await ReceitaCategoria.findAll({
      where: { categoria_id: categoriaId },
      attributes: ['receita_id'],
    })).map(r => r.receita_id);

    if (ids.length === 0) return [];

    const receitas = await ReceitaModel.findAll({
      where: { id: { [Op.in]: ids } },
      include: includeBase,
      order: [['created_at', 'DESC']],
    });
    return receitas.map(formatReceita);
  },

  async create({ nome, descricao, link_externo, criado_por }) {
    const receita = await ReceitaModel.create({ nome, descricao, link_externo, criado_por });
    return receita.id;
  },

  async update(id, { nome, descricao, link_externo }) {
    await ReceitaModel.update({ nome, descricao, link_externo }, { where: { id } });
  },

  async delete(id) {
    await ReceitaModel.destroy({ where: { id } });
  },

  async getCategorias(receitaId) {
    const rows = await ReceitaCategoria.findAll({
      where: { receita_id: receitaId },
      include: [{ model: CategoriaModel, attributes: ['id', 'nome'] }],
      order: [[CategoriaModel, 'nome', 'ASC']],
    });
    return rows.map(r => ({ id: r.Categoria.id, nome: r.Categoria.nome }));
  },

  async setCategorias(receitaId, categoriaIds) {
    await ReceitaCategoria.destroy({ where: { receita_id: receitaId } });
    if (categoriaIds && categoriaIds.length > 0) {
      await ReceitaCategoria.bulkCreate(
        categoriaIds.map(cid => ({ receita_id: receitaId, categoria_id: cid }))
      );
    }
  },

  async getAlunos(receitaId) {
    const rows = await ReceitaAluno.findAll({
      where: { receita_id: receitaId },
      include: [{ model: AlunoModel, attributes: ['id', 'nome'] }],
      order: [[AlunoModel, 'nome', 'ASC']],
    });
    return rows.map(r => ({ id: r.Aluno.id, nome: r.Aluno.nome }));
  },

  async setAlunos(receitaId, alunoIds) {
    await ReceitaAluno.destroy({ where: { receita_id: receitaId } });
    if (alunoIds && alunoIds.length > 0) {
      await ReceitaAluno.bulkCreate(
        alunoIds.map(aid => ({ receita_id: receitaId, aluno_id: aid }))
      );
    }
  },

  async isResponsavel(receitaId, alunoId) {
    return ReceitaAluno.findOne({ where: { receita_id: receitaId, aluno_id: alunoId } });
  },
};

module.exports = Receita;
