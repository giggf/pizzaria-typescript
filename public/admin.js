document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    if (!token) { window.location.href = '/login.html'; return; }

    // --- Referências do DOM ---
    const loadingEl = document.getElementById('loading-admin');
    const reportsContentEl = document.getElementById('reports-content');
    const btnGerarRelatorio = document.getElementById('btnGerarRelatorio');
    const dataInicioEl = document.getElementById('dataInicio');
    const dataFimEl = document.getElementById('dataFim');
    const logoutBtn = document.getElementById('logout-btn');
    const presetsContainer = document.querySelector('.filters-presets');
    
    let graficoVendas, graficoTopProdutos;

    // --- Funções de Renderização ---
    const formatarMoeda = (valor) => parseFloat(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    function atualizarResumo(resumo) { const c=document.getElementById('summary-container');c.innerHTML=`<div class="summary-item"><h3>Faturamento Total</h3><p>${formatarMoeda(resumo.faturamento_total)}</p></div><div class="summary-item"><h3>Total de Pedidos</h3><p>${resumo.total_pedidos||0}</p></div><div class="summary-item"><h3>Ticket Médio</h3><p>${formatarMoeda(resumo.ticket_medio)}</p></div>`; }
    function renderizarGraficoVendas(vendas) { const c=document.getElementById('graficoVendas').getContext('2d');if(graficoVendas)graficoVendas.destroy();graficoVendas=new Chart(c,{type:'line',data:{labels:vendas.map(v=>new Date(v.dia).toLocaleDateString('pt-BR',{timeZone:'UTC'})),datasets:[{label:'Faturamento',data:vendas.map(v=>v.total_vendido),borderColor:'rgb(75, 192, 192)',backgroundColor:'rgba(75, 192, 192, 0.1)',fill:true,tension:0.1}]}}); }
    function renderizarGraficoTopProdutos(produtos) { const c=document.getElementById('graficoTopProdutos').getContext('2d');if(graficoTopProdutos)graficoTopProdutos.destroy();graficoTopProdutos=new Chart(c,{type:'bar',data:{labels:produtos.map(p=>p.nome),datasets:[{label:'Unidades Vendidas',data:produtos.map(p=>p.quantidade_vendida),backgroundColor:'rgba(153, 102, 255, 0.6)'}]},options:{indexAxis:'y'}}); }
    function preencherTabelaTodosProdutos(produtos) { const c=document.getElementById('corpoTabelaTodosProdutos');c.innerHTML='';if(produtos.length===0){c.innerHTML='<tr><td colspan="3" style="text-align:center;">Nenhum produto.</td></tr>';return}produtos.forEach(p=>{const r=document.createElement('tr');r.innerHTML=`<td>${p.nome}</td><td>${p.quantidade_total}</td><td style="text-align:right;">${formatarMoeda(p.faturamento_gerado)}</td>`;c.appendChild(r)}); }
    
    // --- Função Principal ---
    async function gerarRelatorio() {
        const dataInicio = dataInicioEl.value;
        const dataFim = dataFimEl.value;
        if (!dataInicio || !dataFim) { alert('Selecione as datas.'); return; }

        loadingEl.style.display = 'block';
        reportsContentEl.style.display = 'none';

        try {
            const url = `/api/relatorios/periodo?dataInicio=${dataInicio}&dataFim=${dataFim}`;
            const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) { const err = await response.json(); throw new Error(err.erro || 'Falha ao buscar dados.'); }
            const data = await response.json();
            
            atualizarResumo(data.resumoGeral);
            renderizarGraficoVendas(data.vendasPorDia);
            renderizarGraficoTopProdutos(data.topProdutos);
            preencherTabelaTodosProdutos(data.todosProdutosVendidos);
        } catch (error) {
            alert(`Não foi possível carregar o relatório: ${error.message}`);
        } finally {
            loadingEl.style.display = 'none';
            reportsContentEl.style.display = 'block';
        }
    }
    
    // --- Listeners ---
    if(logoutBtn) logoutBtn.addEventListener('click', (e) => { e.preventDefault(); localStorage.removeItem('authToken'); window.location.href = '/login.html'; });
    btnGerarRelatorio.addEventListener('click', gerarRelatorio);

    presetsContainer.addEventListener('click', (e) => {
        if(e.target.classList.contains('btn-preset')) {
            const range = e.target.dataset.range;
            const hoje = new Date(); let inicio, fim;
            if (range === 'this-month') { inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1); fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0); }
            else if (range === 'last-month') { inicio = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1); fim = new Date(hoje.getFullYear(), hoje.getMonth(), 0); }
            else if (range === 'this-year') { inicio = new Date(hoje.getFullYear(), 0, 1); fim = new Date(hoje.getFullYear(), 11, 31); }
            dataInicioEl.value = inicio.toISOString().split('T')[0];
            dataFimEl.value = fim.toISOString().split('T')[0];
            gerarRelatorio();
        }
    });

    // Inicializa a página com o mês atual
    presetsContainer.querySelector('[data-range="this-month"]').click();
});