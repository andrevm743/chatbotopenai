export async function extractTextWithGemini(params: {
  mimeType: string;
  base64Data: string;
  originalName: string;
}) {
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-pro';
  const key = process.env.GEMINI_API_KEY;
  if (!key) return '';

  const prompt = `Extraia o texto integral e limpo do arquivo anexado (${params.originalName}).\n\n- Preserve estrutura útil (títulos, itens).\n- Se for imagem/PDF escaneado, faça OCR completo.\n- Se for áudio, faça transcrição com melhor fidelidade possível.\n- Retorne apenas texto puro sem markdown.`;

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    }
  );

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Gemini error: ${txt}`);
  }

  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text || '').join('\n')?.trim() || '';
}
