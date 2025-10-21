import React, { useEffect, useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { useFirebase } from '../../context/FirebaseContext';
import useRealtimeDocument from '../../hooks/useRealtimeDocument';
import { defaultSettings } from '../../data/sampleAvailability';

export default function AdminSettingsPage() {
  const { db } = useFirebase();
  const { data: businessSettings } = useRealtimeDocument(db, 'settings', 'business');
  const { data: emailSettings } = useRealtimeDocument(db, 'settings', 'email');
  const { data: paymentSettings } = useRealtimeDocument(db, 'settings', 'payments');
  const [businessForm, setBusinessForm] = useState(defaultSettings);
  const [emailForm, setEmailForm] = useState({ host: 'smtp.gmail.com', port: 465, username: '', password: '', fromName: 'Gorgeous & Groomed', fromEmail: '' });
  const [paymentForm, setPaymentForm] = useState({ stripeEnabled: false, stripePublishableKey: '', stripeSecretKey: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (businessSettings) {
      setBusinessForm((prev) => ({ ...prev, ...businessSettings }));
    }
  }, [businessSettings]);

  useEffect(() => {
    if (emailSettings) {
      setEmailForm((prev) => ({ ...prev, ...emailSettings }));
    }
  }, [emailSettings]);

  useEffect(() => {
    if (paymentSettings) {
      setPaymentForm((prev) => ({ ...prev, ...paymentSettings }));
    }
  }, [paymentSettings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        setDoc(doc(db, 'settings', 'business'), businessForm),
        setDoc(doc(db, 'settings', 'email'), emailForm),
        setDoc(doc(db, 'settings', 'payments'), paymentForm),
      ]);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">Settings</h1>
        <p className="text-sm text-white/60">Manage business details, email configuration, and payments.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl bg-white/5 p-6 text-sm text-white/80">
          <h2 className="text-lg font-semibold text-white">Business profile</h2>
          <div className="mt-4 space-y-3">
            {['businessName', 'address', 'phone', 'email', 'instagram', 'facebook'].map((field) => (
              <label key={field} className="flex flex-col gap-1">
                {field.replace(/([A-Z])/g, ' $1').toLowerCase()}
                <input
                  value={businessForm[field] || ''}
                  onChange={(event) => setBusinessForm((prev) => ({ ...prev, [field]: event.target.value }))}
                  className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2"
                />
              </label>
            ))}
            <label className="flex flex-col gap-1">
              E-transfer instructions
              <textarea
                value={businessForm.eTransferInstructions || ''}
                onChange={(event) => setBusinessForm((prev) => ({ ...prev, eTransferInstructions: event.target.value }))}
                rows={4}
                className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2"
              ></textarea>
            </label>
          </div>
        </div>

        <div className="rounded-3xl bg-white/5 p-6 text-sm text-white/80">
          <h2 className="text-lg font-semibold text-white">Gmail SMTP</h2>
          <p className="text-xs text-white/60">Use an app password from Gmail for secure authentication.</p>
          <div className="mt-4 space-y-3">
            <label className="flex flex-col gap-1">
              Host
              <input
                value={emailForm.host}
                onChange={(event) => setEmailForm((prev) => ({ ...prev, host: event.target.value }))}
                className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1">
              Port
              <input
                type="number"
                value={emailForm.port}
                onChange={(event) => setEmailForm((prev) => ({ ...prev, port: Number(event.target.value) }))}
                className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1">
              Username
              <input
                value={emailForm.username}
                onChange={(event) => setEmailForm((prev) => ({ ...prev, username: event.target.value }))}
                className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1">
              App password
              <input
                type="password"
                value={emailForm.password}
                onChange={(event) => setEmailForm((prev) => ({ ...prev, password: event.target.value }))}
                className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1">
              From name
              <input
                value={emailForm.fromName}
                onChange={(event) => setEmailForm((prev) => ({ ...prev, fromName: event.target.value }))}
                className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1">
              From email
              <input
                value={emailForm.fromEmail}
                onChange={(event) => setEmailForm((prev) => ({ ...prev, fromEmail: event.target.value }))}
                className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2"
              />
            </label>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-white/5 p-6 text-sm text-white/80">
        <h2 className="text-lg font-semibold text-white">Stripe integration</h2>
        <p className="text-xs text-white/60">
          Stripe is disabled by default. When enabled, the booking confirmation will launch checkout instead of e-transfer instructions.
        </p>
        <label className="mt-4 flex items-center gap-2">
          <input
            type="checkbox"
            checked={paymentForm.stripeEnabled}
            onChange={(event) => setPaymentForm((prev) => ({ ...prev, stripeEnabled: event.target.checked }))}
            className="h-4 w-4 rounded border-white/20"
          />
          Enable Stripe payments
        </label>
        {paymentForm.stripeEnabled && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              Publishable key
              <input
                value={paymentForm.stripePublishableKey}
                onChange={(event) => setPaymentForm((prev) => ({ ...prev, stripePublishableKey: event.target.value }))}
                className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1">
              Secret key
              <input
                type="password"
                value={paymentForm.stripeSecretKey}
                onChange={(event) => setPaymentForm((prev) => ({ ...prev, stripeSecretKey: event.target.value }))}
                className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2"
              />
            </label>
          </div>
        )}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="rounded-full bg-white px-6 py-2 text-sm font-semibold text-slate-900"
      >
        {saving ? 'Saving…' : 'Save settings'}
      </button>
    </div>
  );
}
