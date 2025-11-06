import { Request, Response } from 'express';
import { RelatorioService } from '../services/RelatorioService';

export class RelatorioController {
  /**
   * Lida com a requisição para gerar e retornar relatórios de vendas.
   */
  static async gerar(req: Request, res: Response) {
    try {
      const relatorios = await RelatorioService.gerarRelatorioVendas();
      return res.json(relatorios);
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      return res.status(500).json({ erro: "Não foi possível gerar o relatório." });
    }
  }
}