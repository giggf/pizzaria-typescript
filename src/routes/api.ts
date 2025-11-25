
import { Router } from 'express';
import { authMiddleware, adminMiddleware } from '../middlewares/authMiddleware';

// Importa todas as funções dos controllers
import * as AuthController from '../controllers/AuthController';
import * as ClienteController from '../controllers/ClienteController';
import * as ProdutoController from '../controllers/ProdutoController';
import * as PedidoController from '../controllers/PedidoController';
import * as RelatorioController from '../controllers/RelatorioController';

const router = Router();

// --- ROTAS DE AUTENTICAÇÃO (Públicas) ---
router.post('/auth/register', AuthController.register);
router.post('/auth/login', AuthController.login);
router.get('/auth/me', authMiddleware, AuthController.getMe); // Precisa estar logado para saber quem é

// --- ROTAS DE CLIENTE (Precisa estar logado) ---
router.post('/pedidos', authMiddleware, PedidoController.createPedido);

// Rota para clientes logados verem os produtos (agora é protegida)
router.get('/produtos', authMiddleware, ProdutoController.getAllProdutos);
router.get('/produtos/search', authMiddleware, ProdutoController.searchProdutos);

// --- ROTAS DE ADMIN (Precisa ser admin) ---

// Gerenciamento de Clientes
router.get('/clientes', authMiddleware, adminMiddleware, ClienteController.getAllClientes);
router.get('/clientes/search', authMiddleware, adminMiddleware, ClienteController.searchClientes);
router.delete('/clientes/:id', authMiddleware, adminMiddleware, ClienteController.deleteCliente);

// Gerenciamento de Produtos
router.post('/produtos', authMiddleware, adminMiddleware, ProdutoController.createProduto);
router.put('/produtos/:id', authMiddleware, adminMiddleware, ProdutoController.updateProduto);
// ATENÇÃO: a rota de promoção no seu antigo produto controller era PATCH, vamos manter
// router.patch('/produtos/:id/promocao', authMiddleware, adminMiddleware, ProdutoController.updatePromocao);
router.delete('/produtos/:id', authMiddleware, adminMiddleware, ProdutoController.deleteProduto);
router.get('/produtos/:id', authMiddleware, adminMiddleware, ProdutoController.getProdutoById); // Admin também pode ver por ID

// Gerenciamento de Pedidos
router.get('/pedidos', authMiddleware, adminMiddleware, PedidoController.getAllPedidos);
router.delete('/pedidos/:id', authMiddleware, adminMiddleware, PedidoController.deletePedido);

// Relatórios
router.get('/relatorios/periodo', authMiddleware, adminMiddleware, RelatorioController.getRelatorioPeriodo);

export default router;