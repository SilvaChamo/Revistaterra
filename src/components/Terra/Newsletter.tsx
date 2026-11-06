'use client';

import { useState } from 'react';
import { GREEN } from '@/lib/terra';
import AntiSpamFields, { resetAntiSpam } from '@/components/Antispam/AntiSpamFields';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<{ kind: 'idle' | 'sending' | 'ok' | 'error'; text?: string }>({ kind: 'idle' });

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState({ kind: 'sending' });
    try {
      const antispam = Object.fromEntries(new FormData(e.currentTarget).entries());
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...antispam, email }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
      if (!res.ok) throw new Error(data.error || 'Não foi possível subscrever.');
      setEmail('');
      setState({ kind: 'ok', text: data.message || 'Subscrição feita. Obrigado!' });
    } catch (err) {
      setState({ kind: 'error', text: err instanceof Error ? err.message : 'Não foi possível subscrever.' });
    } finally {
      resetAntiSpam();
    }
  }

  return (
    <form onSubmit={submit}>
      <p className="mb-3 text-sm">Receba o Agro no E-mail: notícias, análises e conteúdos agro-ambientais directamente no seu e-mail.</p>
      {state.kind === 'ok' ? (
        <p className="text-sm font-semibold" style={{ color: GREEN }}>{state.text}</p>
      ) : (
        <>
          <div className="flex">
            <input required type="email" name="email" maxLength={254} autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="O seu e-mail" className="min-w-0 flex-1 border border-neutral-300 px-3 py-2 text-xs" />
            <button disabled={state.kind === 'sending'} className="px-4 text-xs font-bold uppercase text-white disabled:opacity-60" style={{ background: GREEN }}>{state.kind === 'sending' ? 'A enviar…' : 'Inscrever-se'}</button>
          </div>
          <div className="mt-3"><AntiSpamFields /></div>
          {state.kind === 'error' && <p className="mt-2 text-xs text-red-600">{state.text}</p>}
        </>
      )}
    </form>
  );
}
