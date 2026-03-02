export const MODES = {
  ATENDIMENTO: 'ATENDIMENTO',
  JURIDICO: 'JURIDICO',
  ANALISE_PETICOES: 'ANALISE_PETICOES'
} as const;

export type Mode = keyof typeof MODES;
