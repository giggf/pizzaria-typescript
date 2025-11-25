// src/controllers/PedidoController.ts
import { Request, Response } from 'express';
import { PedidoService } from '../services/PedidoService';
import { pool } from '../database/database';

const pedidoService = new PedidoService();

// ... (A função createPedido continua a mesma)
export const createPedido = async (req: Request, res: Response) => {
    try {
        const clienteId = req.usuario?.id;
        if (!clienteId) return res.status(401).json({ erro: "Cliente não autenticado." });
        
        const { formaPagamento, itens } = req.body;
        const pedidoData = { clienteId, formaPagamento, itens };
        const novoPedido = await pedidoService.create(pedidoData);
        
        res.status(201).json(novoPedido);
    } catch (error: any) {
        console.error("Erro detalhado ao criar pedido:", error);
        res.status(400).json({ erro: error.message || "Ocorreu um erro interno ao criar o pedido." });
    }
};

// --- FUNÇÃO CORRIGIDA E MAIS ROBUSTA ---
export const getAllPedidos = async (req: Request, res: Response) => {
    try {
        const query = `
            SELECT 
                p.id, 
                p.data_pedido, 
                p.total, 
                p.status_pedido, 
                c.nome as cliente_nome 
            FROM pedidos AS p 
            JOIN clientes AS c ON p.cliente_id = c.id 
            ORDER BY p.data_pedido DESC
        `;
        const result = await pool.query(query);
        res.status(200).json(result.rows);
    } catch (error) {
        // Log crucial para depuração
        console.error("ERRO GRAVE AO BUSCAR PEDIDOS:", error);
        res.status(500).json({ erro: 'Falha interna do servidor ao buscar pedidos.' });
    }
};

// ... (A função deletePedido continua a mesma)
export const deletePedido = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM pedidos WHERE id = $1', [id]);
        if (result.rowCount === 0) return res.status(404).json({ erro: 'Pedido não encontrado.' });
        res.status(200).json({ mensagem: 'Pedido excluído com sucesso.' });
    } catch (error) {
        console.error("Erro detalhado ao deletar pedido:", error);
        res.status(500).json({ erro: 'Falha ao excluir pedido.' });
    }
};