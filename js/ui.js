// ui.js


// ==========================
// CRIA CARD
// ==========================

function criarCard(moeda, favoritos = []) {

  // verifica se já está favoritado usando coinId (campo salvo no banco)
  const idMoeda = String(moeda.id || moeda.coinId || moeda.symbol).toLowerCase().trim();
  const isFavorito =
    favoritos.some(f => f.coinId === idMoeda);

  return `
    <div class="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2">

      <div class="card crypto-card p-3 h-100 d-flex flex-column">

        <!-- TOPO -->
        <div class="d-flex align-items-center justify-content-between mb-2">

          <div class="d-flex align-items-center gap-2">

            <img 
              src="${moeda.image}" 
              alt="${moeda.name}" 
              class="crypto-img"
            >

            <div>

              <h6 class="mb-0 fw-semibold">
                ${moeda.name}
              </h6>

              <small class="text-muted">
                ${moeda.symbol.toUpperCase()}
              </small>

            </div>

          </div>

          <!-- ESTRELA -->
          <i class="
            bi bi-star-fill estrela
            ${isFavorito ? 'ativa' : ''}
          "></i>

        </div>

        <!-- VARIAÇÃO -->
        <p class="
          crypto-change
          mb-1
          ${(moeda.price_change_percentage_24h ?? 0) < 0
      ? 'text-danger'
      : 'text-success'}
        ">

          ${moeda.price_change_percentage_24h != null
      ? moeda.price_change_percentage_24h.toFixed(2) + '%'
      : 'N/A'}

        </p>

        <!-- PREÇO -->
        <h5 class="crypto-price mb-3">

          US$ ${moeda.current_price.toLocaleString()}

        </h5>

        <!-- BOTÃO -->
        <div class="mt-auto">

          <button
            class="
              btn
              ${isFavorito
      ? 'btn-danger'
      : 'btn-primary'}
              btn-sm
              w-100
              btn-add
            "

            data-coin="${JSON.stringify(moeda).replace(/"/g, '&quot;')}"
          >

            ${isFavorito
      ? 'Remover'
      : 'Adicionar'}

          </button>

        </div>

      </div>

    </div>
  `;
}


// ==========================
// MOSTRAR MOEDAS (HOME)
// ==========================

export function mostrarMoedas(
  moedas,
  favoritos = []
) {

  const container =
    document.getElementById("listaCards");

  if (!container) return;

  let html = '';

  moedas.forEach(moeda => {

    html += criarCard(
      moeda,
      favoritos
    );

  });

  container.innerHTML = html;

}


// ==========================
// MOSTRAR FAVORITOS
// ==========================

export function mostrarFavoritos(
  favoritos = []
) {

  const container =
    document.getElementById("listaCards");

  if (!container) return;

  // atualiza badge
  const badge = document.querySelector(".badge");
  if (badge) badge.textContent = favoritos.length;

  // vazio
  if (favoritos.length === 0) {

    container.innerHTML = `
      <div class="col-12">

        <p class="text-muted">
          Nenhum favorito ainda.
        </p>

      </div>
    `;

    return;

  }

  let html = '';

  favoritos.forEach(moeda => {

    html += criarCard(
      moeda,
      favoritos
    );

  });

  container.innerHTML = html;

}