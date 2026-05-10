// favoritos.js

const URL = 'http://localhost:3000/favoritos';

// 🔹 LISTAR FAVORITOS
export async function listarFavoritos() {
  try {
    const res = await fetch(URL);
    return await res.json();
  } catch (erro) {
    console.error('Erro ao listar favoritos:', erro);
    return [];
  }
}


// 🔹 SALVAR FAVORITO (COM VALIDAÇÃO)
export async function salvarFavorito(moeda) {
  try {
    // 🔸 busca favoritos atuais
    const favoritos = await listarFavoritos();

    // 🔸 verifica duplicado pelo id
    const existe = favoritos.some(f => f.id === moeda.id);

    if (existe) {
      console.log('Já está nos favoritos');
      return;
    }

    // 🔸 salva no JSON Server
    const res = await fetch(URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(moeda)
    });

    const data = await res.json();
    console.log('Salvo:', data);

  } catch (erro) {
    console.error('Erro ao salvar favorito:', erro);
  }
}