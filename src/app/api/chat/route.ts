import { Mode } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { askClaude } from '@/lib/anthropic';
import { getPromptByMode } from '@/lib/prompts';
import { searchKnowledge } from '@/lib/kb';

export async function POST(req: NextRequest) {
  const { mode, chatId, message, attachedFileIds } = await req.json();

  if (!mode || !message) {
    return NextResponse.json({ error: 'mode e message são obrigatórios' }, { status: 400 });
  }

  const typedMode = mode as Mode;
  const prompt = await getPromptByMode(typedMode);

  const attachments = attachedFileIds?.length
    ? await prisma.attachment.findMany({ where: { id: { in: attachedFileIds } } })
    : [];

  const kb = await searchKnowledge(message);

  const attachmentContext = attachments
    .map((a) => `Arquivo: ${a.originalName}\n${a.extractedText || '(sem extração)'}`)
    .join('\n\n---\n\n');

  const kbContext = kb
    .map((k, i) => `KB #${i + 1} | ${k.title} | tags: ${k.tags}\n${k.snippet}`)
    .join('\n\n---\n\n');

  const finalUserPrompt = `Pergunta do usuário:\n${message}\n\nAnexos extraídos:\n${attachmentContext || '(nenhum)'}\n\nTrechos de base de conhecimento:\n${kbContext || '(nenhum)'}\n\nResponda em português, texto pronto para copiar/colar.`;

  const chat = chatId
    ? await prisma.chat.update({ where: { id: chatId }, data: { mode: typedMode } })
    : await prisma.chat.create({
        data: {
          mode: typedMode,
          title: message.slice(0, 80)
        }
      });

  await prisma.message.create({
    data: {
      chatId: chat.id,
      role: 'user',
      content: message,
      mode: typedMode
    }
  });

  // Produto usa somente Gemini para extração e Claude para resposta em Jurídico.
  // Para manter 2 IAs no MVP, respostas textuais também usam Claude.
  const assistantText = await askClaude({
    systemPrompt: typedMode === 'JURIDICO' ? `${prompt}\n\nRegra obrigatória: resposta jurídica formal.` : prompt,
    userPrompt: finalUserPrompt
  });

  const reply = await prisma.message.create({
    data: {
      chatId: chat.id,
      role: 'assistant',
      content: assistantText,
      mode: typedMode
    }
  });

  return NextResponse.json({ chatId: chat.id, message: reply, kbUsed: kb });
}
