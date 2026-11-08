'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { destinoDepoisDeEntrar, proximoDoEndereco } from '@/lib/auth';
import { Mail, Lock, ChevronRight, Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import Spinner from '@/components/Common/Spinner';

export default function LoginPage() {
  const { login, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('erro');
    if (code === 'google-config') setError('A entrada com o Google ainda não está configurada.');
    else if (code === 'suspensa') setError('Esta conta está suspensa na Revista Terra.');
    else if (code) setError('Não foi possível entrar com o Google. Tente outra vez.');
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace(destinoDepoisDeEntrar(user.role, proximoDoEndereco(), user.colunista === true));
    }
  }, [authLoading, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      // o redireccionamento é feito acima, assim que a sessão fica aberta: leitores vão para a área de assinantes, a redacção para o painel
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao entrar. Tente novamente.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Mostra o formulário logo; só cobre com spinner se já houver user a redireccionar
  if (user) {
    return (
      <div className="min-h-screen bg-[#f0f0f1] flex items-center justify-center">
        <Spinner size={32} className="" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f0f1] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* logotipo por fora do formulário, sobre o fundo */}
        <div className="mb-5 flex justify-center">
          <Link href="/" aria-label="Ir para a página inicial"><img src="/terra/logo-revista-terra.webp" alt="Revista Terra — A Voz do Agro e Ambiente" width={446} height={220} className="h-[84px] w-auto mix-blend-multiply" /></Link>
        </div>
      <div className="w-full bg-white shadow-xl border border-[#ccd0d4] overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          {error && (
            <div className="flex items-start gap-2 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail ou utilizador</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  required
                  type="text"
                  autoComplete="username"
                  placeholder="E-mail ou utilizador"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:ring-2 focus:ring-[#047857] focus:border-transparent outline-none transition-all"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Palavra-passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  required
                  autoComplete="current-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  minLength={6}
                  className="w-full pl-10 pr-11 py-2 border border-gray-300 focus:ring-2 focus:ring-[#047857] focus:border-transparent outline-none transition-all"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#047857] text-white font-bold hover:bg-[#065f46] transition-all shadow-md flex items-center justify-center gap-2 group disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Entrar no Painel
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <div className="-my-1 flex items-center gap-3 text-xs text-gray-400">
            <span className="h-px flex-1 bg-gray-200" />ou<span className="h-px flex-1 bg-gray-200" />
          </div>
          <button
            type="button"
            onClick={() => window.location.assign('/api/auth/google')}
            className="w-full py-2.5 border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 flex items-center justify-center gap-2"
          >
            <svg viewBox="0 0 48 48" className="w-5 h-5" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.5 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z"/><path fill="#FBBC05" d="M10.5 28.7c-.5-1.5-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.8 2.3-8.4 2.3-6.3 0-11.6-4-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/></svg>
            Continuar com o Google
          </button>

          <div className="flex items-center justify-between gap-3 text-xs">
            <Link href="/recuperar-senha" className="whitespace-nowrap text-[#047857] hover:underline font-medium">Recuperar senha</Link>
            <Link href="/register" className="whitespace-nowrap text-[#047857] hover:underline font-medium">Registe-se aqui</Link>
          </div>
        </form>
      </div>
      </div>
    </div>
  );
}
