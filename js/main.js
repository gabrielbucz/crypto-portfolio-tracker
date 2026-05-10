// main.js

import { carregarPrecos, carregarMoedas } from './precos.js';
import { listarFavoritos, salvarFavorito } from './favoritos.js';
import { mostrarFavoritos } from './ui.js';

const page = window.location.pathname;

let carregando = false;

// 🔹 ATUALIZA HOME
async function atualizar() {
    if (carregando) return;

    carregando = true;

    try {
        const favoritos = await listarFavoritos();

        await carregarPrecos();
        await carregarMoedas(favoritos); // 👈 sincroniza com favoritos

    } catch (erro) {
        console.error("Erro na atualização:", erro);
    }

    carregando = false;
}


// 🚀 INICIALIZAÇÃO
document.addEventListener("DOMContentLoaded", () => {

    // HOME
    if (page.includes("index.html") || page === "/" || page === "") {
        atualizar();

        setInterval(() => {
            if (document.visibilityState === "visible") {
                atualizar();
            }
        }, 180000);
    }

    // FAVORITOS
    if (page.includes("favoritos.html")) {
        (async () => {
            const favoritos = await listarFavoritos();
            mostrarFavoritos(favoritos);
        })();
    }

});


// 🎯 EVENTO GLOBAL (FAVORITAR)
document.addEventListener("click", (e) => {
    const botao = e.target.closest(".btn-add");

    if (botao) {
        const coin = JSON.parse(botao.dataset.coin);
        salvarFavorito(coin);
    }
});