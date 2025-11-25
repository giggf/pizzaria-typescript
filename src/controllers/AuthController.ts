import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';

const authService = new AuthService();

export const register = async (req: Request, res: Response) => {
  try {
    const novoUsuario = await authService.register(req.body);
    res.status(201).json(novoUsuario);
  } catch (error: any) {
    res.status(400).json({ erro: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, senha } = req.body;
    const result = await authService.login(email, senha);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(401).json({ erro: error.message });
  }
};

// Rota para o front-end verificar quem está logado
export const getMe = async (req: Request, res: Response) => {
    // Os dados do usuário são adicionados pelo authMiddleware
    if (!req.usuario) {
        return res.status(401).json({ erro: 'Usuário não autenticado.'});
    }

    // Buscamos os dados completos do usuário para garantir que estejam atualizados
    try {
        const result = await pool.query('SELECT id, nome, email, telefone, endereco, role FROM clientes WHERE id = $1', [req.usuario.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ erro: 'Usuário não encontrado.' });
        }
        res.json(result.rows[0]);
    } catch (error: any) {
        res.status(500).json({ erro: 'Erro interno do servidor.' });
    }
};

// Importe o 'pool' se ele ainda não estiver disponível globalmente no seu controller
import { pool } from '../database/database';