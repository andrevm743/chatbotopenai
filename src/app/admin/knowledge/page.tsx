'use client';

import { useEffect, useState } from 'react';
codex/create-internal-office-chat-web-app-njscch
import { useRouter } from 'next/navigation';
=======
main

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
codex/create-internal-office-chat-web-app-njscch
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

=======

  async function load() {
    const res = await fetch('/api/admin/knowledge');
    if (!res.ok) return;
main
    const data = await res.json();
    setDocs(data.docs || []);
  }

codex/create-internal-office-chat-web-app-njscch
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
=======
  useEffect(() => { load(); }, []);

  async function createDoc() {
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    form.append('kind', 'kb');
    const up = await fetch('/api/upload', { method: 'POST', body: form });
    const upData = await up.json();

    await fetch('/api/admin/knowledge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title || file.name, tags, attachmentId: upData.attachment.id })
    });

    setTitle('');
    setTags('');
    setFile(null);
    await load();
  }

  async function toggle(doc: Doc) {
    await fetch(`/api/admin/knowledge/${doc.id}`, {
main
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !doc.active })
    });
codex/create-internal-office-chat-web-app-njscch

    if (res.status === 401) {
      router.push('/admin/login');
      return;
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Erro ao alterar status');
      return;
    }

=======
main
    await load();
  }

  return (
    <div className="card">
      <h2>Base de conhecimento</h2>
codex/create-internal-office-chat-web-app-njscch
      {error && <p>{error}</p>}
=======
main
      <div className="row" style={{ marginBottom: 10 }}>
        <input placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input placeholder="Tags (vírgula)" value={tags} onChange={(e) => setTags(e.target.value)} />
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
codex/create-internal-office-chat-web-app-njscch
        <button onClick={createDoc} disabled={saving}>{saving ? 'Enviando...' : 'Upload na KB'}</button>
=======
        <button onClick={createDoc}>Upload na KB</button>
main
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
