// Controller: liga navegação e formulários ao model e à view.
import { model } from './model.js';
import { view } from './view.js';

const carregadores = {
  visao: async () => {
    const [ranking, acoes, usuarios, tipos] = await Promise.all([model.ranking(), model.acoes(), model.usuarios(), model.tipos()]);
    return { ranking, acoes, usuarios, tipos };
  },
  alunos: async () => ({ usuarios: await model.usuarios() }),
  acoes: async () => {
    const [usuarios, tipos, campanhas, acoes] = await Promise.all([model.usuarios(), model.tipos(), model.campanhas(), model.acoes()]);
    return { usuarios, tipos, campanhas, acoes };
  },
  campanhas: async () => ({ campanhas: await model.campanhas() }),
  ranking: async () => ({ ranking: await model.ranking() }),
};

async function abrir() {
  const rota = location.hash.replace('#/', '');
  const tela = carregadores[rota] ? rota : 'visao';
  try {
    view.render(tela, await carregadores[tela]());
  } catch (e) {
    view.toast(e.message, true);
  }
}

const envios = {
  aluno: (d) => model.criarUsuario(d),
  acao: (d) => model.criarAcao(d),
  campanha: (d) => model.criarCampanha(d),
};
const mensagens = { aluno: 'Aluno cadastrado', acao: 'Ação registrada', campanha: 'Campanha criada' };

document.addEventListener('submit', async (e) => {
  const tipo = e.target.dataset.form;
  if (!tipo) return;
  e.preventDefault();
  try {
    await envios[tipo](Object.fromEntries(new FormData(e.target)));
    view.toast(mensagens[tipo]);
    await abrir();
  } catch (err) {
    view.toast(err.message, true);
  }
});

// Mantém aria-invalid em sincronia com :user-invalid (leitores de tela)
function sincronizarAria({ target: el }) {
  if (!el.matches?.('input, select')) return;
  try {
    el.setAttribute('aria-invalid', el.matches(':user-invalid'));
  } catch {} // navegador sem :user-invalid: não marca nada
}
document.addEventListener('focusout', sincronizarAria);
document.addEventListener('invalid', sincronizarAria, true);

window.addEventListener('hashchange', abrir);
abrir();
