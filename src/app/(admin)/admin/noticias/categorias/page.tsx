'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Folder, Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { SkeletonContent, SkeletonHeader } from '@/components/Admin/Skeleton';
import { adminCacheGet, adminCacheSet } from '@/lib/admin-cache';

type CategoryOption = { slug: string; label: string; description: string; count: number };
type Form = { name: string; description: string };

/** Categorias da Revista Terra: guardadas e lidas só deste site (cada site tem as suas). */
export default function CategoriasPage() {
  const [categories, setCategories] = useState<CategoryOption[]>(() => adminCacheGet<CategoryOption[]>('category-counts') ?? []);
  const [loading, setLoading] = useState(() => adminCacheGet('category-counts') === undefined);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editForm, setEditForm] = useState<Form>({ name: '', description: '' });
  const [newForm, setNewForm] = useState<Form>({ name: '', description: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const apply = (options: CategoryOption[]) => {
    adminCacheSet('category-counts', options);
    adminCacheSet('category-options', options);
    setCategories(options);
  };

  useEffect(() => {
    fetch('/api/admin/categories', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (Array.isArray(data?.options)) apply(data.options as CategoryOption[]); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const call = async (method: 'POST' | 'PUT' | 'DELETE', body?: object, query = '') => {
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/categories${query}`, {
        method,
        credentials: 'include',
        ...(body ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data?.error || 'Não foi possível guardar.'); return false; }
      if (Array.isArray(data?.options)) apply(data.options as CategoryOption[]);
      return true;
    } catch {
      setError('Sem ligação ao servidor. Tente de novo.');
      return false;
    } finally {
      setBusy(false);
    }
  };

  const handleEdit = (category: CategoryOption) => {
    setError('');
    setIsEditing(category.slug);
    setEditForm({ name: category.label, description: category.description });
  };

  const handleSave = async (slug: string) => {
    if (await call('PUT', { slug, ...editForm })) setIsEditing(null);
  };

  const handleAdd = async () => {
    if (!newForm.name.trim()) return;
    if (await call('POST', newForm)) {
      setNewForm({ name: '', description: '' });
      setIsAdding(false);
    }
  };

  const handleDelete = async (category: CategoryOption) => {
    if (!confirm(`Eliminar a categoria «${category.label}»?`)) return;
    await call('DELETE', undefined, `?slug=${encodeURIComponent(category.slug)}`);
  };

  return (
    <div className="p-6 text-[#2c3338]">
      {loading ? (
        <>
          <SkeletonHeader />
          <SkeletonContent />
        </>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold text-[#1d2327]">Categorias</h1>
              <p className="text-[#50575e] mt-1">Categorias das notícias da Revista Terra</p>
            </div>
            <button
              onClick={() => { setError(''); setIsAdding(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-[#047857] text-white rounded-md hover:bg-[#065f46]"
            >
              <Plus className="w-4 h-4" /> Adicionar Categoria
            </button>
          </div>

          {error && <p className="mb-4 text-[13px] text-red-600">{error}</p>}

          {isAdding && (
            <div className="bg-[#f6f7f7] border border-[#ccd0d4] rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-[#1d2327] mb-4">Nova Categoria</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1d2327] mb-1">Nome</label>
                  <input
                    type="text"
                    value={newForm.name}
                    onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                    className="w-full h-10 px-3 border border-[#ccd0d4] rounded-md"
                    placeholder="Ex: Reportagem"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1d2327] mb-1">Descrição</label>
                  <input
                    type="text"
                    value={newForm.description}
                    onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
                    className="w-full h-10 px-3 border border-[#ccd0d4] rounded-md"
                    placeholder="Breve descrição"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleAdd}
                  disabled={busy || !newForm.name.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-[#047857] text-white rounded-md hover:bg-[#065f46] disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> Guardar
                </button>
                <button
                  onClick={() => setIsAdding(false)}
                  className="flex items-center gap-2 px-4 py-2 border border-[#ccd0d4] rounded-md hover:bg-[#f6f7f7]"
                >
                  <X className="w-4 h-4" /> Cancelar
                </button>
              </div>
            </div>
          )}

          <div className="bg-white border border-[#ccd0d4] rounded-lg overflow-x-auto">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="bg-[#f6f7f7] text-left font-bold border-b border-[#ccd0d4]">
                  <th className="p-4">Nome</th>
                  <th className="p-4">Slug</th>
                  <th className="p-4">Descrição</th>
                  <th className="p-4 text-center">Artigos</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.slug} className="border-b border-[#f0f0f1] hover:bg-[#f6f7f7]">
                    <td className="p-4">
                      {isEditing === category.slug ? (
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full h-8 px-2 border border-[#ccd0d4] rounded"
                        />
                      ) : (
                        <Link href={`/admin/noticias?categoria=${encodeURIComponent(category.slug)}`} className="flex items-center gap-2">
                          <Folder className="w-4 h-4 text-[#047857]" />
                          <span className="font-medium text-[#1d2327]">{category.label}</span>
                        </Link>
                      )}
                    </td>
                    <td className="p-4 text-[#50575e]">
                      <span className="font-mono text-xs">{category.slug}</span>
                    </td>
                    <td className="p-4 text-[#50575e]">
                      {isEditing === category.slug ? (
                        <input
                          type="text"
                          value={editForm.description}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          className="w-full h-8 px-2 border border-[#ccd0d4] rounded"
                        />
                      ) : (
                        category.description
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2 py-1 bg-[#047857]/10 text-[#047857] rounded-full text-xs font-semibold">{category.count}</span>
                    </td>
                    <td className="p-4 text-right">
                      {isEditing === category.slug ? (
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleSave(category.slug)} disabled={busy} className="p-2 text-green-600 hover:bg-green-50 rounded disabled:opacity-50" aria-label="Guardar">
                            <Save className="w-4 h-4" />
                          </button>
                          <button onClick={() => setIsEditing(null)} className="p-2 text-gray-500 hover:bg-gray-100 rounded" aria-label="Cancelar">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleEdit(category)} className="p-2 text-[#047857] hover:bg-blue-50 rounded" aria-label="Editar">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(category)} disabled={busy} className="p-2 text-red-600 hover:bg-red-50 rounded disabled:opacity-50" aria-label="Eliminar">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-[13px] text-[#50575e]">{categories.length} categorias</div>
        </>
      )}
    </div>
  );
}
