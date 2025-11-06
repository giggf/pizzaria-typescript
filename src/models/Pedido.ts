import { Cliente } from './Cliente';
import { Produto } from './Produto';

export interface ItemPedido {
  produto: Produto;
  quantidade: number;
  precoUnitario: number;
}

export interface Pedido {
  id: number;
  cliente: Cliente;
  itens: ItemPedido[];
  total: number;
  formaPagamento: 'credito' | 'debito' | 'dinheiro' | 'pix';
  data: Date;
}