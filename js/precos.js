// precos.js

import { mostrarMoedas } from './ui.js';


// 🔹 CARREGAR PREÇOS (TOPO)
export async function carregarPrecos() {
    const container = document.getElementById("prices");

    if (!container) return;

    try {
        const url =
            "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,cardano,chainlink&vs_currencies=usd";

        const res = await fetch(url);
        const data = await res.json();

        container.innerHTML = renderPrecos(data);

    } catch (error) {
        console.error("Erro ao buscar preços:", error);

        container.innerHTML = `
            <span class="text-danger">Erro ao carregar preços</span>
        `;
    }
}


// 🔹 RENDER PREÇOS
function renderPrecos(data) {
    return `
        <span class="coin">BTC: $${data.bitcoin?.usd ?? 'N/A'}</span>
        <span class="coin">ETH: $${data.ethereum?.usd ?? 'N/A'}</span>
        <span class="coin">SOL: $${data.solana?.usd ?? 'N/A'}</span>
        <span class="coin">ADA: $${data.cardano?.usd ?? 'N/A'}</span>
        <span class="coin">LINK: $${data.chainlink?.usd ?? 'N/A'}</span>
    `;
}


// 🔹 CARREGAR MOEDAS (COM FAVORITOS)
export async function carregarMoedas(favoritos = []) {
    try {
        const res = await fetch(
            "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&per_page=12"
        );

        const dados = await res.json();

        // 👇 ESSENCIAL: passa favoritos pra UI
        mostrarMoedas(dados, favoritos);

    } catch (erro) {
        console.error("Erro ao carregar moedas:", erro);
    }
}