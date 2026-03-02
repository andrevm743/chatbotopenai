'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Prompt = { mode: string; content: string };

export default function AdminPromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [error, setError] = useState('');
  const router = useRouter();

  async function load() {
    setError('');
    const res = await fetch('/api/admin/prompts');
    if (res.status === 401) {
      router.push('/admin/login');
      return;
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Erro ao carregar prompts');
      return;
    }

    const data = await res.json();
    setPrompts(data.prompts);
  }

  useEffect(() => {
    load();
  }, []);

  async function save(mode: string, content: string) {
    const res = await fetch('/api/admin/prompts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode, content })
    });

    if (res.status === 401) {
      router.push('/admin/login');
      return;
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Erro ao salvar prompt');
      return;
    }

    await load();
  }

  async function logout() {
    await fetch('/api/admin/login', { method: 'DELETE' });
    router.push('/admin/login');
  }

  return (
    <div className="card">
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Prompts por modo</h2>
        <button onClick={logout}>Sair</button>
      </div>
      {error && <p>{error}</p>}
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
