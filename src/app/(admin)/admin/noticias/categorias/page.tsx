'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Folder } from 'lucide-react';
import { SkeletonContent, SkeletonHeader } from '@/components/Admin/Skeleton';
import { adminCacheGet, adminCacheSet } from '@/lib/admin-cache';

type CategoryOption = { slug: string; label: string; count: number };

/** Categorias da Revista Terra: vêm só das notícias deste site (o servidor filtra por site), nunca de uma lista de outro site. */
export default function CategoriasPage() {
  const [categories, setCategories] = useState<CategoryOption[]>(() => adminCacheGet<CategoryOption[]>('category-counts') ?? []);
  const [loading, setLoading] = useState(() => adminCacheGet('category-counts') === undefined);

  useEffect(() => {
    fetch('/api/admin/categories', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!Array.isArray(data?.options)) return;
        adminCacheSet('category-counts', data.options);
        setCategories(data.options as CategoryOption[]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 text-[#2c3338]">
      {loading ? (
        <>
          <SkeletonHeader />
          <SkeletonContent />
        </>
      ) : (
        <>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#1d2327]">Categorias</h1>
            <p className="text-[#50575e] mt-1">Categorias das notícias da Revista Terra</p>
          </div>

          <div className="bg-white border border-[#ccd0d4] rounded-lg overflow-hidden">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="bg-[#f6f7f7] text-left font-bold border-b border-[#ccd0d4]">
                  <th className="p-4">Nome</th>
                  <th className="p-4">Slug</th>
                  <th className="p-4 text-center">Artigos</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.slug} className="border-b border-[#f0f0f1] hover:bg-[#f6f7f7]">
                    <td className="p-4">
                      <Link href={`/admin/noticias?categoria=${encodeURIComponent(category.slug)}`} className="flex items-center gap-2">
                        <Folder className="w-4 h-4 text-[#047857]" />
                        <span className="font-medium text-[#1d2327]">{category.label}</span>
                      </Link>
                    </td>
                    <td className="p-4 text-[#50575e]">
                      <span className="font-mono text-xs">{category.slug}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2 py-1 bg-[#047857]/10 text-[#047857] rounded-full text-xs font-semibold">{category.count}</span>
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
