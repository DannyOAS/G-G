import React, { useState } from 'react';
import { collection, deleteDoc, doc, orderBy, query, addDoc, updateDoc } from 'firebase/firestore';
import { useFirebase } from '../../context/FirebaseContext';
import useRealtimeCollection from '../../hooks/useRealtimeCollection';
import { useFirestore } from '../../lib/firestore';
import LoadingScreen from '../../components/LoadingScreen';

const emptyMedia = {
  caption: '',
  serviceId: '',
  mediaType: 'image',
  url: '',
  order: 0,
};

export default function AdminGalleryPage() {
  const { db } = useFirebase();
  const { uploadFile } = useFirestore();
  const { data: mediaItems, loading } = useRealtimeCollection(
    () => query(collection(db, 'gallery'), orderBy('order', 'asc')),
    [db]
  );
  const [form, setForm] = useState(emptyMedia);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (file) {
        const fileName = `${Date.now()}-${file.name}`;
        payload.url = await uploadFile(`gallery/${fileName}`, file);
      }
      await addDoc(collection(db, 'gallery'), payload);
      setForm(emptyMedia);
      setFile(null);
    } finally {
      setSaving(false);
    }
  };

  const updateOrder = async (id, order) => {
    await updateDoc(doc(db, 'gallery', id), { order });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this media item?')) return;
    await deleteDoc(doc(db, 'gallery', id));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">Gallery</h1>
        <p className="text-sm text-white/60">Upload photos and videos to showcase your work.</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-3xl bg-white/5 p-6 text-sm text-white/80">
        <h2 className="text-lg font-semibold text-white">Add new media</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            Caption
            <input
              value={form.caption}
              onChange={(event) => setForm((prev) => ({ ...prev, caption: event.target.value }))}
              className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2"
              required
            />
          </label>
          <label className="flex flex-col gap-2">
            Service tag
            <input
              value={form.serviceId}
              onChange={(event) => setForm((prev) => ({ ...prev, serviceId: event.target.value }))}
              placeholder="service id"
              className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-2">
            Media type
            <select
              value={form.mediaType}
              onChange={(event) => setForm((prev) => ({ ...prev, mediaType: event.target.value }))}
              className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2"
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
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
          {form.mediaType === 'video' ? (
            <label className="flex flex-col gap-2 sm:col-span-2">
              Video URL
              <input
                value={form.url}
                onChange={(event) => setForm((prev) => ({ ...prev, url: event.target.value }))}
                className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2"
              />
            </label>
          ) : (
            <label className="flex flex-col gap-2 sm:col-span-2">
              Upload image
              <input type="file" accept="image/*" onChange={(event) => setFile(event.target.files?.[0] || null)} />
            </label>
          )}
        </div>
        <div className="mt-4 flex justify-end">
          <button type="submit" disabled={saving} className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900">
            {saving ? 'Uploading…' : 'Add to gallery'}
          </button>
        </div>
      </form>

      {loading && <LoadingScreen message="Loading media" />}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mediaItems.map((item) => (
          <div key={item.id} className="rounded-3xl bg-white/5 p-4">
            <div className="aspect-video overflow-hidden rounded-2xl bg-black/40">
              {item.mediaType === 'video' ? (
                <iframe src={item.url} title={item.caption} className="h-full w-full" allowFullScreen></iframe>
              ) : (
                <img src={item.url} alt={item.caption} className="h-full w-full object-cover" />
              )}
            </div>
            <p className="mt-3 text-sm font-semibold text-white">{item.caption}</p>
            <p className="text-xs uppercase tracking-wide text-white/60">{item.serviceId || 'general'}</p>
            <div className="mt-3 flex items-center justify-between text-xs text-white/60">
              <label className="flex items-center gap-2">
                Order
                <input
                  type="number"
                  defaultValue={item.order || 0}
                  onBlur={(event) => updateOrder(item.id, Number(event.target.value))}
                  className="w-20 rounded-2xl border border-white/10 bg-white/10 px-3 py-1"
                />
              </label>
              <button onClick={() => handleDelete(item.id)} className="rounded-full bg-rose-500/80 px-3 py-1 text-white">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
