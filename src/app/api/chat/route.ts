codex/create-internal-office-chat-web-app-njscch
import { NextRequest } from 'next/server';
import { askClaude } from '@/lib/anthropic';
import { AppError, fail, ok } from '@/lib/http';
import { searchKnowledge } from '@/lib/kb';
import { prisma } from '@/lib/prisma';
import { getPromptByMode } from '@/lib/prompts';
import { parseMode, parseOptionalString, parseRequiredString, parseStringArray } from '@/lib/validation';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const mode = parseMode(body?.mode);
    const message = parseRequiredString(body?.message, 'message', 12000);
    const chatId = parseOptionalString(body?.chatId, 100);
    const attachedFileIds = parseStringArray(body?.attachedFileIds, 20);

    const prompt = await getPromptByMode(mode);

    const attachments = attachedFileIds.length
      ? await prisma.attachment.findMany({ where: { id: { in: attachedFileIds } } })
      : [];

    if (attachments.length !== attachedFileIds.length) {
      throw new AppError(400, 'ATTACHMENTS_NOT_FOUND', 'Um ou mais anexos não foram encontrados');
    }

    const kb = await searchKnowledge(message);

    const attachmentContext = attachments
      .map((a) => `Arquivo: ${a.originalName}\n${a.extractedText || '(sem extração)'}`)
      .join('\n\n---\n\n');

    const kbContext = kb
      .map((k, i) => `KB #${i + 1} | ${k.title} | tags: ${k.tags}\n${k.snippet}`)
      .join('\n\n---\n\n');

    const finalUserPrompt = `Pergunta do usuário:\n${message}\n\nAnexos extraídos:\n${attachmentContext || '(nenhum)'}\n\nTrechos de base de conhecimento:\n${kbContext || '(nenhum)'}\n\nResponda em português, texto pronto para copiar/colar.`;

    const chat = chatId
      ? await prisma.chat.update({ where: { id: chatId }, data: { mode } }).catch(() => {
          throw new AppError(404, 'CHAT_NOT_FOUND', 'Chat não encontrado');
        })
      : await prisma.chat.create({
          data: {
            mode,
            title: message.slice(0, 80)
          }
        });

    const userMessage = await prisma.message.create({
      data: {
        chatId: chat.id,
        role: 'user',
        content: message,
        mode
      }
    });

    if (attachments.length) {
      await prisma.messageAttachment.createMany({
        data: attachments.map((attachment) => ({
          messageId: userMessage.id,
          attachmentId: attachment.id
        }))
      });
    }

    const assistantText = await askClaude({
      systemPrompt: mode === 'JURIDICO' ? `${prompt}\n\nRegra obrigatória: resposta jurídica formal.` : prompt,
      userPrompt: finalUserPrompt
    });

    const reply = await prisma.message.create({
      data: {
        chatId: chat.id,
        role: 'assistant',
        content: assistantText,
        mode
      }
    });

    return ok({ chatId: chat.id, message: reply, kbUsed: kb });
  } catch (error) {
    return fail(error);
  }
=======
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
main
}
