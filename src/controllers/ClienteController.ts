// src/controllers/ClienteController.ts

import { Request, Response } from 'express';
import { pool } from '../database/database';

// Corresponde a `router.get('/clientes', ...)`
export const getAllClientes = async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT id, nome, telefone, email, endereco, role FROM clientes ORDER BY nome');
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar clientes.' });
    }
};

// Corresponde a `router.get('/clientes/search', ...)`
export const searchClientes = async (req: Request, res: Response) => {
    try {
        const { termo } = req.query;
        if (!termo) {
            return res.status(400).json({ erro: 'O parâmetro "termo" é obrigatório.' });
        }
        const query = `
            SELECT id, nome, telefone, email, endereco, role 
            FROM clientes 
            WHERE nome ILIKE $1 OR telefone ILIKE $1
            ORDER BY nome
        `;
        const result = await pool.query(query, [`%${termo}%`]);
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao pesquisar clientes.' });
    }
};

// Corresponde a `router.delete('/clientes/:id', ...)`
export const deleteCliente = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM clientes WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ erro: 'Cliente não encontrado.' });
        }
        res.status(200).json({ mensagem: 'Cliente excluído com sucesso.' });
    } catch (error: any) {
        // Verifica se o erro é de chave estrangeira
        if (error.code === '23503') { // Código de erro do PostgreSQL para foreign_key_violation
            return res.status(400).json({ erro: 'Não é possível excluir este cliente pois ele possui pedidos associados.' });
        }
        res.status(500).json({ erro: 'Erro ao excluir cliente.' });
    }
};