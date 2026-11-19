const acao = require('../models/acao');

module.exports = {
  tipos: () => ({ status: 200, data: acao.TIPOS }),
  listar: () => ({ status: 200, data: acao.listar().toReversed() }),
  criar: ({ body }) => ({ status: 201, data: acao.criar(body) }),
};
