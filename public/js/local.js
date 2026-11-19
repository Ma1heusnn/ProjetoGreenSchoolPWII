// Backend simulado no navegador (localStorage), usado quando não há servidor,
// como no GitHub Pages. Espelha as regras de src/models: mantenha os dois em sincronia.
const CHAVE = 'greenschool';

const TIPOS = {
  reciclagem: { rotulo: 'Reciclagem', pontos: 10 },
  agua: { rotulo: 'Economia de água', pontos: 8 },
  energia: { rotulo: 'Economia de energia', pontos: 8 },
  plantio: { rotulo: 'Plantio', pontos: 15 },
  reutilizacao: { rotulo: 'Reutilização', pontos: 6 },
  educacao: { rotulo: 'Conscientização', pontos: 5 },
};

const INICIAL = {
  usuarios: [],
  acoes: [],
  campanhas: [
    { id: 'c1', nome: 'Desafio da Reciclagem', descricao: 'Separar e descartar corretamente o lixo da escola.', meta: 300 },
    { id: 'c2', nome: 'Mês da Água', descricao: 'Reduzir o desperdício de água em casa e na escola.', meta: 200 },
    { id: 'c3', nome: 'Horta Escolar', descricao: 'Plantar e cuidar da horta do pátio.', meta: 150 },
  ],
};

function ler() {
  try {
    const d = JSON.parse(localStorage.getItem(CHAVE));
    if (d) return d;
  } catch {} // storage bloqueado ou corrompido: recomeça do inicial
  return structuredClone(INICIAL);
}

function gravar(d) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(d));
  } catch {
    throw new Error('Não foi possível salvar neste navegador');
  }
}

function texto(v, campo, max) {
  const t = typeof v === 'string' ? v.trim() : '';
  if (!t) throw new Error(`${campo} é obrigatório`);
  if (t.length > max) throw new Error(`${campo} deve ter até ${max} caracteres`);
  return t;
}

const soma = (acoes) => acoes.reduce((s, a) => s + a.pontos, 0);

export const local = {
  async usuarios() {
    return ler().usuarios;
  },

  async criarUsuario({ nome, turma }) {
    const d = ler();
    const u = { id: crypto.randomUUID(), nome: texto(nome, 'Nome', 60), turma: texto(turma, 'Turma', 20).toUpperCase(), criadoEm: new Date().toISOString() };
    if (d.usuarios.some((x) => x.nome.toLowerCase() === u.nome.toLowerCase() && x.turma === u.turma)) {
      throw new Error('Esse aluno já está cadastrado nessa turma');
    }
    d.usuarios.push(u);
    gravar(d);
    return u;
  },

  async tipos() {
    return TIPOS;
  },

  async acoes() {
    return ler().acoes.toReversed();
  },

  async criarAcao({ usuarioId, tipo, quantidade, campanhaId }) {
    const d = ler();
    if (!d.usuarios.some((u) => u.id === usuarioId)) throw new Error('Aluno não encontrado');
    const t = TIPOS[tipo];
    if (!t) throw new Error('Tipo de ação inválido');
    const qtd = Number(quantidade ?? 1);
    if (!Number.isInteger(qtd) || qtd < 1 || qtd > 20) throw new Error('Quantidade deve ser de 1 a 20');
    if (campanhaId && !d.campanhas.some((c) => c.id === campanhaId)) throw new Error('Campanha não encontrada');
    const a = { id: crypto.randomUUID(), usuarioId, tipo, quantidade: qtd, campanhaId: campanhaId || null, pontos: t.pontos * qtd, criadaEm: new Date().toISOString() };
    d.acoes.push(a);
    gravar(d);
    return a;
  },

  async campanhas() {
    const { campanhas, acoes } = ler();
    return campanhas.map((c) => {
      const feitas = acoes.filter((a) => a.campanhaId === c.id);
      return { ...c, pontos: soma(feitas), participantes: new Set(feitas.map((a) => a.usuarioId)).size };
    });
  },

  async criarCampanha({ nome, descricao, meta }) {
    const m = Number(meta);
    if (!Number.isInteger(m) || m < 10 || m > 100000) throw new Error('Meta deve ser de 10 a 100000 pontos');
    const d = ler();
    const c = { id: crypto.randomUUID(), nome: texto(nome, 'Nome', 60), descricao: texto(descricao, 'Descrição', 140), meta: m };
    d.campanhas.push(c);
    gravar(d);
    return c;
  },

  async ranking() {
    const { usuarios, acoes } = ler();
    const alunos = usuarios
      .map((u) => {
        const minhas = acoes.filter((a) => a.usuarioId === u.id);
        return { id: u.id, nome: u.nome, turma: u.turma, acoes: minhas.length, pontos: soma(minhas) };
      })
      .sort((a, b) => b.pontos - a.pontos || a.nome.localeCompare(b.nome));
    const porTurma = {};
    for (const a of alunos) {
      porTurma[a.turma] ??= { turma: a.turma, alunos: 0, pontos: 0 };
      porTurma[a.turma].alunos++;
      porTurma[a.turma].pontos += a.pontos;
    }
    return {
      alunos,
      turmas: Object.values(porTurma).sort((a, b) => b.pontos - a.pontos),
      resumo: { alunos: alunos.length, acoes: acoes.length, pontos: soma(acoes) },
    };
  },
};
