'use client';

import { useEffect, useState } from 'react';

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

  async function load() {
    const res = await fetch('/api/admin/knowledge');
    if (!res.ok) return;
    const data = await res.json();
    setDocs(data.docs || []);
  }

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
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !doc.active })
    });
    await load();
  }

  return (
    <div className="card">
      <h2>Base de conhecimento</h2>
      <div className="row" style={{ marginBottom: 10 }}>
        <input placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input placeholder="Tags (vírgula)" value={tags} onChange={(e) => setTags(e.target.value)} />
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <button onClick={createDoc}>Upload na KB</button>
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
