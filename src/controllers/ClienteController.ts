import { Request, Response } from 'express';
import { ClienteService } from '../services/ClienteService';

export class ClienteController {
  static listar(req: Request, res: Response) {
    return res.json(ClienteService.listar());
  }
  
  static async criar(req: Request, res: Response) {
    const { nome, telefone, endereco } = req.body;
    if (!nome || !telefone) {
      return res.status(400).json({ erro: 'Nome e telefone são obrigatórios' });
    }
    const novoCliente = await ClienteService.criar(nome, telefone, endereco);
    return res.status(201).json(novoCliente);
  }
}