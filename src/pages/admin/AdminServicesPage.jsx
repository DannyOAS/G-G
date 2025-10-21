import React, { useEffect, useMemo, useState } from 'react';
import { useFirebase } from '../../context/FirebaseContext';
import useRealtimeCollection from '../../hooks/useRealtimeCollection';
import { collection, orderBy, query, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { useFirestore } from '../../lib/firestore';
import LoadingScreen from '../../components/LoadingScreen';
import { formatCurrency } from '../../utils/booking';

const emptyService = {
  name: '',
  description: '',
  duration: 120,
  pricingType: 'fixed',
  price: 0,
  startingPrice: 0,
  requiresDeposit: false,
  depositType: 'percentage',
  depositAmount: 20,
  addons: [],
  subServices: [],
  imageUrl: '',
  order: 0,
};

function ServiceForm({ service = emptyService, onSave, onCancel, saving }) {
  const generateId = () =>
    typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
  const normaliseList = (items = []) => items.map((item) => ({ ...item, id: item.id || generateId() }));
  const [form, setForm] = useState({
    ...service,
    addons: normaliseList(service.addons),
    subServices: normaliseList(service.subServices),
  });
  const [imageFile, setImageFile] = useState(null);
  const [addonInput, setAddonInput] = useState({ name: '', price: '' });
  const [subServiceInput, setSubServiceInput] = useState({ name: '', price: '' });

  useEffect(() => {
    setForm({
      ...service,
      addons: normaliseList(service.addons),
      subServices: normaliseList(service.subServices),
    });
    setImageFile(null);
  }, [service]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addAddon = () => {
    if (!addonInput.name || !addonInput.price) return;
    setForm((prev) => ({
      ...prev,
      addons: [...(prev.addons || []), { id: generateId(), ...addonInput, price: Number(addonInput.price) }],
    }));
    setAddonInput({ name: '', price: '' });
  };

  const addSubService = () => {
    if (!subServiceInput.name || !subServiceInput.price) return;
    setForm((prev) => ({
      ...prev,
      subServices: [
        ...(prev.subServices || []),
        { id: generateId(), ...subServiceInput, price: Number(subServiceInput.price) },
      ],
    }));
    setSubServiceInput({ name: '', price: '' });
  };

  const removeAddon = (id) => {
    setForm((prev) => ({ ...prev, addons: prev.addons.filter((item) => item.id !== id) }));
  };

  const removeSubService = (id) => {
    setForm((prev) => ({ ...prev, subServices: prev.subServices.filter((item) => item.id !== id) }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave({ ...form, imageFile });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="text-sm font-semibold">Service name</label>
          <input
            value={form.name}
            onChange={(event) => updateField('name', event.target.value)}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm focus:border-blush-300 focus:outline-none"
            required
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-semibold">Description</label>
          <textarea
            value={form.description}
            onChange={(event) => updateField('description', event.target.value)}
            rows={4}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm focus:border-blush-300 focus:outline-none"
            required
          ></textarea>
        </div>
        <div>
          <label className="text-sm font-semibold">Duration (minutes)</label>
          <input
            type="number"
            value={form.duration}
            onChange={(event) => updateField('duration', Number(event.target.value))}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm focus:border-blush-300 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-sm font-semibold">Order</label>
          <input
            type="number"
            value={form.order || 0}
            onChange={(event) => updateField('order', Number(event.target.value))}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm focus:border-blush-300 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-sm font-semibold">Pricing type</label>
          <select
            value={form.pricingType}
            onChange={(event) => updateField('pricingType', event.target.value)}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm focus:border-blush-300 focus:outline-none"
          >
            <option value="fixed">Fixed</option>
            <option value="variable">Variable</option>
          </select>
        </div>
        {form.pricingType === 'fixed' ? (
          <div>
            <label className="text-sm font-semibold">Price</label>
            <input
              type="number"
              value={form.price}
              onChange={(event) => updateField('price', Number(event.target.value))}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm focus:border-blush-300 focus:outline-none"
            />
          </div>
        ) : (
          <div>
            <label className="text-sm font-semibold">Starting price</label>
            <input
              type="number"
              value={form.startingPrice}
              onChange={(event) => updateField('startingPrice', Number(event.target.value))}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm focus:border-blush-300 focus:outline-none"
            />
          </div>
        )}
        <div>
          <label className="text-sm font-semibold">Requires deposit?</label>
          <select
            value={form.requiresDeposit ? 'yes' : 'no'}
            onChange={(event) => updateField('requiresDeposit', event.target.value === 'yes')}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm focus:border-blush-300 focus:outline-none"
          >
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </div>
        {form.requiresDeposit && (
          <>
            <div>
              <label className="text-sm font-semibold">Deposit type</label>
              <select
                value={form.depositType}
                onChange={(event) => updateField('depositType', event.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm focus:border-blush-300 focus:outline-none"
              >
                <option value="percentage">Percentage</option>
                <option value="flat">Flat</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold">Deposit amount</label>
              <input
                type="number"
                value={form.depositAmount}
                onChange={(event) => updateField('depositAmount', Number(event.target.value))}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm focus:border-blush-300 focus:outline-none"
              />
            </div>
          </>
        )}
        <div className="sm:col-span-2">
          <label className="text-sm font-semibold">Hero image</label>
          <div className="mt-2 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
            {form.imageUrl && !imageFile && (
              <img src={form.imageUrl} alt={form.name} className="h-32 w-full rounded-xl object-cover" />
            )}
            <input type="file" accept="image/*" onChange={(event) => setImageFile(event.target.files?.[0] || null)} />
            <p className="text-xs text-white/60">Upload a 1200x800px image for best results.</p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 p-4">
        <p className="text-sm font-semibold">Add-ons</p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input
            value={addonInput.name}
            onChange={(event) => setAddonInput((prev) => ({ ...prev, name: event.target.value }))}
            placeholder="Name"
            className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm focus:border-blush-300 focus:outline-none"
          />
          <input
            value={addonInput.price}
            type="number"
            onChange={(event) => setAddonInput((prev) => ({ ...prev, price: event.target.value }))}
            placeholder="Price"
            className="w-32 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm focus:border-blush-300 focus:outline-none"
          />
          <button type="button" onClick={addAddon} className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white">
            Add
          </button>
        </div>
        <ul className="mt-3 space-y-2 text-sm text-white/80">
          {form.addons?.map((addon) => (
            <li key={addon.id} className="flex items-center justify-between rounded-2xl bg-white/5 px-3 py-2">
              <span>
                {addon.name} · {formatCurrency(addon.price)}
              </span>
              <button type="button" onClick={() => removeAddon(addon.id)} className="text-xs text-rose-200">
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-3xl border border-white/10 p-4">
        <p className="text-sm font-semibold">Sub-services</p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input
            value={subServiceInput.name}
            onChange={(event) => setSubServiceInput((prev) => ({ ...prev, name: event.target.value }))}
            placeholder="Name"
            className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm focus:border-blush-300 focus:outline-none"
          />
          <input
            value={subServiceInput.price}
            type="number"
            onChange={(event) => setSubServiceInput((prev) => ({ ...prev, price: event.target.value }))}
            placeholder="Price"
            className="w-32 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm focus:border-blush-300 focus:outline-none"
          />
          <button type="button" onClick={addSubService} className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white">
            Add
          </button>
        </div>
        <ul className="mt-3 space-y-2 text-sm text-white/80">
          {form.subServices?.map((sub) => (
            <li key={sub.id} className="flex items-center justify-between rounded-2xl bg-white/5 px-3 py-2">
              <span>
                {sub.name} · {formatCurrency(sub.price)}
              </span>
              <button type="button" onClick={() => removeSubService(sub.id)} className="text-xs text-rose-200">
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button type="button" onClick={onCancel} className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white">
          Cancel
        </button>
        <button type="submit" disabled={saving} className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900">
          {saving ? 'Saving…' : 'Save service'}
        </button>
      </div>
    </form>
  );
}

export default function AdminServicesPage() {
  const { db } = useFirebase();
  const { uploadFile } = useFirestore();
  const { data: services, loading } = useRealtimeCollection(
    () => query(collection(db, 'services'), orderBy('order', 'asc')),
    [db]
  );
  const [editingService, setEditingService] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async (formData) => {
    setSaving(true);
    try {
      const payload = { ...formData };
      if (formData.imageFile) {
        const fileName = `${Date.now()}-${formData.imageFile.name}`;
        payload.imageUrl = await uploadFile(`services/${fileName}`, formData.imageFile);
      }
      delete payload.imageFile;
      if (editingService) {
        await updateDoc(doc(db, 'services', editingService.id), payload);
      } else {
        await addDoc(collection(db, 'services'), payload);
      }
      setShowForm(false);
      setEditingService(null);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (serviceId) => {
    if (!window.confirm('Delete this service?')) return;
    await deleteDoc(doc(db, 'services', serviceId));
  };

  const startCreate = () => {
    setEditingService(null);
    setShowForm(true);
  };

  const startEdit = (service) => {
    setEditingService(service);
    setShowForm(true);
  };

  const cards = useMemo(
    () =>
      services.map((service) => (
        <div key={service.id} className="rounded-3xl bg-white/5 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-display text-xl text-white">{service.name}</h3>
              <p className="mt-2 text-sm text-white/70">{service.description}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => startEdit(service)}
                className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(service.id)}
                className="rounded-full bg-rose-500/80 px-3 py-1 text-xs font-semibold text-white"
              >
                Delete
              </button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs uppercase tracking-wide text-white/60">
            <span>{Math.round((service.duration || 120) / 60)} hrs</span>
            <span>{service.pricingType === 'fixed' ? formatCurrency(service.price || 0) : `Starting at ${formatCurrency(service.startingPrice || 0)}`}</span>
            <span>{service.requiresDeposit ? 'Deposit required' : 'No deposit'}</span>
          </div>
          {service.addons?.length ? (
            <div className="mt-4 text-sm text-white/70">
              <p className="font-semibold text-white">Add-ons</p>
              <ul className="mt-1 space-y-1">
                {service.addons.map((addon) => (
                  <li key={addon.id}>
                    {addon.name} — {formatCurrency(addon.price)}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )),
    [services]
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl">Services</h1>
          <p className="text-sm text-white/60">Curate offerings, add-ons, and pricing.</p>
        </div>
        <button onClick={startCreate} className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900">
          New service
        </button>
      </div>

      {loading && <LoadingScreen message="Loading services" />}

      <div className="grid gap-4 lg:grid-cols-2">{cards}</div>

      {showForm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-slate-900 p-6">
            <ServiceForm
              service={editingService || emptyService}
              onSave={handleSave}
              onCancel={() => {
                setShowForm(false);
                setEditingService(null);
              }}
              saving={saving}
            />
          </div>
        </div>
      )}
    </div>
  );
}
