'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function submit() {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    if (!res.ok) {
      setError('Senha inválida');
      return;
    }
    router.push('/admin/prompts');
  }

  return (
    <div className="card" style={{ maxWidth: 400 }}>
      <h2>Admin Login</h2>
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" />
      <button onClick={submit} style={{ marginLeft: 8 }}>Entrar</button>
      {error && <p>{error}</p>}
    </div>
  );
}
