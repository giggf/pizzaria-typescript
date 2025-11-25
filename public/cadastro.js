document.addEventListener('DOMContentLoaded', function() {
  // Elementos que podem ou não existir
  const form = document.getElementById('cadastro-form'); 
  
  // Elementos que sempre existem nesta página
  const clientListDiv = document.getElementById('client-list');
  const searchInput = document.getElementById('search-client-input');
  let searchTimer;

  // --- FUNÇÃO DE CADASTRO (só será configurada se o formulário existir) ---
  // Verificamos se a variável 'form' realmente encontrou um elemento
  if (form) {
    const statusMessage = document.getElementById('status-message'); // Este elemento só existe junto com o form

    form.addEventListener('submit', async function(event) {
      event.preventDefault();

      const nome = document.getElementById('nome').value;
      const telefone = document.getElementById('telefone').value;
      const endereco = document.getElementById('endereco').value;
      const clienteData = { nome, telefone, endereco };

      statusMessage.textContent = 'Enviando...';
      statusMessage.className = 'status-message';

      try {
        const response = await fetch('/api/clientes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(clienteData),
        });

        if (!response.ok) {
          throw new Error('Erro ao cadastrar. Verifique os dados.');
        }
        const data = await response.json();
        
        statusMessage.textContent = `Cliente "${data.nome}" cadastrado com sucesso!`;
        statusMessage.classList.add('success');
        form.reset();
        loadClients(); // Recarrega a lista de clientes
      } catch(error) {
        statusMessage.textContent = error.message;
        statusMessage.classList.add('error');
      }
    });
  }
  
  // --- FUNÇÕES DE GERENCIAMENTO (Esta parte funcionará normalmente) ---
  async function loadClients(searchTerm = '') {
    let url = '/api/clientes';
    if(searchTerm){
      url = `/api/clientes/search?termo=${encodeURIComponent(searchTerm)}`;
    }
    
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Falha ao buscar clientes.');
      const clientes = await response.json();

      if (clientes.length === 0) {
        clientListDiv.innerHTML = '<p>Nenhum cliente encontrado.</p>';
        return;
      }

      const ul = document.createElement('ul');
      clientes.forEach(cliente => {
        const li = document.createElement('li');
        li.innerHTML = `
          <span>${cliente.nome} (${cliente.telefone})</span>
          <button class="delete-client-btn" data-id="${cliente.id}">Excluir</button>
        `;
        ul.appendChild(li);
      });
      clientListDiv.innerHTML = '';
      clientListDiv.appendChild(ul);
    } catch (error) {
      clientListDiv.innerHTML = `<p style="color: red;">${error.message}</p>`;
    }
  }

  // --- EVENT LISTENERS (Estes também funcionarão normalmente) ---
  clientListDiv.addEventListener('click', async function(event) {
    if (event.target.classList.contains('delete-client-btn')) {
      const id = event.target.dataset.id;
      if (confirm('Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.')) {
        try {
          const response = await fetch(`/api/clientes/${id}`, { method: 'DELETE' });
          const result = await response.json();

          if (!response.ok) throw new Error(result.erro || 'Falha ao excluir');
          
          alert(result.mensagem);
          loadClients(searchInput.value.trim()); // Recarrega a lista
        } catch (error) {
          alert(`Erro: ${error.message}`);
        }
      }
    }
  });

  searchInput.addEventListener('keyup', (event) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      loadClients(event.target.value.trim());
    }, 400);
  });

  // Carrega os clientes ao iniciar a página
  loadClients();
});