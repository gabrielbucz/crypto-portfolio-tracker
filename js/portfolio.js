// portfolio.js

import { moedasCache } from './precos.js';

const URL_TRANSACOES = 'http://localhost:3000/transacoes';
const URL_MERCADO = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&per_page=12';

let moedasMercado = [];


// ==========================
// CARREGAR MOEDAS NO SELECT
// ==========================

async function carregarMoedasSelect() {
  const select = document.getElementById('select-moeda');
  if (!select) return;

  try {
    // reutiliza cache da home se disponível, senão busca direto
    if (moedasCache.length > 0) {
      moedasMercado = moedasCache;
    } else {
      const res = await fetch(URL_MERCADO);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      moedasMercado = await res.json();
    }

    select.innerHTML = moedasMercado.map(m => `
      <option value="${m.id}">${m.symbol.toUpperCase()} — ${m.name}</option>
    `).join('');
    // ID 20 — evento via jQuery no select
    $('#select-moeda').on('change', function () {
      const moeda = moedasMercado.find(m => m.id === $(this).val());
      if (moeda) {
        $('#input-preco').attr(
          'placeholder',
          `Atual: $${moeda.current_price.toLocaleString()}`
        );
        // atualiza placeholder de quantidade com o símbolo da moeda
        $('#input-quantidade').attr(
          'placeholder',
          `Qtd. de ${moeda.symbol.toUpperCase()}`
        );
      }
    });

    select.dispatchEvent(new Event('change'));

  } catch (erro) {
    console.error('Erro ao carregar moedas:', erro);
    select.innerHTML = '<option value="">Erro ao carregar moedas</option>';
  }
}


// ==========================
// CRUD TRANSAÇÕES
// ==========================

async function listarTransacoes() {
  try {
    const res = await fetch(URL_TRANSACOES);
    return await res.json();
  } catch (erro) {
    console.error('Erro ao listar transações:', erro);
    return [];
  }
}

async function salvarTransacao(transacao) {
  try {
    const res = await fetch(URL_TRANSACOES, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transacao)
    });
    if (!res.ok) throw new Error('Erro ao salvar');
    return await res.json();
  } catch (erro) {
    console.error('Erro ao salvar transação:', erro);
  }
}

async function removerTransacao(id) {
  try {
    const res = await fetch(`${URL_TRANSACOES}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Erro ao remover');
  } catch (erro) {
    console.error('Erro ao remover transação:', erro);
  }
}


// ==========================
// CALCULAR RESUMO
// ==========================

function calcularResumo(transacoes) {
  const grupos = {};

  transacoes.forEach(t => {
    if (!grupos[t.coinId]) {
      grupos[t.coinId] = {
        coinId: t.coinId,
        name: t.name,
        symbol: t.symbol,
        image: t.image,
        totalQtd: 0,
        totalGasto: 0,
      };
    }
    // compra soma, venda subtrai
    const qtd = Number(t.quantidade);
    const gasto = qtd * Number(t.preco);
    if (t.tipo === 'venda') {
      grupos[t.coinId].totalQtd -= qtd;
      grupos[t.coinId].totalGasto -= gasto;
    } else {
      grupos[t.coinId].totalQtd += qtd;
      grupos[t.coinId].totalGasto += gasto;
    }
  });

  let valorTotal = 0;
  let lucroTotal = 0;

  const linhas = Object.values(grupos).map(g => {
    const moedaAtual = moedasMercado.find(m => m.id === g.coinId);
    const precoAtual = moedaAtual?.current_price ?? 0;
    const change24h = moedaAtual?.price_change_percentage_24h ?? 0;

    const precoMedio = g.totalQtd > 0 ? g.totalGasto / g.totalQtd : 0;
    const valorAtual = g.totalQtd * precoAtual;
    const lucro = valorAtual - g.totalGasto;
    const lucroPct = g.totalGasto > 0 ? (lucro / g.totalGasto) * 100 : 0;
    const lucro24h = valorAtual * (change24h / 100);

    valorTotal += valorAtual;
    lucroTotal += lucro24h;

    return { ...g, precoMedio, valorAtual, lucro, lucroPct };
  });

  return { linhas, valorTotal, lucroTotal, moedasAtivas: linhas.length };
}


// ==========================
// RENDERIZAR RESUMO
// ==========================

function renderizarResumo({ valorTotal, lucroTotal, moedasAtivas }) {
  const elValor = document.getElementById('resumo-valor');
  const elLucro = document.getElementById('resumo-lucro');
  const elMoedas = document.getElementById('resumo-moedas');

  if (elValor) elValor.textContent =
    `$ ${valorTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  if (elLucro) {
    const sinal = lucroTotal >= 0 ? '+' : '';
    elLucro.textContent =
      `${sinal}$ ${Math.abs(lucroTotal).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    elLucro.className = `fw-bold mb-0 ${lucroTotal >= 0 ? 'text-success' : 'text-danger'}`;
  }

  if (elMoedas) elMoedas.textContent = moedasAtivas;
}


// ==========================
// RENDERIZAR TABELA (md+)
// ==========================

function renderizarTabela(linhas, transacoes) {
  const tbody = document.getElementById('tbody-portfolio');
  if (!tbody) return;

  if (linhas.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-muted py-4">Nenhuma transação registrada ainda.</td>
      </tr>`;
    return;
  }

  tbody.innerHTML = linhas.map(l => {
    const lucroClass = l.lucro >= 0 ? 'success' : 'danger';
    const lucroSinal = l.lucro >= 0 ? '+' : '';
    return `
      <tr>
        <td>
          <div class="d-flex align-items-center gap-2">
            <img src="${l.image}" width="24" alt="${l.name}">
            <div>
              <span class="fw-bold d-block">${l.name}</span>
              <small class="text-muted">${l.symbol.toUpperCase()}</small>
            </div>
          </div>
        </td>
        <td class="text-end fw-medium">
          ${l.totalQtd.toLocaleString('pt-BR', { maximumFractionDigits: 8 })} ${l.symbol.toUpperCase()}
        </td>
        <td class="text-end">$ ${l.precoMedio.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td class="text-end fw-bold">$ ${l.valorAtual.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td class="text-center">
          <span class="badge rounded-pill bg-${lucroClass}-subtle text-${lucroClass} px-3">
            ${lucroSinal}${l.lucroPct.toFixed(2)}%
          </span>
          <div class="small text-${lucroClass} mt-1">
            ${lucroSinal}$ ${Math.abs(l.lucro).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </td>
        <td class="text-center">
          <button class="btn btn-outline-danger btn-sm btn-remover-tabela" data-coin="${l.coinId}">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>`;
  }).join('');

  tbody.querySelectorAll('.btn-remover-tabela').forEach(btn => {
    btn.addEventListener('click', async () => {
      const paraRemover = transacoes.filter(t => t.coinId === btn.dataset.coin);
      await Promise.all(paraRemover.map(t => removerTransacao(t.id)));
      await renderizarPortfolio();
    });
  });
}


// ==========================
// RENDERIZAR CARDS MOBILE
// ==========================

function renderizarCardsMobile(linhas, transacoes) {
  const mobile = document.getElementById('cards-portfolio-mobile');
  if (!mobile) return;

  if (linhas.length === 0) {
    mobile.innerHTML = `<p class="text-muted text-center py-4">Nenhuma transação registrada ainda.</p>`;
    return;
  }

  mobile.innerHTML = linhas.map(l => {
    const lucroClass = l.lucro >= 0 ? 'success' : 'danger';
    const lucroSinal = l.lucro >= 0 ? '+' : '';
    return `
      <div class="card crypto-card border-0 shadow-sm p-3 mb-3">
        <div class="d-flex align-items-center justify-content-between mb-3">
          <div class="d-flex align-items-center gap-2">
            <img src="${l.image}" width="32" alt="${l.name}">
            <div>
              <span class="fw-bold d-block">${l.name}</span>
              <small class="text-muted">${l.symbol.toUpperCase()}</small>
            </div>
          </div>
          <button class="btn btn-outline-danger btn-sm btn-remover-mobile" data-coin="${l.coinId}">
            <i class="bi bi-trash"></i>
          </button>
        </div>
        <div class="row g-2 text-center">
          <div class="col-6">
            <small class="text-muted d-block">QUANTIDADE</small>
            <span class="fw-medium small">
              ${l.totalQtd.toLocaleString('pt-BR', { maximumFractionDigits: 8 })} ${l.symbol.toUpperCase()}
            </span>
          </div>
          <div class="col-6">
            <small class="text-muted d-block">PREÇO MÉDIO</small>
            <span class="small">$ ${l.precoMedio.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div class="col-6">
            <small class="text-muted d-block">VALOR ATUAL</small>
            <span class="fw-bold small">$ ${l.valorAtual.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div class="col-6">
            <small class="text-muted d-block">LUCRO/PREJUÍZO</small>
            <span class="badge rounded-pill bg-${lucroClass}-subtle text-${lucroClass}">
              ${lucroSinal}${l.lucroPct.toFixed(2)}%
            </span>
            <div class="small text-${lucroClass}">
              ${lucroSinal}$ ${Math.abs(l.lucro).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>`;
  }).join('');

  mobile.querySelectorAll('.btn-remover-mobile').forEach(btn => {
    btn.addEventListener('click', async () => {
      const paraRemover = transacoes.filter(t => t.coinId === btn.dataset.coin);
      await Promise.all(paraRemover.map(t => removerTransacao(t.id)));
      await renderizarPortfolio();
    });
  });
}


// ==========================
// RENDERIZAR TUDO
// ==========================

async function renderizarPortfolio() {
  const transacoes = await listarTransacoes();
  const { linhas, valorTotal, lucroTotal, moedasAtivas } = calcularResumo(transacoes);
  renderizarResumo({ valorTotal, lucroTotal, moedasAtivas });
  renderizarTabela(linhas, transacoes);
  renderizarCardsMobile(linhas, transacoes);
}


// ==========================
// FORMULÁRIO
// ==========================

function iniciarFormulario() {
  const btn = document.getElementById('btn-adicionar');
  if (!btn) return;

  // ID 20 — hover no botão via jQuery
  $('#btn-adicionar')
    .on('mouseenter', function () {
      $(this).removeClass('btn-primary').addClass('btn-success');
    })
    .on('mouseleave', function () {
      $(this).removeClass('btn-success').addClass('btn-primary');
    });

  btn.addEventListener('click', async () => {
    const select = document.getElementById('select-moeda');
    const qtdInput = document.getElementById('input-quantidade');
    const precoInput = document.getElementById('input-preco');
    const dataInput = document.getElementById('input-data');

    // ID 13 — lê o radio de tipo (compra/venda)
    const tipoInput = document.querySelector('input[name="tipo"]:checked');
    const tipo = tipoInput ? tipoInput.value : 'compra';

    const coinId = select.value;
    const quantidade = parseFloat(qtdInput.value);
    const preco = parseFloat(
      precoInput.value.replace(/\./g, '').replace(',', '.')
    );
    const data = dataInput.value;

    if (!coinId || isNaN(quantidade) || quantidade <= 0 || isNaN(preco) || preco <= 0 || !data) {
      alert('Preencha todos os campos corretamente.');
      return;
    }

    const moeda = moedasMercado.find(m => m.id === coinId);

    await salvarTransacao({
      coinId,
      tipo,
      name: moeda.name,
      symbol: moeda.symbol,
      image: moeda.image,
      quantidade,
      preco,
      data
    });

    qtdInput.value = '';
    precoInput.value = '';
    dataInput.value = '';

    await renderizarPortfolio();
  });
}


// ==========================
// INICIALIZAR
// ==========================

document.addEventListener('DOMContentLoaded', async () => {
  await carregarMoedasSelect();
  await renderizarPortfolio();
  iniciarFormulario();
});