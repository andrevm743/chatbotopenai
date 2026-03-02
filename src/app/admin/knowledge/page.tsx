'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Doc = {
  id: string;
  title: string;
  tags: string;
  active: boolean;
  extractedText: string;
};

export default function AdminKnowledgePage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function load() {
    setError('');
    const res = await fetch('/api/admin/knowledge');
    if (res.status === 401) {
      router.push('/admin/login');
      return;
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Erro ao carregar base');
      return;
    }

    const data = await res.json();
    setDocs(data.docs || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function createDoc() {
    if (!file) return;
    setSaving(true);
    setError('');

    try {
      const form = new FormData();
      form.append('file', file);
      form.append('kind', 'kb');

      const up = await fetch('/api/upload', { method: 'POST', body: form });
      if (!up.ok) {
        const data = await up.json().catch(() => ({}));
        setError(data.error || 'Erro no upload');
        return;
      }

      const upData = await up.json();

      const create = await fetch('/api/admin/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title || file.name, tags, attachmentId: upData.attachment.id })
      });

      if (create.status === 401) {
        router.push('/admin/login');
        return;
      }

      if (!create.ok) {
        const data = await create.json().catch(() => ({}));
        setError(data.error || 'Erro ao cadastrar documento');
        return;
      }

      setTitle('');
      setTags('');
      setFile(null);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function toggle(doc: Doc) {
    setError('');
    const res = await fetch(`/api/admin/knowledge/${doc.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !doc.active })
    });

    if (res.status === 401) {
      router.push('/admin/login');
      return;
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Erro ao alterar status');
      return;
    }

    await load();
  }

  return (
    <div className="card">
      <h2>Base de conhecimento</h2>
      {error && <p>{error}</p>}
      <div className="row" style={{ marginBottom: 10 }}>
        <input placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input placeholder="Tags (vírgula)" value={tags} onChange={(e) => setTags(e.target.value)} />
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <button onClick={createDoc} disabled={saving}>{saving ? 'Enviando...' : 'Upload na KB'}</button>
      </div>

      {docs.map((d) => (
        <div key={d.id} className="card" style={{ marginBottom: 10 }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <strong>{d.title}</strong>
            <button onClick={() => toggle(d)}>{d.active ? 'Desativar' : 'Ativar'}</button>
          </div>
          <div className="small">Tags: {d.tags}</div>
          <details>
            <summary>Ver extractedText</summary>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{d.extractedText}</pre>
          </details>
        </div>
      ))}
    </div>
  );
}
