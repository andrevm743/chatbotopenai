const REQUEST_TIMEOUT_MS = 45_000;

async function withRetry(request: () => Promise<Response>) {
  let attempt = 0;
  let lastError: unknown;

  while (attempt < 3) {
    attempt += 1;
    try {
      const response = await request();
      if (response.status >= 500 || response.status === 429) {
        const body = await response.text();
        lastError = new Error(`Gemini transient error (${response.status}): ${body}`);
      } else {
        return response;
      }
    } catch (error) {
      lastError = error;
    }

    await new Promise((resolve) => setTimeout(resolve, attempt * 400));
  }

  throw lastError instanceof Error ? lastError : new Error('Gemini request failed');
}

export async function extractTextWithGemini(params: {
  mimeType: string;
  base64Data: string;
  originalName: string;
}) {
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-pro';
  const key = process.env.GEMINI_API_KEY;
  if (!key) return '';

  const prompt = `Extraia o texto integral e limpo do arquivo anexado (${params.originalName}).\n\n- Preserve estrutura útil (títulos, itens).\n- Se for imagem/PDF escaneado, faça OCR completo.\n- Se for áudio, faça transcrição com melhor fidelidade possível.\n- Retorne apenas texto puro sem markdown.`;

  const response = await withRetry(async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      return await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: params.mimeType,
                    data: params.base64Data
                  }
                }
              ]
            }
          ]
        })
      });
    } finally {
      clearTimeout(timeout);
    }
  });

  if (!response.ok) {
    const txt = await response.text();
    throw new Error(`Gemini error: ${txt}`);
  }

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text || '').join('\n')?.trim() || '';
}
