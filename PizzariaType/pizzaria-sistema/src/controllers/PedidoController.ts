import { Request, Response } from 'express';
import { PedidoService } from '../services/PedidoService';
export class PedidoController {
  static listar(req: Request, res: Response) { return res.json(PedidoService.listar()); }

static async criar(req: Request, res: Response) {
  const { clienteId, formaPagamento, itens } = req.body;

  if (!clienteId || !formaPagamento || !itens) {
    return res.status(400).json({ erro: 'Dados do pedido incompletos' });
  }

  const resultado = await PedidoService.criar(clienteId, itens, formaPagamento);
  
  if ('erro' in resultado) {
    return res.status(400).json(resultado);
  }

  // Se o pedido foi criado com sucesso (resultado é um objeto Pedido)
  // Geramos o comprovante para este pedido.
  const comprovante = PedidoService.gerarComprovante(resultado);

  // Enviamos de volta tanto os dados do pedido quanto o comprovante em texto.
  return res.status(201).json({
    pedido: resultado,
    comprovante: comprovante,
  });
}
}
