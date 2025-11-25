document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    if (!token) { window.location.href = '/login.html'; return; }

    const orderListDiv = document.getElementById('order-list');
    const logoutBtn = document.getElementById('logout-btn');
    
    async function loadOrders() {
        orderListDiv.innerHTML = '<p>Carregando pedidos...</p>';
        try {
            const response = await fetch('/api/pedidos', { 
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // Adiciona mais detalhes em caso de erro
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.erro || `Erro ${response.status} do servidor.`);
            }
            
            const pedidos = await response.json();
            renderOrders(pedidos);

        } catch (error) {
            orderListDiv.innerHTML = `<p style="color:red">Falha ao carregar pedidos. Detalhe: ${error.message}</p>`;
        }
    }

    function renderOrders(pedidos) { /* ... A sua função renderOrders está correta, cole-a aqui ... */ }
    
    // Listeners...
    if(logoutBtn) { logoutBtn.addEventListener('click', (e) => { e.preventDefault(); localStorage.removeItem('authToken'); window.location.href = '/login.html'; }); }
    orderListDiv.addEventListener('click', async (e) => { /* ... sua lógica de delete está correta, cole-a aqui ... */ });
    
    loadOrders();

    // Copiando implementações para garantir
    function renderOrders(pedidos) { if (pedidos.length === 0) { orderListDiv.innerHTML = '<p>Nenhum pedido encontrado.</p>'; return; } orderListDiv.innerHTML = `<table class="data-table"><thead><tr><th>ID</th><th>Cliente</th><th>Data</th><th>Total</th><th>Status</th><th>Ações</th></tr></thead><tbody>${pedidos.map(p => `<tr><td>#${p.id}</td><td>${p.cliente_nome}</td><td>${new Date(p.data_pedido).toLocaleString('pt-BR')}</td><td>${(p.total ? parseFloat(p.total) : 0).toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}</td><td><span class="status-badge">${p.status_pedido}</span></td><td><button class="btn-delete" data-id="${p.id}">Excluir</button></td></tr>`).join('')}</tbody></table>`; }
    orderListDiv.addEventListener('click', async (e) => { if(e.target.classList.contains('btn-delete')){ const id = e.target.dataset.id; if(confirm(`Tem certeza?`)){ try { await fetch(`/api/pedidos/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }); loadOrders(); } catch(error) { alert('Erro ao excluir.'); } } } });
});