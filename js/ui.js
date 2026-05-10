// ui.js

// 🔹 CRIA O CARD (COM FAVORITOS)
function criarCard(m, favoritos = []) {
  const isFavorito = favoritos.some(f => f.id === m.id);

  return `
    <div class="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2">
      <div class="card crypto-card p-3 h-100 d-flex flex-column">

        <!-- TOPO -->
        <div class="d-flex align-items-center justify-content-between mb-2">
          
          <div class="d-flex align-items-center gap-2">
            <img src="${m.image}" alt="${m.name}" class="crypto-img">
            
            <div>
              <h6 class="mb-0 fw-semibold">${m.name}</h6>
              <small class="text-muted">${m.symbol.toUpperCase()}</small>
            </div>
          </div>

          <i class="bi bi-star estrela ${isFavorito ? 'ativa' : ''}"></i>

        </div>

        <!-- VARIAÇÃO -->
        <p class="crypto-change mb-1 ${m.price_change_percentage_24h < 0 ? 'text-danger' : 'text-success'
    }">
          ${m.price_change_percentage_24h.toFixed(2)}%
        </p>

        <!-- PREÇO -->
        <h5 class="crypto-price mb-3">
          US$ ${m.current_price.toLocaleString()}
        </h5>

        <!-- BOTÃO -->
        <div class="mt-auto">
          <button 
            class="btn btn-primary btn-sm w-100 btn-add"
            data-coin='${JSON.stringify(m)}'
          >
            Adicionar
          </button>
        </div>

      </div>
    </div>
  `;
}


// 🔹 MOSTRAR MOEDAS (HOME)
export function mostrarMoedas(moedas, favoritos = []) {
  const container = document.getElementById("listaCards");

  if (!container) return;

  container.innerHTML = "";

  moedas.forEach(m => {
    container.innerHTML += criarCard(m, favoritos);
  });
}


// 🔹 MOSTRAR FAVORITOS
export function mostrarFavoritos(moedas) {
  const container = document.getElementById("listaCards");

  if (!container) return;

  if (!moedas || moedas.length === 0) {
    container.innerHTML = "<p>Nenhum favorito ainda</p>";
    return;
  }

  container.innerHTML = "";

  moedas.forEach(m => {
    container.innerHTML += criarCard(m, moedas);
  });
}