// Model: acesso à API. Não conhece o DOM.
import { local } from './local.js';

async function pedir(url, opcoes) {
  const r = await fetch(url, opcoes);
  const dados = await r.json();
  if (!r.ok) throw new Error(dados.erro || 'Erro inesperado');
  return dados;
}

const enviar = (url, corpo) =>
  pedir(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpo) });

const api = {
  usuarios: () => pedir('/api/usuarios'),
  criarUsuario: (d) => enviar('/api/usuarios', d),
  tipos: () => pedir('/api/tipos'),
  acoes: () => pedir('/api/acoes'),
  criarAcao: (d) => enviar('/api/acoes', d),
  campanhas: () => pedir('/api/campanhas'),
  criarCampanha: (d) => enviar('/api/campanhas', d),
  ranking: () => pedir('/api/ranking'),
};

// Sem servidor (ex.: GitHub Pages) cai para o backend simulado no navegador.
let fonte;
const escolher = () =>
  (fonte ??= fetch('/api/tipos')
    .then((r) => (r.ok && r.headers.get('content-type')?.includes('json') ? api : local))
    .catch(() => local));

export const model = Object.fromEntries(Object.keys(api).map((k) => [k, async (...args) => (await escolher())[k](...args)]));
