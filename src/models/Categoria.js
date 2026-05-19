const { CategoriaModel } = require('./index');

const Categoria = {
  async findAll() {
    return CategoriaModel.findAll({ order: [['nome', 'ASC']] });
  },

  async findById(id) {
    return CategoriaModel.findByPk(id);
  },

  async create({ nome }) {
    const categoria = await CategoriaModel.create({ nome });
    return categoria.id;
  },

  async update(id, { nome }) {
    await CategoriaModel.update({ nome }, { where: { id } });
  },

  async delete(id) {
    await CategoriaModel.destroy({ where: { id } });
  },
};

module.exports = Categoria;
