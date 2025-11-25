document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    if (!token) { window.location.href = '/login.html'; return; }

    // --- Referências ---
    const productListDiv = document.getElementById('product-list');
    const searchInput = document.getElementById('search-product-input');
    const modal = document.getElementById('product-modal');
    const form = document.getElementById('product-form');
    const closeModalBtn = modal.querySelector('.close-button');
    const addNewBtn = document.getElementById('add-new-product-btn');
    const promoCheckbox = document.getElementById('em-promocao');
    const promoPriceGroup = document.getElementById('promo-price-group');
    const logoutBtn = document.getElementById('logout-btn');
    
    let allProducts = [];
    let searchTimer;

    // --- Funções ---
    async function loadProducts() {
        try {
            const response = await fetch('/api/produtos', { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error('Falha ao buscar produtos.');
            allProducts = await response.json();
            renderProducts(allProducts);
        } catch (error) { productListDiv.innerHTML = `<p style="color:red;">${error.message}</p>`; }
    }

    function renderProducts(produtos) {
        if (!produtos || produtos.length === 0) { productListDiv.innerHTML = '<p>Nenhum produto encontrado.</p>'; return; }
        productListDiv.innerHTML = `<table class="data-table"><thead><tr><th>Nome</th><th>Categoria</th><th>Preço</th><th>Ações</th></tr></thead><tbody>${produtos.map(p => `<tr><td>${p.nome}</td><td>${p.categoria}</td><td>${p.em_promocao ? `<span class="promo-price">${parseFloat(p.preco_promocional).toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}</span> <s style="font-size:0.8em;">${parseFloat(p.preco).toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}</s>` : parseFloat(p.preco).toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}</td><td><button class="btn-edit" data-id="${p.id}">Editar</button> <button class="btn-delete" data-id="${p.id}">Excluir</button></td></tr>`).join('')}</tbody></table>`;
    }

    // --- Listeners ---
    if (logoutBtn) logoutBtn.addEventListener('click', (e) => { e.preventDefault(); localStorage.removeItem('authToken'); window.location.href = '/login.html'; });
    addNewBtn.addEventListener('click', () => { form.reset(); document.getElementById('product-id').value = ''; document.getElementById('modal-title').textContent = 'Adicionar Produto'; promoPriceGroup.style.display = 'none'; modal.style.display = 'flex'; });
    closeModalBtn.addEventListener('click', () => { modal.style.display = 'none'; });

    productListDiv.addEventListener('click', async (event) => {
        const target = event.target;
        if (target.classList.contains('btn-edit')) {
            const id = target.dataset.id;
            const produto = allProducts.find(p => p.id == id);
            if (produto) {
                document.getElementById('product-id').value = produto.id;
                document.getElementById('nome').value = produto.nome;
                document.getElementById('descricao').value = produto.descricao;
                document.getElementById('imagem_url').value = produto.imagem_url; // Pega a URL
                document.getElementById('preco').value = produto.preco;
                document.getElementById('categoria').value = produto.categoria;
                promoCheckbox.checked = produto.em_promocao;
                document.getElementById('preco-promocional').value = produto.preco_promocional;
                promoPriceGroup.style.display = produto.em_promocao ? 'block' : 'none';
                document.getElementById('modal-title').textContent = 'Editar Produto';
                modal.style.display = 'flex';
            }
        }
        if (target.classList.contains('btn-delete')) {
            const id = target.dataset.id;
            if(confirm('Tem certeza?')){ await fetch(`/api/produtos/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }); loadProducts(); }
        }
    });

    searchInput.addEventListener('keyup', (e) => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { const searchTerm = e.target.value.toLowerCase(); const filteredProducts = allProducts.filter(p => p.nome.toLowerCase().includes(searchTerm)); renderProducts(filteredProducts); }, 300); });
    promoCheckbox.addEventListener('change', () => { promoPriceGroup.style.display = promoCheckbox.checked ? 'block' : 'none'; });

 form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const id = document.getElementById('product-id').value;
    const url = id ? `/api/produtos/${id}` : '/api/produtos';
    const method = id ? 'PUT' : 'POST';
    const isPromo = document.getElementById('em-promocao').checked;

    // --- CORREÇÃO AQUI ---
    // Montando o objeto 'produtoData' corretamente do zero
    const produtoData = {
        nome: document.getElementById('nome').value,
        descricao: document.getElementById('descricao').value,
        imagem_url: document.getElementById('imagem_url').value, // Envia a URL
        preco: parseFloat(document.getElementById('preco').value),
        categoria: document.getElementById('categoria').value,
        em_promocao: isPromo,
        preco_promocional: isPromo ? parseFloat(document.getElementById('preco-promocional').value) : null
    };
    // ----------------------

    try {
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(produtoData)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.erro || 'Falha ao salvar o produto.');
        }
        modal.style.display = 'none';
        loadProducts(); // Recarrega a lista
    } catch (error) {
        alert(`Erro: ${error.message}`);
    }
});

    loadProducts();
});