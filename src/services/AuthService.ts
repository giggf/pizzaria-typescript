// src/services/AuthService.ts

import { pool } from '../database/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// ... (o resto do seu código AuthService permanece igual)
const JWT_SECRET = 'SEU_SEGREDO_SUPER_SECRETO_E_LONGO_PARA_MAIOR_SEGURANCA';

export class AuthService {
  async register(data: any) {
    const { nome, telefone, email, senha, endereco } = data;

    // 1. Verifica se o email já existe
    const userExists = await pool.query('SELECT * FROM clientes WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      throw new Error('Este email já está cadastrado.');
    }

    // 2. Criptografa a senha
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

      

    // 3. Insere o novo cliente no banco
    const query = 'INSERT INTO clientes (nome, telefone, email, senha, endereco) VALUES ($1, $2, $3, $4, $5) RETURNING id, nome, email, role';
    const values = [nome, telefone, email, senhaHash, endereco];
    const result = await pool.query(query, values);

    return result.rows[0];
  }

  async login(email: string, senha: string) {
    // 1. Encontra o usuário pelo email
    const result = await pool.query('SELECT * FROM clientes WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      throw new Error('Credenciais inválidas.'); // Não especifique se é email ou senha
    }
    const usuario = result.rows[0];

    // 2. Compara a senha enviada com a senha criptografada no banco
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      throw new Error('Credenciais inválidas.');
    }

    // 3. Gera o token JWT
    const tokenPayload = { id: usuario.id, role: usuario.role };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1d' }); // Token expira em 1 dia

    return { token, usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, role: usuario.role } };
  }
}