document.addEventListener('DOMContentLoaded', () => {
  const loadingDiv = document.getElementById('loading-admin');
  const reportsContent = document.getElementById('reports-content');
  const monthlyReportBody = document.getElementById('monthly-report-body');
  const weeklyReportBody = document.getElementById('weekly-report-body');

  /**
   * Formata um número para a moeda brasileira (BRL).
   */
  function formatCurrency(value) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  /**
   * Busca os dados do relatório na API e renderiza as tabelas.
   */
  async function loadReports() {
    try {
      const response = await fetch('/api/relatorios/vendas');
      if (!response.ok) {
        throw new Error('Falha ao carregar os dados do relatório.');
      }
      const data = await response.json();

      // Renderiza o relatório mensal
      monthlyReportBody.innerHTML = ''; // Limpa a tabela
      if (data.relatorioMensal.length > 0) {
        data.relatorioMensal.forEach(item => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${item.mes}</td>
            <td>${formatCurrency(item.total)}</td>
          `;
          monthlyReportBody.appendChild(row);
        });
      } else {
        monthlyReportBody.innerHTML = '<tr><td colspan="2">Nenhum dado encontrado.</td></tr>';
      }

      // Renderiza o relatório semanal
      weeklyReportBody.innerHTML = ''; // Limpa a tabela
      if (data.relatorioSemanal.length > 0) {
        data.relatorioSemanal.forEach(item => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${item.semana}</td>
            <td>${formatCurrency(item.total)}</td>
          `;
          weeklyReportBody.appendChild(row);
        });
      } else {
        weeklyReportBody.innerHTML = '<tr><td colspan="2">Nenhum dado encontrado.</td></tr>';
      }

      // Exibe o conteúdo e esconde a mensagem de loading
      loadingDiv.style.display = 'none';
      reportsContent.style.display = 'block';

    } catch (error) {
      loadingDiv.textContent = error.message;
      console.error('Erro:', error);
    }
  }

  // Inicia o carregamento dos relatórios assim que a página carrega
  loadReports();
});