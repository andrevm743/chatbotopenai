import { Mode } from '@prisma/client';
import { AppError } from './http';

export const ALLOWED_MODES: Mode[] = ['ATENDIMENTO', 'JURIDICO', 'ANALISE_PETICOES'];

export function parseMode(value: unknown): Mode {
  if (typeof value !== 'string' || !ALLOWED_MODES.includes(value as Mode)) {
    throw new AppError(400, 'INVALID_MODE', 'Modo inválido');
  }
  return value as Mode;
}

export function parseOptionalString(value: unknown, max = 300): string | undefined {
  if (value == null) return undefined;
  if (typeof value !== 'string') throw new AppError(400, 'INVALID_STRING', 'Campo inválido');
  const v = value.trim();
  if (!v) return undefined;
  if (v.length > max) throw new AppError(400, 'INVALID_STRING', 'Campo excede tamanho máximo');
  return v;
}

export function parseRequiredString(value: unknown, field: string, max = 4000): string {
  if (typeof value !== 'string') throw new AppError(400, 'INVALID_FIELD', `${field} é obrigatório`);
  const v = value.trim();
  if (!v) throw new AppError(400, 'INVALID_FIELD', `${field} é obrigatório`);
  if (v.length > max) throw new AppError(400, 'INVALID_FIELD', `${field} excede tamanho máximo`);
  return v;
}

export function parseStringArray(value: unknown, maxItems = 20): string[] {
  if (value == null) return [];
  if (!Array.isArray(value)) throw new AppError(400, 'INVALID_ARRAY', 'Lista inválida');
  if (value.length > maxItems) throw new AppError(400, 'INVALID_ARRAY', 'Lista muito grande');
  const arr = value.map((v) => {
    if (typeof v !== 'string' || !v.trim()) throw new AppError(400, 'INVALID_ARRAY', 'Item inválido na lista');
    return v;
  });
  return arr;
}
