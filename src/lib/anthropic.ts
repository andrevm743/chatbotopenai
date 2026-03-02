export async function askClaude(params: {
  systemPrompt: string;
  userPrompt: string;
}) {
  const key = process.env.ANTHROPIC_API_KEY;
  const model = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';

  if (!key) {
    return 'ANTHROPIC_API_KEY não configurada. Não foi possível gerar resposta.';
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model,
      max_tokens: 2048,
      system: params.systemPrompt,
      messages: [{ role: 'user', content: params.userPrompt }]
    })
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Claude error: ${txt}`);
  }

  const data = await res.json();
  return data?.content?.map((part: { type: string; text?: string }) => (part.type === 'text' ? part.text : '')).join('\n') || '';
}
