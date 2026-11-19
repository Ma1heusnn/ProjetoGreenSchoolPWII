const usuario = require('../models/usuario');

module.exports = {
  listar: () => ({ status: 200, data: usuario.listar() }),
  criar: ({ body }) => ({ status: 201, data: usuario.criar(body) }),
};
