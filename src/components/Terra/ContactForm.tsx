'use client';

import { useState } from 'react';
import { GREEN } from '@/lib/terra';
import AntiSpamFields, { resetAntiSpam } from '@/components/Antispam/AntiSpamFields';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Redacção e correcções');
  const [message, setMessage] = useState('');
  const [state, setState] = useState<{ kind: 'idle' | 'sending' | 'ok' | 'error'; text?: string }>({ kind: 'idle' });

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState({ kind: 'sending' });

    try {
      const antispam = Object.fromEntries(new FormData(e.currentTarget).entries());
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...antispam, name, email, subject, message }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
      if (!res.ok) throw new Error(data.error || 'Não foi possível enviar a mensagem.');

      setName('');
      setEmail('');
      setMessage('');
      setState({ kind: 'ok', text: data.message || 'Mensagem enviada com sucesso. Obrigado pelo contacto!' });
    } catch (err) {
      setState({ kind: 'error', text: err instanceof Error ? err.message : 'Não foi possível enviar a mensagem.' });
    } finally {
      resetAntiSpam();
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 bg-white p-6 shadow-sm">
      <h2 className="text-[15px] font-bold uppercase" style={{ color: GREEN }}>Fale com a nossa equipa</h2>

      {state.kind === 'ok' ? (
        <p className="border-l-4 border-[#047857] bg-green-50 p-3 text-sm font-semibold text-green-800">
          {state.text}
        </p>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              required
              placeholder="Nome *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#047857]"
            />
            <input
              required
              type="email"
              placeholder="E-mail *"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#047857]"
            />
          </div>

          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#047857]"
          >
            <option>Redacção e correcções</option>
            <option>Publicidade e parcerias</option>
            <option>Outro assunto</option>
          </select>

          <textarea
            required
            rows={5}
            placeholder="Mensagem *"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#047857]"
          />

          <AntiSpamFields />

          {state.kind === 'error' && (
            <p className="border-l-4 border-red-600 bg-red-50 p-3 text-sm text-red-800">
              {state.text}
            </p>
          )}

          <button
            type="submit"
            disabled={state.kind === 'sending'}
            className="px-6 py-3 text-xs font-bold uppercase text-white transition-opacity disabled:opacity-60"
            style={{ background: GREEN }}
          >
            {state.kind === 'sending' ? 'A enviar…' : 'Enviar mensagem'}
          </button>
        </>
      )}
    </form>
  );
}
