const URL = 'http://localhost:3000/favoritos';

// ==========================
// LISTAR FAVORITOS
// ==========================
export async function listarFavoritos() {
  try {
    const res = await fetch(URL);
    return await res.json();
  } catch (erro) {
    console.error('Erro ao listar favoritos:', erro);
    return [];
  }
}

// ==========================
// SALVAR FAVORITO
// ==========================
export async function salvarFavorito(moedaParaSalvar) {
  try {
    const res = await fetch(URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(moedaParaSalvar) // O main.js já entrega o objeto perfeito
    });

    if (!res.ok) throw new Error('Erro ao salvar favorito');
    return await res.json();
  } catch (erro) {
    console.error('Erro ao salvar favorito:', erro);
  }
}

// ==========================
// REMOVER FAVORITO
// ==========================
export async function removerFavorito(idBanco) {
  try {
    const res = await fetch(`${URL}/${idBanco}`, { // Remove diretamente usando o ID do banco
      method: 'DELETE'
    });

    if (!res.ok) throw new Error('Erro ao remover favorito');
  } catch (erro) {
    console.error('Erro ao remover favorito:', erro);
  }
}