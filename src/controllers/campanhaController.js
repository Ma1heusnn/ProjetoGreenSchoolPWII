const campanha = require('../models/campanha');

module.exports = {
  listar: () => ({ status: 200, data: campanha.listar() }),
  criar: ({ body }) => ({ status: 201, data: campanha.criar(body) }),
};
