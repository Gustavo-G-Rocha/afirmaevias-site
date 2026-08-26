import pg from 'pg';
import { config, producao } from './config.js';

export const pool = new pg.Pool({
  connectionString: config.databaseUrl,
  ssl: producao ? { rejectUnauthorized: false } : undefined,
  max: 8,
  idleTimeoutMillis: 30_000
});

export async function consultar<T = any>(sql: string, parametros: any[] = []): Promise<T[]> {
  const resultado = await pool.query(sql, parametros);
  return resultado.rows as T[];
}

export async function consultarUm<T = any>(sql: string, parametros: any[] = []): Promise<T | null> {
  const linhas = await consultar<T>(sql, parametros);
  return linhas[0] ?? null;
}

export async function contar(sql: string, parametros: any[] = []): Promise<number> {
  const linha = await consultarUm<{ total: string }>(sql, parametros);
  return Number(linha?.total ?? 0);
}
