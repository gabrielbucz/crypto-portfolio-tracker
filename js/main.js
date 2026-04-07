$(document).ready(function () {
    const cryptos = [
        { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC' },
        { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' },
        { id: 'solana', name: 'Solana', symbol: 'SOL' },
        { id: 'binancecoin', name: 'Binance Coin', symbol: 'BNB' },
        { id: 'tron', name: 'TRON', symbol: 'TRX' },
        { id: 'ripple', name: 'Ripple', symbol: 'XRP' }
    ];

    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    function saveFavorites() {
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }

    function addFavorite(id) {
        if (!favorites.includes(id)) {
            favorites.push(id);
            saveFavorites();
        }
    }

    function removeFavorite(id) {
        favorites = favorites.filter(f => f !== id);
        saveFavorites();
    }

    async function fetchPrices(ids) {
        try {
            const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(',')}&vs_currencies=usd&include_24hr_change=true`);
            return await response.json();
        } catch (e) {
            console.error('API error:', e);
            return {};
        }
    }

    function getCrypto(id) {
        return cryptos.find(c => c.id === id);
    }

    function toggleStar($star, cryptoId) {
        const isFavorited = favorites.includes(cryptoId);
        $star.toggleClass('bi-star bi-star-fill text-warning');
        if (isFavorited) {
            removeFavorite(cryptoId);
        } else {
            addFavorite(cryptoId);
        }
    }

    function renderFavorites(prices) {
        const $grid = $('.favoritos-grid');
        if ($grid.length === 0) return;
        $grid.empty();
        const badge = favorites.length || 0;
        $('.badge').text(badge);

        favorites.forEach(id => {
            const crypto = getCrypto(id);
            if (!crypto) return;
            const data = prices[id] || { usd: 0, usd_24h_change: 0 };
            const change = data.usd_24h_change || 0;
            const changeClass = change >= 0 ? 'text-success' : 'text-danger';
            const changeSign = change >= 0 ? '+' : '';

            const cardHtml = `
        <div class="col-12 col-sm-6 col-md-4 col-lg-2">
          <div class="card p-3 shadow-sm">
            <div class="d-flex justify-content-between align-items-center">
              <h5 class="mb-0">${crypto.name}</h5>
              <i class="bi bi-star-fill text-warning star-icon" data-id="${id}"></i>
            </div>
            <h6 class="text-secondary">${crypto.symbol}</h6>
            <p class="${changeClass}">${changeSign}${change.toFixed(2)}%</p>
            <h4>US$ ${data.usd ? data.usd.toLocaleString() : 'N/A'}</h4>
            <div class="d-flex justify-content-end">
              <button class="btn btn-primary btn-sm px-3 remove-btn" data-id="${id}">Remover</button>
            </div>
          </div>
        </div>
      `;
            $grid.append(cardHtml);
        });

        // Bind new events
        $('.star-icon').click(function () {
            const id = $(this).data('id');
            toggleStar($(this), id);
            // Re-fetch/render to update prices if needed
            initFavorites();
        });
        $('.remove-btn').click(function () {
            const id = $(this).data('id');
            removeFavorite(id);
            initFavorites();
        });
    }

    async function initFavorites() {
        if ($('.favoritos-grid').length > 0) {
            const prices = await fetchPrices(favorites);
            renderFavorites(prices);
        }
    }

    // Original star toggle for index.html (extend)
    $('.bi-star').not('.star-icon').click(function () {
        const $this = $(this);
        const cryptoName = $this.siblings('h5').text().toLowerCase();
        const crypto = cryptos.find(c => c.name.toLowerCase().includes(cryptoName));
        if (crypto) {
            toggleStar($this, crypto.id);
        }
    });

    // Adicionar buttons on index
    $('.btn-primary').filter(function () { return $(this).text().trim() === 'Adicionar'; }).click(function () {
        const cryptoName = $(this).closest('.card').find('h5').text().toLowerCase();
        const crypto = cryptos.find(c => c.name.toLowerCase().includes(cryptoName));
        if (crypto) {
            addFavorite(crypto.id);
            $(this).text('Adicionado!').prop('disabled', true);
        }
    });

    // Init
    initFavorites();
});
