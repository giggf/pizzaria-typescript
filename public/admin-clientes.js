document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    if (!token) { window.location.href = '/login.html'; return; }

    const clientListDiv = document.getElementById('client-list');
    const searchInput = document.getElementById('search-client-input');
    let searchTimer;
    
    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('authToken');
        window.location.href = '/login.html';
    });

    async function loadClients(searchTerm = '') { /* ... sua função loadClients anterior ... */ }

    // NOVA FUNÇÃO RENDERCLIENTS PARA TABELA
    function renderClients(clientes) {
        if (clientes.length === 0) {
            clientListDiv.innerHTML = '<p>Nenhum cliente encontrado.</p>';
            return;
        }
        clientListDiv.innerHTML = `
            <table class="data-table">
                <thead><tr><th>Nome</th><th>Email</th><th>Telefone</th><th>Ações</th></tr></thead>
                <tbody>
                    ${clientes.map(cliente => `
                        <tr>
                            <td>${cliente.nome}</td>
                            <td>${cliente.email}</td>
                            <td>${cliente.telefone}</td>
                            <td><button class="btn-delete" data-id="${cliente.id}">Excluir</button></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    // A lógica de `loadClients`, listeners de clique e busca continuam válidos.
    // Cole aqui o restante do seu admin-clientes.js da resposta anterior.
    // Implementação Completa para Garantir
    async function loadClients(searchTerm = '') { let url = '/api/clientes'; if (searchTerm) url = `/api/clientes/search?termo=${encodeURIComponent(searchTerm)}`; try { const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } }); if (!response.ok) { if (response.status === 401 || response.status === 403) window.location.href = '/login.html'; const err = await response.json(); throw new Error(err.erro || 'Falha ao buscar clientes.'); } const clientes = await response.json(); renderClients(clientes); } catch (error) { clientListDiv.innerHTML = `<p style="color: red;">${error.message}</p>`; } }
    clientListDiv.addEventListener('click', async (event) => { if (event.target.classList.contains('btn-delete')) { const id = event.target.dataset.id; if (confirm('Tem certeza que deseja excluir este cliente? Se a exclusão em cascata estiver ativa, TODOS os pedidos deste cliente serão apagados.')) { try { const response = await fetch(`/api/clientes/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }); if (!response.ok) { const err = await response.json(); throw new Error(err.erro || 'Falha ao excluir'); } const result = await response.json(); alert(result.mensagem); loadClients(searchInput.value.trim()); } catch (error) { alert(`Erro: ${error.message}`); } } } });
    searchInput.addEventListener('keyup', (event) => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { loadClients(event.target.value.trim()); }, 400); });
    loadClients();
});