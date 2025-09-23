import fs from 'fs';
import path from 'path';
import { Pedido } from '../models/Pedido';
import { ClienteService } from './ClienteService';
import { ProdutoService } from './ProdutoService';

let pedidos: Pedido[] = [];
let proximoId = 1;

interface ItemCarrinho {
  produtoId: number;
  quantidade: number;
}

export class PedidoService {
  
  static async criar(clienteId: number, itensCarrinho: ItemCarrinho[], formaPagamento: 'credito' | 'debito' | 'dinheiro' | 'pix'): Promise<Pedido | { erro: string }> {
    const cliente = ClienteService.buscarPorId(clienteId);
    if (!cliente) return { erro: `Cliente com ID ${clienteId} não encontrado.` };

    const itensDoPedido = [];
    let totalPedido = 0;
    for (const item of itensCarrinho) {
      const produto = ProdutoService.buscarPorId(item.produtoId);
      if (!produto) return { erro: `Produto com ID ${item.produtoId} não encontrado.` };
      itensDoPedido.push({ produto, quantidade: item.quantidade, precoUnitario: produto.preco });
      totalPedido += produto.preco * item.quantidade;
    }

    if (itensDoPedido.length === 0) return { erro: "O pedido deve ter pelo menos um item." };

    const novoPedido: Pedido = {
      id: proximoId++,
      cliente,
      itens: itensDoPedido,
      total: totalPedido,
      formaPagamento,
      data: new Date(),
    };
    pedidos.push(novoPedido);

    // Após criar o pedido, geramos e salvamos o comprovante.
    const comprovanteTexto = this.gerarComprovante(novoPedido);
    await this.salvarComprovanteEmTxt(novoPedido, comprovanteTexto);

    return novoPedido;
  }
  
  // Salva o texto do comprovante em um arquivo .txt
  private static async salvarComprovanteEmTxt(pedido: Pedido, comprovante: string): Promise<void> {
    const data = pedido.data;
    // Formata a data para criar um nome de arquivo único e organizado (ex: 2025-09-18_20-30-05)
    const timestamp = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}_${String(data.getHours()).padStart(2, '0')}-${String(data.getMinutes()).padStart(2, '0')}-${String(data.getSeconds()).padStart(2, '0')}`;
    
    // Define o nome do arquivo (ex: pedido-1-joao-silva-2025-09-18_20-30-05.txt)
    const nomeClienteFormatado = pedido.cliente.nome.replace(/ /g, '-').toLowerCase();
    const nomeArquivo = `pedido-${pedido.id}-${nomeClienteFormatado}-${timestamp}.txt`;
    
    // Define o caminho completo para o arquivo
    const caminhoArquivo = path.join(__dirname, '..', '..', 'comprovantes', nomeArquivo);

    try {
      // A mágica acontece aqui: fs.promises.writeFile escreve o conteúdo no arquivo.
      // O 'await' garante que o programa espere a escrita terminar.
      await fs.promises.writeFile(caminhoArquivo, comprovante, 'utf-8');
      console.log(`📄 Comprovante salvo em: ${caminhoArquivo}`);
    } catch (error) {
      // Se houver um erro ao salvar o arquivo, ele será mostrado no console do servidor,
      // mas a aplicação não vai quebrar. O cliente ainda receberá a confirmação do pedido.
      console.error(`❌ Erro ao salvar o comprovante para o pedido #${pedido.id}:`, error);
    }
  }

  // --- Nenhuma outra função precisa de alteração ---

  static listar(): Pedido[] { return pedidos; }
  
  static gerarComprovante(pedido: Pedido): string {
    let comprovante = `====================================\n`;
    comprovante += `      COMPROVANTE DE COMPRA\n`;
    comprovante += `====================================\n`;
    comprovante += `Pedido #${pedido.id}\n`;
    const dataFormatada = `${String(pedido.data.getDate()).padStart(2, '0')}/${String(pedido.data.getMonth() + 1).padStart(2, '0')}/${pedido.data.getFullYear()} ${String(pedido.data.getHours()).padStart(2, '0')}:${String(pedido.data.getMinutes()).padStart(2, '0')}:${String(pedido.data.getSeconds()).padStart(2, '0')}`;
    comprovante += `Data: ${dataFormatada}\n\n`;
    comprovante += `Cliente: ${pedido.cliente.nome}\n`;
    comprovante += `Telefone: ${pedido.cliente.telefone}\n`;
    comprovante += `------------------------------------\n`;
    comprovante += `Itens Comprados:\n`;
    for (const item of pedido.itens) {
        const totalItem = (item.quantidade * item.precoUnitario).toFixed(2).replace('.', ',');
        const precoUnitarioFmt = item.precoUnitario.toFixed(2).replace('.', ',');
        comprovante += `- ${item.quantidade}x ${item.produto.nome} (R$ ${precoUnitarioFmt}) = R$ ${totalItem}\n`;
    }
    comprovante += `------------------------------------\n`;
    const totalFmt = pedido.total.toFixed(2).replace('.', ',');
    const formaPagamentoFmt = pedido.formaPagamento.charAt(0).toUpperCase() + pedido.formaPagamento.slice(1);
    comprovante += `Forma de Pagamento: ${formaPagamentoFmt}\n`;
    comprovante += `\nTOTAL DO PEDIDO: R$ ${totalFmt}\n`;
    comprovante += `====================================\n`;
    comprovante += `   Obrigado pela preferência!\n`;
    comprovante += `====================================\n`;
    return comprovante;
  }
}