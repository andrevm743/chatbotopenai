'use client';

import { useEffect, useState } from 'react';

type Prompt = { mode: string; content: string };

export default function AdminPromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);

  async function load() {
    const res = await fetch('/api/admin/prompts');
    if (!res.ok) return;
    const data = await res.json();
    setPrompts(data.prompts);
  }

  useEffect(() => {
    load();
  }, []);

  async function save(mode: string, content: string) {
    await fetch('/api/admin/prompts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode, content })
    });
    await load();
  }

  return (
    <div className="card">
      <h2>Prompts por modo</h2>
      {prompts.map((p) => (
        <div key={p.mode} style={{ marginBottom: 16 }}>
          <h3>{p.mode}</h3>
          <textarea
            defaultValue={p.content}
            rows={6}
            style={{ width: '100%' }}
            onBlur={(e) => save(p.mode, e.target.value)}
          />
          <div className="small">Salva ao sair do campo.</div>
        </div>
      ))}
      <a href="/admin/knowledge">Ir para base de conhecimento</a>
    </div>
  );
}
