
// src/services/RelatorioService.ts

import pool from '../database/database';

export class RelatorioService {
  
  // Método antigo
  static async gerarRelatorioVendas(ano: number, mes?: number) {
    // ... (código original mantido, sem alterações)
    try {
        const params = mes ? [ano, mes] : [ano];
        const sqlResumo = `
          SELECT SUM(total) as faturamento_total, COUNT(*) as total_pedidos, AVG(total) as ticket_medio
          FROM pedidos WHERE EXTRACT(YEAR FROM data_pedido) = $1 ${mes ? `AND EXTRACT(MONTH FROM data_pedido) = $2` : ''};
        `;
        const resResumo = await pool.query(sqlResumo, params);
  
        const sqlVendasMensais = `
          SELECT EXTRACT(MONTH FROM data_pedido) as mes_numero, TO_CHAR(data_pedido, 'TMMonth') as nome_mes, SUM(total) as total_vendido
          FROM pedidos WHERE EXTRACT(YEAR FROM data_pedido) = $1 GROUP BY 1, 2 ORDER BY 1;
        `;
        const resVendasMensais = await pool.query(sqlVendasMensais, [ano]);
  
        const sqlTopItens = `
          SELECT i.nome, SUM(pi.quantidade) as total_unidades_vendidas
          FROM pedido_itens pi JOIN itens i ON pi.produto_id = i.id JOIN pedidos ped ON pi.pedido_id = ped.id
          WHERE EXTRACT(YEAR FROM ped.data_pedido) = $1 ${mes ? `AND EXTRACT(MONTH FROM ped.data_pedido) = $2` : ''}
          GROUP BY i.nome ORDER BY total_unidades_vendidas DESC LIMIT 10;
        `;
        const resTopItens = await pool.query(sqlTopItens, params);
  
        return {
          periodo: { ano_referencia: ano, mes_referencia: mes || 'Ano Completo' },
          resumo_geral: resResumo.rows[0],
          vendas_por_mes_do_ano: resVendasMensais.rows,
          top_10_itens_mais_vendidos: resTopItens.rows
        };
      } catch (error) {
        console.error('ERRO DETALHADO DO BANCO DE DADOS:', error);
        throw new Error('Não foi possível gerar o relatório. Verifique o console do servidor para o erro de SQL.');
      }
  }

  // NOVA FUNÇÃO para gerar o relatório completo por período
  static async gerarRelatorioPorPeriodo(dataInicio: string, dataFim: string) {
    try {
      // Ajusta a data final para incluir todas as horas do dia (até 23:59:59)
      const dataFimAjustada = `${dataFim}T23:59:59`;

      // Executa todas as consultas em paralelo para melhor performance
      const [resumoResult, vendasPorDiaResult, topProdutosResult, todosProdutosResult] = await Promise.all([
        // 1. Resumo Geral (Faturamento, Pedidos, Ticket Médio)
        pool.query(
          `SELECT
              COALESCE(SUM(total), 0) AS faturamento_total,
              COUNT(id) AS total_pedidos,
              COALESCE(AVG(total), 0) AS ticket_medio
           FROM pedidos
           WHERE data_pedido BETWEEN $1 AND $2;`,
          [dataInicio, dataFimAjustada]
        ),

        // 2. Vendas agrupadas por dia (para o gráfico)
        pool.query(
          `SELECT
              DATE(data_pedido) AS dia,
              SUM(total) AS total_vendido
           FROM pedidos
           WHERE data_pedido BETWEEN $1 AND $2
           GROUP BY dia
           ORDER BY dia;`,
          [dataInicio, dataFimAjustada]
        ),

        // 3. Top 10 produtos mais vendidos
        pool.query(
          `SELECT
              i.nome,
              SUM(pi.quantidade) AS quantidade_vendida
           FROM pedido_itens pi
           JOIN itens i ON pi.produto_id = i.id
           JOIN pedidos p ON pi.pedido_id = p.id
           WHERE p.data_pedido BETWEEN $1 AND $2
           GROUP BY i.nome
           ORDER BY quantidade_vendida DESC
           LIMIT 10;`,
          [dataInicio, dataFimAjustada]
        ),

        // 4. Lista de TODOS os produtos vendidos no período
        pool.query(
          `SELECT
              i.nome,
              SUM(pi.quantidade) AS quantidade_total,
              SUM(pi.quantidade * pi.preco_unitario) as faturamento_gerado
          FROM pedido_itens pi
          JOIN itens i ON pi.produto_id = i.id
          JOIN pedidos p ON pi.pedido_id = p.id
          WHERE p.data_pedido BETWEEN $1 AND $2
          GROUP BY i.nome
          ORDER BY faturamento_gerado DESC;`,
          [dataInicio, dataFimAjustada]
        )
      ]);

      // Monta o objeto de resposta final
      return {
        resumoGeral: resumoResult.rows[0],
        vendasPorDia: vendasPorDiaResult.rows,
        topProdutos: topProdutosResult.rows,
        todosProdutosVendidos: todosProdutosResult.rows
      };
    } catch (error) {
      console.error('ERRO DETALHADO DO BANCO DE DADOS:', error);
      throw new Error('Não foi possível gerar o relatório por período.');
    }
  }
}