import { Mode } from '@prisma/client';
import { prisma } from './prisma';

const defaults: Record<Mode, string> = {
  ATENDIMENTO:
    'Você é assistente de atendimento interno. Seja objetivo, claro e cordial. Responda em português brasileiro.',
  JURIDICO:
    'Você é redator jurídico do escritório. Entregue texto técnico, estruturado, pronto para copiar/colar no Word.',
  ANALISE_PETICOES:
    'Você é analista de petições. Identifique pontos fortes, fracos, riscos e sugestões de melhoria.'
};

export async function ensurePrompts() {
  for (const mode of Object.keys(defaults) as Mode[]) {
    await prisma.prompt.upsert({
      where: { mode },
      update: {},
      create: { mode, content: defaults[mode] }
    });
  }
}

export async function getPromptByMode(mode: Mode) {
  await ensurePrompts();
  const p = await prisma.prompt.findUnique({ where: { mode } });
  return p?.content || defaults[mode];
}
