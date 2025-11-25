// src/controllers/RelatorioController.ts
import { Request, Response } from 'express';
import { pool } from '../database/database';

export const getRelatorioPeriodo = async (req: Request, res: Response) => {
    try {
        const { dataInicio, dataFim } = req.query as { dataInicio: string; dataFim: string; };

        if (!dataInicio || !dataFim) {
            return res.status(400).json({ erro: 'As datas de início e fim são obrigatórias.' });
        }
        
        // Ajusta a data final para incluir o dia inteiro
        const dataFimAjustada = new Date(dataFim);
        dataFimAjustada.setDate(dataFimAjustada.getDate() + 1);

        // 1. Resumo Geral
        const resumoQuery = `
            SELECT 
                COALESCE(SUM(total), 0) as faturamento_total, 
                COUNT(id) as total_pedidos,
                COALESCE(AVG(total), 0) as ticket_medio
            FROM pedidos 
            WHERE data_pedido >= $1 AND data_pedido < $2;
        `;
        const resumoResult = await pool.query(resumoQuery, [dataInicio, dataFimAjustada]);

        // 2. Vendas por Dia
        const vendasPorDiaQuery = `
            SELECT 
                DATE(data_pedido) as dia, 
                SUM(total) as total_vendido
            FROM pedidos
            WHERE data_pedido >= $1 AND data_pedido < $2
            GROUP BY dia
            ORDER BY dia;
        `;
        const vendasPorDiaResult = await pool.query(vendasPorDiaQuery, [dataInicio, dataFimAjustada]);
        
        // 3. Top 10 Produtos Mais Vendidos
        const topProdutosQuery = `
            SELECT p.nome, SUM(pi.quantidade) as quantidade_vendida
            FROM pedido_itens pi
            JOIN produtos p ON pi.produto_id = p.id
            JOIN pedidos ped ON pi.pedido_id = ped.id
            WHERE ped.data_pedido >= $1 AND ped.data_pedido < $2
            GROUP BY p.nome
            ORDER BY quantidade_vendida DESC
            LIMIT 10;
        `;
        const topProdutosResult = await pool.query(topProdutosQuery, [dataInicio, dataFimAjustada]);

        // 4. Todos os Produtos Vendidos (com faturamento)
        const todosProdutosQuery = `
             SELECT 
                p.nome, 
                SUM(pi.quantidade) as quantidade_total,
                SUM(pi.quantidade * pi.preco_unitario) as faturamento_gerado
            FROM pedido_itens pi
            JOIN produtos p ON pi.produto_id = p.id
            JOIN pedidos ped ON pi.pedido_id = ped.id
            WHERE ped.data_pedido >= $1 AND ped.data_pedido < $2
            GROUP BY p.nome
            ORDER BY faturamento_gerado DESC;
        `;
        const todosProdutosResult = await pool.query(todosProdutosQuery, [dataInicio, dataFimAjustada]);

        res.status(200).json({
            resumoGeral: resumoResult.rows[0],
            vendasPorDia: vendasPorDiaResult.rows,
            topProdutos: topProdutosResult.rows,
            todosProdutosVendidos: todosProdutosResult.rows
        });

    } catch (error: any) {
        console.error('Erro ao gerar relatório:', error);
        res.status(500).json({ erro: 'Erro interno ao gerar relatório.' });
    }
};