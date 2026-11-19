const usuario = require('../models/usuario');
const acao = require('../models/acao');

function ranking() {
  const acoes = acao.listar();
  const alunos = usuario
    .listar()
    .map((u) => {
      const minhas = acoes.filter((a) => a.usuarioId === u.id);
      return { id: u.id, nome: u.nome, turma: u.turma, acoes: minhas.length, pontos: minhas.reduce((s, a) => s + a.pontos, 0) };
    })
    .sort((a, b) => b.pontos - a.pontos || a.nome.localeCompare(b.nome));

  const porTurma = {};
  for (const a of alunos) {
    porTurma[a.turma] ??= { turma: a.turma, alunos: 0, pontos: 0 };
    porTurma[a.turma].alunos++;
    porTurma[a.turma].pontos += a.pontos;
  }
  const turmas = Object.values(porTurma).sort((a, b) => b.pontos - a.pontos);

  return {
    alunos,
    turmas,
    resumo: { alunos: alunos.length, acoes: acoes.length, pontos: alunos.reduce((s, a) => s + a.pontos, 0) },
  };
}

module.exports = { ranking: () => ({ status: 200, data: ranking() }) };
