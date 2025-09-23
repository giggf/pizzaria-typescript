document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('cadastro-form');
  const statusMessage = document.getElementById('status-message');

  form.addEventListener('submit', function(event) {
    event.preventDefault(); // Impede o recarregamento da página

    const nome = document.getElementById('nome').value;
    const telefone = document.getElementById('telefone').value;
    const endereco = document.getElementById('endereco').value;

    const clienteData = { nome, telefone, endereco };

    statusMessage.textContent = 'Enviando...';
    statusMessage.className = 'status-message';

    fetch('/api/clientes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clienteData),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro ao cadastrar. Verifique os dados.');
      }
      return response.json();
    })
    .then(data => {
      statusMessage.textContent = `Cliente "${data.nome}" cadastrado com sucesso!`;
      statusMessage.classList.add('success');
      form.reset(); // Limpa o formulário
    })
    .catch(error => {
      statusMessage.textContent = error.message;
      statusMessage.classList.add('error');
    });
  });
});