// Model: acesso à API. Não conhece o DOM.
async function pedir(url, opcoes) {
  const r = await fetch(url, opcoes);
  const dados = await r.json();
  if (!r.ok) throw new Error(dados.erro || 'Erro inesperado');
  return dados;
}

const enviar = (url, corpo) =>
  pedir(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpo) });

export const model = {
  usuarios: () => pedir('/api/usuarios'),
  criarUsuario: (d) => enviar('/api/usuarios', d),
  tipos: () => pedir('/api/tipos'),
  acoes: () => pedir('/api/acoes'),
  criarAcao: (d) => enviar('/api/acoes', d),
  campanhas: () => pedir('/api/campanhas'),
  criarCampanha: (d) => enviar('/api/campanhas', d),
  ranking: () => pedir('/api/ranking'),
};
