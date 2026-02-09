'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit2, Trash2, X } from 'lucide-react';
import type { Product, ProductColor, Size } from '@/types';
import { useProducts } from '@/lib/hooks/useProducts';
import { createProduct, deleteProduct, updateProduct, type AdminProductInput } from '@/lib/api/adminProducts';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { formatIDR } from '@/lib/utils';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser';

const allSizes: Size[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function parseImages(input: string): string[] {
  return input
    .split(/[\n,]/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, '_');
}

function defaultForm(): AdminProductInput & { imagesText: string } {
  return {
    name: '',
    slug: '',
    description: '',
    price: 0,
    images: [],
    imagesText: '',
    sizes: ['M', 'L', 'XL'],
    colors: [{ code: '#000000', name: 'Black' }],
    in_stock: true,
    is_customizable: true,
  };
}

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useProducts({});

  const [searchTerm, setSearchTerm] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(defaultForm());
  const [newColorCode, setNewColorCode] = useState('#ffffff');
  const [newColorName, setNewColorName] = useState('');
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ productId, input }: { productId: string; input: Partial<AdminProductInput> }) =>
      updateProduct(productId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const uploadProductImages = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploadError(null);
    setIsUploadingImages(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const uploadedUrls: string[] = [];

      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue;

        const uuid =
          typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
        const path = `products/${uuid}/${Date.now()}-${safeFileName(file.name)}`;

        const { error } = await supabase.storage
          .from('product-images')
          .upload(path, file, { contentType: file.type, upsert: false });

        if (error) throw error;

        const { data } = supabase.storage.from('product-images').getPublicUrl(path);
        if (!data?.publicUrl) {
          throw new Error('Failed to get public URL');
        }

        uploadedUrls.push(data.publicUrl);
      }

      if (uploadedUrls.length > 0) {
        setForm((p) => {
          const nextImages = [...(p.images ?? []), ...uploadedUrls];
          return {
            ...p,
            images: nextImages,
            imagesText: nextImages.join('\n'),
          };
        });
      }
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsUploadingImages(false);
    }
  };

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const products = useMemo(() => {
    const list = data ?? [];
    return list.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.slug.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [data, searchTerm]);

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm());
    setNewColorCode('#ffffff');
    setNewColorName('');
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      slug: p.slug,
      description: p.description ?? '',
      price: p.price,
      images: p.images ?? [],
      imagesText: (p.images ?? []).join('\n'),
      sizes: p.sizes ?? [],
      colors: p.colors ?? [],
      in_stock: p.in_stock,
      is_customizable: p.is_customizable,
    });
    setNewColorCode('#ffffff');
    setNewColorName('');
    setModalOpen(true);
  };

  const saving = createMutation.isPending || updateMutation.isPending;

  const canSave =
    form.name.trim().length > 0 &&
    form.slug.trim().length > 0 &&
    form.price >= 0 &&
    form.sizes.length > 0 &&
    form.colors.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500">Admin-only catalog management</p>
        </div>
        <Button variant="primary" leftIcon={Plus} onClick={openCreate}>
          Add product
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="Search by name or slug..."
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-3" />
          <div className="h-4 bg-gray-200 rounded w-full mb-2" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="font-semibold text-gray-900 mb-2">Failed to load products</p>
          <p className="text-sm text-gray-600">{String(error)}</p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <p className="text-gray-900 font-semibold mb-1">No products</p>
          <p className="text-sm text-gray-600 mb-4">Add your first catalog item.</p>
          <Button onClick={openCreate}>Add product</Button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left text-xs font-semibold text-gray-600 px-5 py-3">Name</th>
                  <th className="text-left text-xs font-semibold text-gray-600 px-5 py-3">Price</th>
                  <th className="text-left text-xs font-semibold text-gray-600 px-5 py-3">Stock</th>
                  <th className="text-right text-xs font-semibold text-gray-600 px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-t border-gray-100">
                    <td className="px-5 py-4">
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{p.name}</p>
                        <p className="text-xs text-gray-500 truncate">/{p.slug}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700">{formatIDR(p.price)}</td>
                    <td className="px-5 py-4 text-sm">
                      {p.in_stock ? (
                        <span className="text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded-md">
                          In stock
                        </span>
                      ) : (
                        <span className="text-red-700 bg-red-50 border border-red-200 px-2 py-1 rounded-md">
                          Out
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(p)}
                          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                          aria-label="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteMutation.mutate(p.id)}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-600 disabled:opacity-60"
                          aria-label="Delete"
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => {
          if (!saving) setModalOpen(false);
        }}
        title={editing ? 'Edit product' : 'Add product'}
        size="lg"
      >
        <div className="space-y-5">
          {(createMutation.error || updateMutation.error) && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {String(createMutation.error ?? updateMutation.error)}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
              <input
                value={form.name}
                onChange={(e) => {
                  const nextName = e.target.value;
                  setForm((prev) => ({
                    ...prev,
                    name: nextName,
                    slug: prev.slug ? prev.slug : slugify(nextName),
                  }));
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Slug</label>
              <input
                value={form.slug}
                onChange={(e) => setForm((p) => ({ ...p, slug: slugify(e.target.value) }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <p className="text-xs text-gray-500 mt-1">Must be unique.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Price (IDR)</label>
              <input
                type="number"
                min={0}
                value={form.price}
                onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Images (URLs)</label>
              <textarea
                value={form.imagesText}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    imagesText: e.target.value,
                    images: parseImages(e.target.value),
                  }))
                }
                rows={3}
                placeholder="One URL per line (or comma-separated)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <div className="mt-3 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-gray-500">
                    You can also upload image files (admin only). Uploaded URLs will be appended.
                  </p>
                  {isUploadingImages ? (
                    <span className="text-xs text-gray-600">Uploading...</span>
                  ) : null}
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  disabled={isUploadingImages}
                  onChange={(e) => void uploadProductImages(e.target.files)}
                  className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                />
                {uploadError ? (
                  <p className="text-sm text-red-600">{uploadError}</p>
                ) : null}
                {form.images.length > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {form.images.slice(0, 8).map((src, idx) => (
                      <div
                        key={`${src}-${idx}`}
                        className="px-2 py-1 rounded border border-gray-200 bg-gray-50 text-xs text-gray-700 max-w-[280px] truncate"
                        title={src}
                      >
                        {idx + 1}. {src}
                      </div>
                    ))}
                    {form.images.length > 8 ? (
                      <span className="text-xs text-gray-500">+{form.images.length - 8} more</span>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div>
            <p className="block text-sm font-semibold text-gray-700 mb-2">Sizes</p>
            <div className="flex flex-wrap gap-2">
              {allSizes.map((s) => {
                const active = form.sizes.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      active
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
                    }`}
                    onClick={() => {
                      setForm((p) => ({
                        ...p,
                        sizes: active ? p.sizes.filter((x) => x !== s) : [...p.sizes, s],
                      }));
                    }}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="block text-sm font-semibold text-gray-700 mb-2">Colors</p>
            <div className="space-y-2">
              {form.colors.map((c) => (
                <div key={`${c.code}-${c.name}`} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full border border-gray-300" style={{ backgroundColor: c.code }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{c.name}</p>
                    <p className="text-xs text-gray-500 truncate">{c.code}</p>
                  </div>
                  <button
                    type="button"
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                    onClick={() =>
                      setForm((p) => ({ ...p, colors: p.colors.filter((x) => !(x.code === c.code && x.name === c.name)) }))
                    }
                    aria-label="Remove color"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-3 grid md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Code</label>
                <input
                  value={newColorCode}
                  onChange={(e) => setNewColorCode(e.target.value)}
                  placeholder="#000000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Name</label>
                <div className="flex gap-2">
                  <input
                    value={newColorName}
                    onChange={(e) => setNewColorName(e.target.value)}
                    placeholder="Black"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!newColorName.trim() || !newColorCode.trim()}
                    onClick={() => {
                      const next: ProductColor = { code: newColorCode.trim(), name: newColorName.trim() };
                      setForm((p) => ({
                        ...p,
                        colors: [...p.colors.filter((c) => !(c.code === next.code && c.name === next.name)), next],
                      }));
                      setNewColorName('');
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.in_stock}
                onChange={(e) => setForm((p) => ({ ...p, in_stock: e.target.checked }))}
              />
              In stock
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.is_customizable}
                onChange={(e) => setForm((p) => ({ ...p, is_customizable: e.target.checked }))}
              />
              Customizable
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              disabled={saving}
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="flex-1"
              disabled={!canSave || saving}
              loading={saving}
              onClick={async () => {
                const base: AdminProductInput = {
                  name: form.name.trim(),
                  slug: form.slug.trim(),
                  description: form.description,
                  price: Number(form.price),
                  images: parseImages(form.imagesText),
                  sizes: form.sizes,
                  colors: form.colors,
                  in_stock: form.in_stock,
                  is_customizable: form.is_customizable,
                };

                if (editing) {
                  await updateMutation.mutateAsync({ productId: editing.id, input: base });
                } else {
                  await createMutation.mutateAsync(base);
                }
                setModalOpen(false);
              }}
            >
              {editing ? 'Save changes' : 'Create product'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
