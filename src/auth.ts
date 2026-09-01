import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { consultar, consultarUm } from './db.js';
import { producao } from './config.js';

export const COOKIE_SESSAO = 'ae_sessao';
const DURACAO_HORAS = 12;

export type UsuarioAdmin = {
  id: string;
  nome: string;
  email: string;
  papel: string;
  ativo: boolean;
};

export async function gerarHashSenha(senha: string) {
  return bcrypt.hash(senha, 12);
}

// Hash descartavel, so para gastar tempo. Sem ele, um e-mail inexistente
// respondia na hora e um e-mail real levava os ~264ms do bcrypt: a diferenca e
// visivel pela rede e revela quais enderecos sao administradores. Comparar
// contra este hash iguala os dois caminhos.
const HASH_DE_ESPERA = bcrypt.hashSync('comparacao-de-tempo-constante', 12);

export async function autenticar(email: string, senha: string): Promise<UsuarioAdmin | null> {
  const usuario = await consultarUm<UsuarioAdmin & { senha_hash: string }>(
    'SELECT id, nome, email, papel, ativo, senha_hash FROM admin_usuarios WHERE lower(email) = lower($1)',
    [email.trim()]
  );
  if (!usuario || !usuario.ativo) {
    await bcrypt.compare(senha, HASH_DE_ESPERA);
    return null;
  }
  const confere = await bcrypt.compare(senha, usuario.senha_hash);
  if (!confere) return null;
  return { id: usuario.id, nome: usuario.nome, email: usuario.email, papel: usuario.papel, ativo: usuario.ativo };
}

export async function abrirSessao(reply: FastifyReply, usuario: UsuarioAdmin, ip: string, userAgent: string) {
  const token = crypto.randomBytes(32).toString('hex');
  const expira = new Date(Date.now() + DURACAO_HORAS * 3600 * 1000);
  await consultar(
    'INSERT INTO admin_sessoes (token, usuario_id, ip, user_agent, expira_em) VALUES ($1,$2,$3,$4,$5)',
    [token, usuario.id, ip, userAgent.slice(0, 400), expira]
  );
  await consultar('UPDATE admin_usuarios SET ultimo_acesso = now() WHERE id = $1', [usuario.id]);
  reply.setCookie(COOKIE_SESSAO, token, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: producao,
    signed: true,
    maxAge: DURACAO_HORAS * 3600
  });
}

export async function fecharSessao(request: FastifyRequest, reply: FastifyReply) {
  const bruto = request.cookies[COOKIE_SESSAO];
  if (bruto) {
    const aberto = request.unsignCookie(bruto);
    if (aberto.valid && aberto.value) {
      await consultar('DELETE FROM admin_sessoes WHERE token = $1', [aberto.value]);
    }
  }
  reply.clearCookie(COOKIE_SESSAO, { path: '/' });
}

export async function usuarioDaRequisicao(request: FastifyRequest): Promise<UsuarioAdmin | null> {
  const bruto = request.cookies[COOKIE_SESSAO];
  if (!bruto) return null;
  const aberto = request.unsignCookie(bruto);
  if (!aberto.valid || !aberto.value) return null;
  const linha = await consultarUm<UsuarioAdmin>(
    `SELECT u.id, u.nome, u.email, u.papel, u.ativo
       FROM admin_sessoes s
       JOIN admin_usuarios u ON u.id = s.usuario_id
      WHERE s.token = $1 AND s.expira_em > now() AND u.ativo = TRUE`,
    [aberto.value]
  );
  return linha;
}

export async function limparSessoesExpiradas() {
  await consultar('DELETE FROM admin_sessoes WHERE expira_em < now()');
}
