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
        lastError = new Error(`Claude transient error (${response.status}): ${body}`);
      } else {
        return response;
      }
    } catch (error) {
      lastError = error;
    }

    await new Promise((resolve) => setTimeout(resolve, attempt * 400));
  }

  throw lastError instanceof Error ? lastError : new Error('Claude request failed');
}

export async function askClaude(params: {
  systemPrompt: string;
  userPrompt: string;
}) {
  const key = process.env.ANTHROPIC_API_KEY;
  const model = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';

  if (!key) {
    return 'ANTHROPIC_API_KEY não configurada. Não foi possível gerar resposta.';
  }

  const response = await withRetry(async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      return await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01'
        },
        signal: controller.signal,
        body: JSON.stringify({
          model,
          max_tokens: 2048,
          system: params.systemPrompt,
          messages: [{ role: 'user', content: params.userPrompt }]
        })
      });
    } finally {
      clearTimeout(timeout);
    }
  });

  if (!response.ok) {
    const txt = await response.text();
    throw new Error(`Claude error: ${txt}`);
  }

  const data = await response.json();
  return data?.content?.map((part: { type: string; text?: string }) => (part.type === 'text' ? part.text : '')).join('\n') || '';
}
