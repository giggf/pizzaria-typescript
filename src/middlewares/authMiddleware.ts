import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Este é o segredo para assinar o token. Mantenha-o seguro!
// O ideal é usar variáveis de ambiente (arquivo .env)
const JWT_SECRET = 'SEU_SEGREDO_SUPER_SECRETO_E_LONGO_PARA_MAIOR_SEGURANCA';

// Precisamos estender a interface do Request do Express para adicionar nosso usuário
declare global {
  namespace Express {
    interface Request {
      usuario?: { id: number; role: string; };
    }
  }
}

// Middleware para verificar se o usuário está autenticado
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Acesso negado. Nenhum token fornecido.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: number; role: string; };
    req.usuario = payload; // Adiciona os dados do usuário (id e role) na requisição
    next(); // Continua para a próxima rota
  } catch (error) {
    return res.status(401).json({ erro: 'Token inválido ou expirado.' });
  }
};

// Middleware para verificar se o usuário é um Administrador
export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (req.usuario?.role !== 'admin') {
        return res.status(403).json({ erro: 'Acesso negado. Rota exclusiva para administradores.' });
    }
    next();
};