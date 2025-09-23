export type CategoriaProduto = 'pizza' | 'pizzas doces' | 'bebida' | 'sobremesa'; 

export interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  categoria: CategoriaProduto;
}