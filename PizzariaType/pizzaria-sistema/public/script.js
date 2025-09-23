window.onload = function() {
  // --- Referências do DOM ---
  const menuContainer = document.getElementById('menu-container');
  const productsGridContainer = document.getElementById('products-grid-container');
  const loadingDiv = document.getElementById('loading');
  
  const cartIcon = document.getElementById('cart-icon');
  const cartCountSpan = document.getElementById('cart-count');
  const cartModal = document.getElementById('cart-modal');
  const closeModalButton = document.querySelector('.close-button');
  const cartItemsDiv = document.getElementById('cart-items');
  const cartTotalValueSpan = document.getElementById('cart-total-value');
  
  const clienteSelect = document.getElementById('cliente-select');
  const pagamentoSelect = document.getElementById('pagamento-select');
  const checkoutBtn = document.getElementById('checkout-btn');
  const checkoutSection = document.getElementById('checkout-section');
  
  const editProductModal = document.getElementById('edit-product-modal');
  const closeEditModalButton = document.getElementById('close-edit-modal');
  const editProductForm = document.getElementById('edit-product-form');

  const filterContainer = document.querySelector('.filter-container');

  let cart = [];

  // --- Funções de Inicialização ---
  async function initialize() {
    await Promise.all([ loadProducts(), loadClients() ]);
    loadCartFromStorage();
  }
  
  // --- Funções do Carrinho ---
  function loadCartFromStorage(){const storedCart=localStorage.getItem('pizzariaCart');if(storedCart){cart=JSON.parse(storedCart)}updateCartUI()}
  function saveCartToStorage(){localStorage.setItem('pizzariaCart',JSON.stringify(cart))}
  function addToCart(productId,productName,productPrice){const existingItem=cart.find(item=>item.id===productId);if(existingItem){existingItem.quantity++}else{cart.push({id:productId,name:productName,price:productPrice,quantity:1})}saveCartToStorage();updateCartUI()}
  function removeFromCart(productId){cart=cart.filter(item=>item.id!==productId);saveCartToStorage();updateCartUI()}
  function updateCartUI(){cartItemsDiv.innerHTML='';let total=0;let totalItems=0;cart.forEach(item=>{const itemTotal=item.price*item.quantity;total+=itemTotal;totalItems+=item.quantity;const cartItem=document.createElement('div');cartItem.className='cart-item';cartItem.innerHTML=`<span>${item.name} (x${item.quantity})</span><span>${itemTotal.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</span><button class="remove-item-btn" data-id="${item.id}">&times;</button>`;cartItemsDiv.appendChild(cartItem)});cartCountSpan.textContent=totalItems;cartTotalValueSpan.textContent=total.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});if(cart.length>0){checkoutSection.style.display='block'}else{checkoutSection.style.display='none'}}
  
  // --- Funções de Carregamento de Dados ---
  async function loadProducts(categoria = 'todos') {
    loadingDiv.style.display = 'block';
    menuContainer.style.display = 'none';
    
    let apiUrl = '/api/produtos';
    if (categoria !== 'todos') {
      apiUrl += `?categoria=${encodeURIComponent(categoria)}`;
    }

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error('Falha ao carregar produtos.');
      const produtos = await response.json();
      
      loadingDiv.style.display = 'none';
      menuContainer.style.display = 'flex';
      
      productsGridContainer.innerHTML = '';

      produtos.forEach(produto => {
        const card = document.createElement('div');
        card.className = 'produto-card';
        card.dataset.cardId = produto.id;
        const precoFormatado = produto.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        card.innerHTML = `
          <div class="info-container">
            <div class="categoria">${produto.categoria}</div>
            <h2 class="nome">${produto.nome}</h2>
            <p class="descricao">${produto.descricao}</p>
          </div>
          <div class="card-footer">
            <div class="preco">${precoFormatado}</div>
            <div class="footer-actions">
              <button class="add-to-cart-btn" data-id="${produto.id}" data-nome="${produto.nome}" data-preco="${produto.preco}">➕</button>
              <button class="edit-btn" 
                data-id="${produto.id}" 
                data-nome="${produto.nome}" 
                data-descricao="${produto.descricao}"
                data-preco="${produto.preco}"
                data-categoria="${produto.categoria}"
              >✏️</button>
              <button class="delete-btn" data-id="${produto.id}">🗑️</button>
            </div>
          </div>`;
          
        productsGridContainer.appendChild(card);
      });
    } catch (error) {
        loadingDiv.textContent = error.message;
        console.error('Erro ao buscar produtos:', error);
    }
  }
  
  async function loadClients() {
    try {
      const response = await fetch('/api/clientes');
      if (!response.ok) throw new Error('Falha na resposta da rede');
      const clientes = await response.json();
      clienteSelect.innerHTML = '<option value="">Selecione um cliente...</option>';
      clientes.forEach(cliente => {
        const option = document.createElement('option');
        option.value = cliente.id;
        option.textContent = `${cliente.nome} - ${cliente.telefone}`;
        clienteSelect.appendChild(option);
      });
    } catch (error) {
      clienteSelect.innerHTML = '<option value="">Falha ao carregar</option>';
      console.error("Erro ao carregar clientes:", error);
    }
  }

  // --- Funções de Edição de Produto ---
  function openEditModal(produto) {
    document.getElementById('edit-product-id').value = produto.id;
    document.getElementById('edit-nome').value = produto.nome;
    document.getElementById('edit-descricao').value = produto.descricao;
    document.getElementById('edit-preco').value = produto.preco;
    document.getElementById('edit-categoria').value = produto.categoria;
    editProductModal.style.display = 'block';
  }

  async function handleEditSubmit(event) {
    event.preventDefault();
    const id = document.getElementById('edit-product-id').value;
    const produtoAtualizado = {
      nome: document.getElementById('edit-nome').value,
      descricao: document.getElementById('edit-descricao').value,
      preco: parseFloat(document.getElementById('edit-preco').value),
      categoria: document.getElementById('edit-categoria').value,
    };
    try {
      const response = await fetch(`/api/produtos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(produtoAtualizado),
      });
      if (!response.ok) throw new Error('Falha ao atualizar o produto.');
      const data = await response.json();
      updateProductCardInDOM(data);
      editProductModal.style.display = 'none';
      alert('Produto atualizado com sucesso!');
    } catch (error) {
      alert(error.message);
      console.error('Erro ao editar produto:', error);
    }
  }

  function updateProductCardInDOM(produto) {
    const card = document.querySelector(`.produto-card[data-card-id="${produto.id}"]`);
    if (!card) return;
    card.querySelector('.nome').textContent = produto.nome;
    card.querySelector('.descricao').textContent = produto.descricao;
    card.querySelector('.preco').textContent = produto.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const editBtn = card.querySelector('.edit-btn');
    editBtn.dataset.nome = produto.nome;
    editBtn.dataset.descricao = produto.descricao;
    editBtn.dataset.preco = produto.preco;
    editBtn.dataset.categoria = produto.categoria;
    const addBtn = card.querySelector('.add-to-cart-btn');
    addBtn.dataset.nome = produto.nome;
    addBtn.dataset.preco = produto.preco;
  }
  
  // --- Função de Checkout ---
  async function handleCheckout() {
      const clienteId = clienteSelect.value; const formaPagamento = pagamentoSelect.value;
      if(!clienteId){alert('Por favor, selecione um cliente.');return}
      checkoutBtn.disabled=true; checkoutBtn.textContent='Processando...';
      const pedidoData={clienteId:parseInt(clienteId),formaPagamento:formaPagamento,itens:cart.map(item=>({produtoId:item.id,quantidade:item.quantity}))};
      try {
          const response=await fetch('/api/pedidos',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(pedidoData)});
          if(!response.ok){throw new Error('Falha ao criar o pedido.')}
          const result=await response.json();
          alert('Pedido finalizado!\n\n'+result.comprovante);
          cart=[];saveCartToStorage();updateCartUI();cartModal.style.display='none';
      } catch(error){alert('Erro ao finalizar o pedido.');console.error("Erro no checkout:",error)}
      finally{checkoutBtn.disabled=false;checkoutBtn.textContent='Finalizar Pedido'}
  }
  
  // --- Event Listeners ---
  filterContainer.addEventListener('click', function(event) {
    if (event.target && event.target.classList.contains('filter-btn')) {
      document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
      event.target.classList.add('active');
      const categoria = event.target.dataset.categoria;
      loadProducts(categoria);
    }
  });

  menuContainer.addEventListener('click',function(event){
    const target = event.target.closest('button');
    if(!target) return;

    if(target.classList.contains('add-to-cart-btn')){
      const id=parseInt(target.dataset.id);
      const nome=target.dataset.nome;
      const preco=parseFloat(target.dataset.preco);
      addToCart(id,nome,preco);
    }
    if(target.classList.contains('delete-btn')){
      const id=parseInt(target.dataset.id);
      if(confirm('Tem certeza que deseja excluir este produto?')){
        fetch(`/api/produtos/${id}`,{method:'DELETE'})
          .then(response=>{if(response.ok){target.closest('.produto-card').remove()}else{alert('Falha ao excluir o produto.')}})
          .catch(error=>console.error('Erro ao excluir produto:',error));
      }
    }
    if (target.classList.contains('edit-btn')) {
      const produto = { 
        id: target.dataset.id, 
        nome: target.dataset.nome, 
        descricao: target.dataset.descricao, 
        preco: target.dataset.preco, 
        categoria: target.dataset.categoria 
      };
      openEditModal(produto);
    }
  });
  
  cartItemsDiv.addEventListener('click',function(event){
    if(event.target && event.target.classList.contains('remove-item-btn')){
      const button=event.target;
      const productId=parseInt(button.dataset.id);
      removeFromCart(productId);
    }
  });

  checkoutBtn.addEventListener('click',handleCheckout);
  cartIcon.onclick=function(){cartModal.style.display='block'}
  closeModalButton.onclick=function(){cartModal.style.display='none'}
  closeEditModalButton.onclick = function() { editProductModal.style.display = 'none'; }
  editProductForm.addEventListener('submit', handleEditSubmit);

  window.onclick=function(event){
    if(event.target==cartModal){cartModal.style.display='none'}
    if (event.target == editProductModal) { editProductModal.style.display = 'none'; }
  }

  // --- Inicialização da Aplicação ---
  initialize();
};