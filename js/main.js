// main.js

import {
    carregarPrecos,
    carregarMoedas
} from './precos.js';

import {
    listarFavoritos,
    salvarFavorito,
    removerFavorito
} from './favoritos.js';

import {
    mostrarFavoritos,
    topBar
} from './ui.js';


const page = window.location.pathname;

let carregando = false;


// ==========================
// ATUALIZA HOME
// ==========================

async function atualizar() {

    if (carregando) return;

    carregando = true;

    try {

        // favoritos salvos
        const favoritos = await listarFavoritos();

        // topo preços
        await carregarPrecos();

        // moedas home
        await carregarMoedas(favoritos);

    } catch (erro) {

        console.error("Erro na atualização:", erro);

    }

    carregando = false;
}


// ==========================
// INICIALIZAÇÃO
// ==========================

document.addEventListener("DOMContentLoaded", async () => {

    // HOME
    if (
        page.includes("index.html") ||
        page === "/" ||
        page === ""
    ) {

        await atualizar();

        // atualiza automaticamente
        setInterval(async () => {

            if (document.visibilityState === "visible") {

                await atualizar();

            }

        }, 180000);


    }

    // FAVORITOS
    if (page.includes("favoritos.html")) {

        const favoritos = await listarFavoritos();

        mostrarFavoritos(favoritos);

    }

    topBar()

});


// ==========================
// EVENTO GLOBAL FAVORITOS (Versão Super Blindada)
// ==========================

document.addEventListener("click", async (e) => {
    console.log()
    const botao = e.target.closest(".btn-add");

    if (!botao) return;

    try {
        const coin = JSON.parse(botao.dataset.coin);
        const favoritos = await listarFavoritos();

        // CAPTURA BLINDADA DO ID: Prioriza coinId para não confundir com o id numérico do json-server
        const idOriginal = coin.coinId || coin.id || coin.symbol;

        if (!idOriginal) {
            console.error("Não foi possível encontrar um identificador único para esta moeda no dataset:", coin);
            return;
        }

        const idCripto = String(idOriginal).toLowerCase().trim();

        // Buscamos se já existe no banco usando o nosso campo customizado 'coinId'
        const favoritoEncontrado = favoritos.find(f => f.coinId === idCripto);


        // REMOVE
        if (favoritoEncontrado) {
            await removerFavorito(favoritoEncontrado.id);
        }
        // ADICIONA
        else {
            const moedaParaSalvar = {
                coinId: idCripto, // Garante que será salvo com o identificador limpo no banco
                name: coin.name || "Não informado",
                symbol: (coin.symbol || idCripto).toLowerCase(),
                image: coin.image || "",
                current_price: coin.current_price || 0,
                price_change_percentage_24h: coin.price_change_percentage_24h ?? null
            };
            await salvarFavorito(moedaParaSalvar);
        }

        // 🔄 Atualiza HOME
        if (page.includes("index.html") || page === "/" || page === "") {
            await atualizar();
        }

        // 🔄 Atualiza FAVORITOS
        if (page.includes("favoritos.html")) {
            const favoritosAtualizados = await listarFavoritos();
            mostrarFavoritos(favoritosAtualizados);
        }

    } catch (erro) {
        console.error("Erro ao favoritar:", erro);
    }
});