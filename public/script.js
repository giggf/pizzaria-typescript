document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Efeitos Visuais (Scroll & Header) ---
    const header = document.querySelector('header');
    const headerTitle = document.querySelector('header h1');
    
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        
        // Efeito 1: Título desaparecendo suavemente
        const maxScroll = 300;  // Distância para o efeito máximo
        const minOpacity = 0.3; // Opacidade mínima
        let newOpacity = 1 - (scrollY / maxScroll);
        if (newOpacity < minOpacity) newOpacity = minOpacity;
        
        if (headerTitle) {
            headerTitle.style.opacity = newOpacity;
        }

        // Efeito 2: Fundo do Header Transparente (Glassmorphism)
        // Adiciona a classe .header-scrolled quando desce mais de 50px
        if (scrollY > 50) {
            if(header) header.classList.add('header-scrolled');
        } else {
            if(header) header.classList.remove('header-scrolled');
        }
    });

    // --- 2. Autenticação ---
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    // --- 3. Referências do DOM ---
    // Produtos e Filtros
    const productsGridContainer = document.getElementById('products-grid-container');
    const loadingDiv = document.getElementById('loading');
    const productsSection = document.querySelector('.products-section');
    const searchInput = document.getElementById('search-input');
    const filterContainer = document.querySelector('.sidebar .filter-container');
    const logoutBtn = document.getElementById('logout-btn');
    
    // Carrinho e Modais
    const cartIcon = document.getElementById('cart-icon');
    const cartCountSpan = document.getElementById('cart-count');
    const cartModal = document.getElementById('cart-modal');
    const closeModalButton = cartModal.querySelector('.close-button');
    const cartItemsDiv = document.getElementById('cart-items');
    const cartTotalValueSpan = document.getElementById('cart-total-value');
    const checkoutSection = document.getElementById('checkout-section');
    const checkoutBtn = document.getElementById('checkout-btn');
    const clienteLogadoSpan = document.getElementById('cliente-logado');

    // Comprovante (Receipt)
    const receiptModal = document.getElementById('receipt-modal');
    const receiptContent = document.getElementById('receipt-content');
    const closeReceiptBtn = receiptModal.querySelector('.close-button');
    const printBtn = document.getElementById('print-receipt-btn');

    // Variáveis de Estado
    let usuarioLogado;
    let cart = [];
    let searchTimer;

    // --- 4. Inicialização ---
    async function initialize() {
        try {
            // Busca dados do usuário
            const response = await fetch('/api/auth/me', { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error('Sessão inválida.');
            
            usuarioLogado = await response.json();
            
            // Redireciona se for admin
            if (usuarioLogado.role === 'admin') {
                window.location.href = '/admin.html';
                return;
            }

            if (clienteLogadoSpan) clienteLogadoSpan.textContent = usuarioLogado.nome;
            
            // Carrega dados iniciais
            loadProducts(); 
            loadCartFromStorage();
        } catch (error) {
            console.error(error.message);
            localStorage.removeItem('authToken');
            window.location.href = '/login.html';
        }
    }

    // --- 5. Funções de Produtos ---
    async function loadProducts(categoria = 'todos', searchTerm = '') {
        loadingDiv.style.display = 'block';
        productsSection.style.display = 'none';
        
        // Define URL baseada na busca
        const apiUrl = searchTerm 
            ? `/api/produtos/search?termo=${encodeURIComponent(searchTerm)}` 
            : '/api/produtos';
        
        try {
            const response = await fetch(apiUrl, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error('Falha ao carregar produtos.');
            
            let produtos = await response.json();
            
            // Filtro de categoria no frontend (se não for busca)
            if (!searchTerm && categoria !== 'todos') {
                produtos = produtos.filter(p => p.categoria === categoria);
            }
            renderProducts(produtos);
        } catch (error) {
            loadingDiv.textContent = `Erro: ${error.message}`;
            loadingDiv.style.display = 'block';
        } finally {
            if (!loadingDiv.textContent.startsWith('Erro')) {
                loadingDiv.style.display = 'none';
            }
            productsSection.style.display = 'block';
        }
    }

    function renderProducts(produtos) {
        productsGridContainer.innerHTML = '';
        
        if (!produtos || produtos.length === 0) {
            productsGridContainer.innerHTML = '<p style="text-align: center; width: 100%; color: #666; font-size: 1.2rem;">Nenhum produto encontrado.</p>';
            return;
        }
        
        produtos.forEach(produto => {
            const card = document.createElement('div');
            card.className = 'produto-card';
            
            const precoFinal = produto.em_promocao && produto.preco_promocional ? produto.preco_promocional : produto.preco;
            const precoFormatado = parseFloat(precoFinal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            const precoAntigoFormatado = parseFloat(produto.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

            // Template HTML atualizado com Ícone FontAwesome
            card.innerHTML = `
                ${produto.imagem_url ? `<img src="${produto.imagem_url}" alt="${produto.nome}" class="card-image">` : ''}
                ${produto.em_promocao ? `<div class="promo-badge">PROMO</div>` : ''}
                
                <div class="info-container">
                    <div class="categoria">${produto.categoria}</div>
                    <h2 class="nome">${produto.nome}</h2>
                    <p class="descricao">${produto.descricao || ''}</p>
                </div>
                
                <div class="card-footer">
                    <div class="preco">
                        ${produto.em_promocao ? `<span class="preco-antigo">${precoAntigoFormatado}</span>` : ''}
                        ${precoFormatado}
                    </div>
                    <div class="footer-actions">
                        <button class="add-to-cart-btn" 
                                title="Adicionar ao Carrinho" 
                                data-id="${produto.id}" 
                                data-nome="${produto.nome}" 
                                data-preco="${precoFinal}">
                            <i class="fas fa-cart-plus"></i>
                        </button>
                    </div>
                </div>
            `;
            productsGridContainer.appendChild(card);
        });
    }

    // --- 6. Lógica do Carrinho (Completa) ---
    function loadCartFromStorage() {
        const storedCart = localStorage.getItem('pizzariaCart');
        if(storedCart) {
            cart = JSON.parse(storedCart);
        }
        updateCartUI();
    }

    function saveCartToStorage() {
        localStorage.setItem('pizzariaCart', JSON.stringify(cart));
    }

    function addToCart(productId, productName, productPrice) {
        const existingItem = cart.find(item => item.id === productId);
        if(existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({
                id: productId, 
                name: productName, 
                price: productPrice, 
                quantity: 1
            });
        }
        saveCartToStorage();
        updateCartUI();
        
        // Feedback visual rápido (opcional)
        cartIcon.style.transform = "scale(1.3)";
        setTimeout(() => cartIcon.style.transform = "scale(1)", 200);
    }

    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        saveCartToStorage();
        updateCartUI();
    }

    function updateCartUI() {
        cartItemsDiv.innerHTML = '';
        let total = 0;
        let totalItems = 0;

        if (cart.length === 0) {
            cartItemsDiv.innerHTML = '<p style="text-align:center; color:#888;">Seu carrinho está vazio.</p>';
            checkoutSection.style.display = 'none';
        } else {
            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;
                totalItems += item.quantity;

                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <div>
                        <strong>${item.name}</strong> <br>
                        <small>(${item.quantity}x) ${parseFloat(item.price).toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}</small>
                    </div>
                    <div style="display:flex; align-items:center;">
                        <span style="margin-right:10px; font-weight:bold;">${itemTotal.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</span>
                        <button class="remove-item-btn" data-id="${item.id}" title="Remover">&times;</button>
                    </div>
                `;
                cartItemsDiv.appendChild(cartItem);
            });
            checkoutSection.style.display = 'block';
        }

        cartCountSpan.textContent = totalItems;
        cartTotalValueSpan.textContent = total.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
    }

    async function handleCheckout() {
        if (cart.length === 0) return alert('Seu carrinho está vazio.');
        
        checkoutBtn.disabled = true;
        checkoutBtn.textContent = 'Processando...';
        
        const pedidoData = {
            formaPagamento: document.getElementById('pagamento-select').value,
            itens: cart.map(item => ({ produtoId: item.id, quantidade: item.quantity }))
        };

        try {
            const response = await fetch('/api/pedidos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(pedidoData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.erro || 'Falha ao finalizar o pedido.');
            }
            
            const result = await response.json();
            
            // Pedido Sucesso
            showReceipt(result, usuarioLogado);

            // Limpa carrinho
            cart = [];
            saveCartToStorage();
            updateCartUI();
            cartModal.style.display = 'none';
        } catch (error) {
            alert(`Erro: ${error.message}`);
        } finally {
            checkoutBtn.disabled = false;
            checkoutBtn.textContent = 'Finalizar Pedido';
        }
    }

    function showReceipt(pedidoResult, cliente) {
        receiptContent.innerHTML = `
            <div style="text-align: center; margin-bottom: 1rem;">
                <h3 style="color: var(--primary-color); margin:0;">Pedido #${pedidoResult.id}</h3>
                <p style="color: #666; margin:0;">${new Date().toLocaleString('pt-BR')}</p>
            </div>
            <p><strong>Cliente:</strong> ${cliente.nome}</p>
            <hr>
            <ul style="list-style: none; padding: 0;">
                ${pedidoResult.itens.map(item => {
                    // Tenta encontrar nome no carrinho atual ou mostra genérico se já limpou muito rápido (edge case)
                    // Melhoria: o backend poderia retornar os nomes, mas aqui usamos o cache local
                    return `<li style="border-bottom: 1px dashed #eee; padding: 5px 0;">
                        Produto ID ${item.produtoId} <span style="float:right">x${item.quantidade}</span>
                    </li>`;
                }).join('')}
            </ul>
            <hr>
            <p><strong>Forma de Pagamento:</strong> ${pedidoResult.formaPagamento.toUpperCase()}</p>
            <h3 style="text-align: right; margin-top: 1rem;">Total: ${parseFloat(pedidoResult.total).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</h3>
        `;
        receiptModal.style.display = 'flex';
    }

    // --- 7. Event Listeners ---
    
    // Filtros laterais
    if(filterContainer) {
        filterContainer.addEventListener('click', function(event) { 
            const target = event.target.closest('.filter-btn'); 
            if (target) { 
                searchInput.value = ''; 
                document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active')); 
                target.classList.add('active'); 
                loadProducts(target.dataset.categoria); 
            } 
        });
    }

    // Busca com delay (Debounce)
    if(searchInput) {
        searchInput.addEventListener('keyup', (event) => { 
            clearTimeout(searchTimer); 
            searchTimer = setTimeout(() => { 
                document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active')); 
                // Tenta ativar o botão 'todos' se existir
                const btnTodos = document.querySelector('.filter-btn[data-categoria="todos"]');
                if(btnTodos) btnTodos.classList.add('active'); 
                
                loadProducts('todos', event.target.value.trim()); 
            }, 400); 
        });
    }

    // Clique no botão "Adicionar ao Carrinho" (Delegação de Evento)
    productsGridContainer.addEventListener('click', (event) => { 
        const target = event.target.closest('.add-to-cart-btn'); 
        if (target) { 
            // Efeito visual de clique
            target.style.transform = 'scale(0.95)';
            setTimeout(() => target.style.transform = 'scale(1)', 100);
            
            addToCart(
                parseInt(target.dataset.id), 
                target.dataset.nome, 
                parseFloat(target.dataset.preco)
            ); 
        } 
    });

    // Remover item do carrinho
    cartItemsDiv.addEventListener('click', (event) => { 
        const target = event.target.closest('.remove-item-btn'); 
        if (target) removeFromCart(parseInt(target.dataset.id)); 
    });

    // Logout
    if(logoutBtn) {
        logoutBtn.addEventListener('click', (e) => { 
            e.preventDefault();
            localStorage.removeItem('authToken'); 
            window.location.href = '/login.html'; 
        });
    }

    // Modais e Botões
    cartIcon.onclick = () => { cartModal.style.display = 'flex'; };
    closeModalButton.onclick = () => { cartModal.style.display = 'none'; };
    checkoutBtn.addEventListener('click', handleCheckout);
    closeReceiptBtn.onclick = () => { receiptModal.style.display = 'none'; };
    printBtn.onclick = () => window.print();

    // Fechar modal clicando fora
    window.onclick = e => { 
        if (e.target == cartModal || e.target == receiptModal) {
            e.target.style.display = 'none'; 
        }
    };

    // Inicia
    initialize();
});