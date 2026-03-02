'use client';

import { useEffect, useState } from 'react';

type Chat = {
  id: string;
  title: string;
  mode: 'ATENDIMENTO' | 'JURIDICO' | 'ANALISE_PETICOES';
  messages: { id: string; role: string; content: string }[];
};

export function ChatApp() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [mode, setMode] = useState<'ATENDIMENTO' | 'JURIDICO' | 'ANALISE_PETICOES'>('ATENDIMENTO');
  const [chatId, setChatId] = useState<string | undefined>(undefined);
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  async function loadChats() {
    const res = await fetch('/api/chats');
    if (!res.ok) {
      setError('Falha ao carregar chats');
      return;
    }

    const data = await res.json();
    setChats(data.chats || []);
  }

  useEffect(() => {
    loadChats();
  }, []);

  const selected = chats.find((c) => c.id === chatId);

  async function handleSend() {
    if (!message.trim()) return;
    setSending(true);
    setError('');

    try {
      const attachedFileIds: string[] = [];
      if (files?.length) {
        for (const file of Array.from(files)) {
          const form = new FormData();
          form.append('file', file);
          form.append('kind', 'chat');
          const up = await fetch('/api/upload', { method: 'POST', body: form });
          if (!up.ok) {
            const upData = await up.json().catch(() => ({}));
            setError(upData.error || 'Erro ao enviar anexo');
            return;
          }
          const upData = await up.json();
          attachedFileIds.push(upData.attachment.id);
        }
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, chatId, message, attachedFileIds })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Erro ao enviar mensagem');
        return;
      }

      setChatId(data.chatId);
      setMessage('');
      setFiles(null);
      await loadChats();
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="row" style={{ alignItems: 'flex-start' }}>
      <div className="card" style={{ width: 290 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Chats</div>
        <button onClick={() => setChatId(undefined)}>+ Novo chat</button>
        <div style={{ marginTop: 10 }}>
          {chats.map((c) => (
            <div key={c.id} style={{ marginBottom: 8 }}>
              <button
                onClick={() => {
                  setChatId(c.id);
                  setMode(c.mode);
                }}
                style={{ width: '100%', textAlign: 'left' }}
              >
                {c.title}
                <div className="small">{c.mode}</div>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ flex: 1 }}>
        <div className="row" style={{ marginBottom: 10 }}>
          <select value={mode} onChange={(e) => setMode(e.target.value as never)}>
            <option value="ATENDIMENTO">Atendimento</option>
            <option value="JURIDICO">Jurídico (Claude obrigatório)</option>
            <option value="ANALISE_PETICOES">Análise de Petições</option>
          </select>
          <input type="file" multiple onChange={(e) => setFiles(e.target.files)} />
        </div>

        {error && <p>{error}</p>}

        <div style={{ minHeight: 320, marginBottom: 10 }}>
          {(selected?.messages || []).map((m) => (
            <div key={m.id} className={`message ${m.role}`}>
              <strong>{m.role === 'assistant' ? 'Assistente' : 'Você'}:</strong>
              <div>{m.content}</div>
            </div>
          ))}
        </div>

        <textarea
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Escreva sua mensagem..."
          style={{ width: '100%', marginBottom: 10 }}
        />
        <button disabled={sending} onClick={handleSend}>
          {sending ? 'Enviando...' : 'Enviar'}
        </button>
      </div>
    </div>
  );
}
