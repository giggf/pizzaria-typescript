document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('produto-form');
  const statusMessage = document.getElementById('status-message');

  form.addEventListener('submit', function(event) {
    event.preventDefault();

    const nome = document.getElementById('nome').value;
    const descricao = document.getElementById('descricao').value;
    // Precisamos converter o preço de texto para número
    const preco = parseFloat(document.getElementById('preco').value);
    const categoria = document.getElementById('categoria').value;

    const produtoData = { nome, descricao, preco, categoria };

    statusMessage.textContent = 'Enviando...';
    statusMessage.className = 'status-message';

    fetch('/api/produtos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(produtoData),
    })
    .then(response => {
      if (!response.ok) {
        // Se o servidor retornar um erro, tentamos extrair a mensagem
        return response.json().then(err => { throw new Error(err.erro || 'Erro no servidor') });
      }
      return response.json();
    })
    .then(data => {
      statusMessage.textContent = `Produto "${data.nome}" cadastrado com sucesso!`;
      statusMessage.classList.add('success');
      form.reset();
    })
    .catch(error => {
      statusMessage.textContent = error.message;
      statusMessage.classList.add('error');
    });
  });
});