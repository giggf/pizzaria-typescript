// src/services/PedidoService.ts

import { pool } from '../database/database';

interface PedidoItem {
    produtoId: number;
    quantidade: number;
}

interface PedidoData {
    clienteId: number;
    formaPagamento: string;
    itens: PedidoItem[];
}

export class PedidoService {

    // Este é o método que estava faltando!
    async create(pedidoData: PedidoData) {
        const { clienteId, formaPagamento, itens } = pedidoData;

        if (!itens || itens.length === 0) {
            throw new Error('O pedido deve conter pelo menos um item.');
        }

        const client = await pool.connect();

        try {
            // Inicia a transação
            await client.query('BEGIN');

            // 1. Insere o pedido na tabela 'pedidos' e pega o ID gerado
            const pedidoQuery = `
                INSERT INTO pedidos (cliente_id, forma_pagamento, total) 
                VALUES ($1, $2, 0) RETURNING id
            `;
            const pedidoResult = await client.query(pedidoQuery, [clienteId, formaPagamento]);
            const pedidoId = pedidoResult.rows[0].id;

            // 2. Prepara para inserir os itens e calcular o total
            const productIds = itens.map(item => item.produtoId);
            let totalPedido = 0;

            // Busca os preços de todos os produtos de uma só vez para eficiência
            const precosResult = await client.query(
                'SELECT id, preco, preco_promocional, em_promocao FROM produtos WHERE id = ANY($1::int[])',
                [productIds]
            );
            
            // Mapeia os preços por ID para fácil acesso
            const precosMap = new Map<number, number>();
            precosResult.rows.forEach(p => {
                const precoFinal = p.em_promocao && p.preco_promocional ? p.preco_promocional : p.preco;
                precosMap.set(p.id, parseFloat(precoFinal));
            });
            
            // 3. Insere cada item na tabela 'pedido_itens'
            for (const item of itens) {
                const precoUnitario = precosMap.get(item.produtoId);

                if (!precoUnitario) {
                    throw new Error(`Produto com ID ${item.produtoId} não encontrado ou sem preço.`);
                }
                
                totalPedido += precoUnitario * item.quantidade;

                const itemQuery = `
                    INSERT INTO pedido_itens (pedido_id, produto_id, quantidade, preco_unitario) 
                    VALUES ($1, $2, $3, $4)
                `;
                await client.query(itemQuery, [pedidoId, item.produtoId, item.quantidade, precoUnitario]);
            }

            // 4. Atualiza o pedido na tabela 'pedidos' com o total final calculado
            await client.query('UPDATE pedidos SET total = $1 WHERE id = $2', [totalPedido, pedidoId]);

            // Finaliza a transação com sucesso
            await client.query('COMMIT');

            return { id: pedidoId, total: totalPedido, ...pedidoData };

        } catch (error) {
            // Se qualquer etapa falhar, desfaz todas as operações
            await client.query('ROLLBACK');
            console.error("Erro no serviço ao criar pedido:", error);
            throw new Error('Não foi possível processar o seu pedido. Tente novamente.');
        } finally {
            // Libera o cliente de volta para o pool de conexões
            client.release();
        }
    }

}