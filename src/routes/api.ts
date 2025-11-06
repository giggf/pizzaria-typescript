import { Router } from 'express';
import { ClienteController } from '../controllers/ClienteController';
import { ProdutoController } from '../controllers/ProdutoController';
import { PedidoController } from '../controllers/PedidoController';
import { RelatorioController } from '../controllers/RelatorioController';

const router = Router();



// --- Rotas de Clientes ---
router.get('/clientes', ClienteController.listar);
router.post('/clientes', ClienteController.criar);

// --- Rotas de Produtos (Cardápio) ---
router.get('/produtos', ProdutoController.listar);
router.get('/produtos/:id', ProdutoController.buscarPorId);
router.post('/produtos', ProdutoController.criar);
router.delete('/produtos/:id', ProdutoController.excluir);
router.put('/produtos/:id', ProdutoController.editar); // <-- LINHA ADICIONADA

// --- Rotas de Pedidos ---
router.get('/pedidos', PedidoController.listar);
router.post('/pedidos', PedidoController.criar);

// --- Rotas de Relatórios ---
router.get('/relatorios/vendas', RelatorioController.gerar);

export default router;