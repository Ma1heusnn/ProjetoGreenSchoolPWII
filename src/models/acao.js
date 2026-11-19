const crypto = require('crypto');
const db = require('./db');
const usuario = require('./usuario');
const campanha = require('./campanha');
const { ErroHttp } = require('./erro');

// Regra de pontuação: pontos do tipo × quantidade.
const TIPOS = {
  reciclagem: { rotulo: 'Reciclagem', pontos: 10 },
  agua: { rotulo: 'Economia de água', pontos: 8 },
  energia: { rotulo: 'Economia de energia', pontos: 8 },
  plantio: { rotulo: 'Plantio', pontos: 15 },
  reutilizacao: { rotulo: 'Reutilização', pontos: 6 },
  educacao: { rotulo: 'Conscientização', pontos: 5 },
};

function listar() {
  return db.carregar().acoes;
}

function criar({ usuarioId, tipo, quantidade, campanhaId }) {
  if (!usuario.buscar(usuarioId)) throw new ErroHttp(400, 'Aluno não encontrado');
  const t = TIPOS[tipo];
  if (!t) throw new ErroHttp(400, 'Tipo de ação inválido');
  const qtd = Number(quantidade ?? 1);
  if (!Number.isInteger(qtd) || qtd < 1 || qtd > 20) throw new ErroHttp(400, 'Quantidade deve ser de 1 a 20');
  if (campanhaId && !campanha.buscar(campanhaId)) throw new ErroHttp(400, 'Campanha não encontrada');

  const dados = db.carregar();
  const acao = {
    id: crypto.randomUUID(),
    usuarioId,
    tipo,
    quantidade: qtd,
    campanhaId: campanhaId || null,
    pontos: t.pontos * qtd,
    criadaEm: new Date().toISOString(),
  };
  dados.acoes.push(acao);
  db.salvar(dados);
  return acao;
}

module.exports = { TIPOS, listar, criar };
