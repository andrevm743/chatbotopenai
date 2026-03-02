'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit() {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Falha ao autenticar');
        return;
      }

      router.push('/admin/prompts');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card" style={{ maxWidth: 400 }}>
      <h2>Admin Login</h2>
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" />
      <button onClick={submit} style={{ marginLeft: 8 }} disabled={loading}>
        {loading ? 'Entrando...' : 'Entrar'}
      </button>
      {error && <p>{error}</p>}
    </div>
  );
}
