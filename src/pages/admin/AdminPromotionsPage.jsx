import React, { useState } from 'react';
import { collection, deleteDoc, doc, orderBy, query, addDoc, updateDoc } from 'firebase/firestore';
import { useFirebase } from '../../context/FirebaseContext';
import useRealtimeCollection from '../../hooks/useRealtimeCollection';
import LoadingScreen from '../../components/LoadingScreen';

const emptyPromo = {
  title: '',
  description: '',
  startDate: '',
  endDate: '',
  isActive: true,
  ctaLabel: '',
  ctaUrl: '',
  order: 0,
};

export default function AdminPromotionsPage() {
  const { db } = useFirebase();
  const { data: promotions, loading } = useRealtimeCollection(
    () => query(collection(db, 'promotions'), orderBy('order', 'asc')),
    [db]
  );
  const [form, setForm] = useState(emptyPromo);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const startEdit = (promo) => {
    setEditingId(promo.id);
    setForm({ ...promo, startDate: promo.startDate?.toDate ? promo.startDate.toDate().toISOString().slice(0, 10) : promo.startDate, endDate: promo.endDate?.toDate ? promo.endDate.toDate().toISOString().slice(0, 10) : promo.endDate });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyPromo);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        startDate: form.startDate ? new Date(form.startDate) : null,
        endDate: form.endDate ? new Date(form.endDate) : null,
      };
      if (editingId) {
        await updateDoc(doc(db, 'promotions', editingId), payload);
      } else {
        await addDoc(collection(db, 'promotions'), payload);
      }
      resetForm();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this promotion?')) return;
    await deleteDoc(doc(db, 'promotions', id));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">Promotions</h1>
        <p className="text-sm text-white/60">Create homepage banners with promo text and validity.</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-3xl bg-white/5 p-6 text-sm text-white/80">
        <h2 className="text-lg font-semibold text-white">{editingId ? 'Edit promotion' : 'New promotion'}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            Title
            <input
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2"
              required
            />
          </label>
          <label className="flex flex-col gap-2 sm:col-span-2">
            Description
            <textarea
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2"
              rows={3}
              required
            ></textarea>
          </label>
          <label className="flex flex-col gap-2">
            Start date
            <input
              type="date"
              value={form.startDate}
              onChange={(event) => setForm((prev) => ({ ...prev, startDate: event.target.value }))}
              className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-2">
            End date
            <input
              type="date"
              value={form.endDate}
              onChange={(event) => setForm((prev) => ({ ...prev, endDate: event.target.value }))}
              className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-2">
            CTA label
            <input
              value={form.ctaLabel}
              onChange={(event) => setForm((prev) => ({ ...prev, ctaLabel: event.target.value }))}
              className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-2">
            CTA URL
            <input
              value={form.ctaUrl}
              onChange={(event) => setForm((prev) => ({ ...prev, ctaUrl: event.target.value }))}
              className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-2">
            Display order
            <input
              type="number"
              value={form.order}
              onChange={(event) => setForm((prev) => ({ ...prev, order: Number(event.target.value) }))}
              className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2"
            />
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.checked }))}
              className="h-4 w-4 rounded border-white/20"
            />
            Active
          </label>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button type="submit" disabled={saving} className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900">
            {saving ? 'Saving…' : 'Save promotion'}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="rounded-full bg-white/10 px-5 py-2 text-sm font-semibold text-white">
              Cancel
            </button>
          )}
        </div>
      </form>

      {loading && <LoadingScreen message="Loading promotions" />}

      <div className="grid gap-4 md:grid-cols-2">
        {promotions.map((promo) => (
          <div key={promo.id} className="rounded-3xl bg-white/5 p-6 text-sm text-white/80">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-white/60">{promo.isActive ? 'Active' : 'Inactive'}</p>
                <h3 className="text-lg font-semibold text-white">{promo.title}</h3>
                <p className="mt-2 text-white/70">{promo.description}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(promo)} className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                  Edit
                </button>
                <button onClick={() => handleDelete(promo.id)} className="rounded-full bg-rose-500/80 px-3 py-1 text-xs font-semibold text-white">
                  Delete
                </button>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-white/60">
              {promo.startDate && <span>Starts {promo.startDate?.toDate ? promo.startDate.toDate().toLocaleDateString() : promo.startDate}</span>}
              {promo.endDate && <span>Ends {promo.endDate?.toDate ? promo.endDate.toDate().toLocaleDateString() : promo.endDate}</span>}
              {promo.ctaLabel && <span>CTA: {promo.ctaLabel}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
