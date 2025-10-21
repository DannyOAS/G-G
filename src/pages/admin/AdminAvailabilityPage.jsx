import React, { useEffect, useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { useFirebase } from '../../context/FirebaseContext';
import useRealtimeDocument from '../../hooks/useRealtimeDocument';
import { weeklyScheduleTemplate } from '../../data/sampleAvailability';

const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export default function AdminAvailabilityPage() {
  const { db } = useFirebase();
  const { data: config } = useRealtimeDocument(db, 'availability', 'config');
  const [saving, setSaving] = useState(false);
  const [schedule, setSchedule] = useState(weeklyScheduleTemplate);
  const [bufferMinutes, setBufferMinutes] = useState(15);
  const [leadTimeHours, setLeadTimeHours] = useState(24);
  const [blockedDates, setBlockedDates] = useState([]);

  useEffect(() => {
    if (config) {
      setSchedule(config.weeklySchedule || weeklyScheduleTemplate);
      setBufferMinutes(config.bufferMinutes || 15);
      setLeadTimeHours(config.leadTimeHours || 24);
      setBlockedDates(config.blockedDates || []);
    }
  }, [config]);

  const updateDay = (day, changes) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], ...changes },
    }));
  };

  const addBlockedDate = (date) => {
    if (!date || blockedDates.includes(date)) return;
    setBlockedDates((prev) => [...prev, date]);
  };

  const removeBlockedDate = (date) => {
    setBlockedDates((prev) => prev.filter((item) => item !== date));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'availability', 'config'), {
        weeklySchedule: schedule,
        bufferMinutes,
        leadTimeHours,
        blockedDates,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">Availability</h1>
        <p className="text-sm text-white/60">Control weekly hours, buffers, and blocked days.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {days.map((day) => (
          <div key={day} className="rounded-3xl bg-white/5 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold capitalize text-white">{day}</h3>
              <label className="inline-flex items-center gap-2 text-sm text-white/70">
                <input
                  type="checkbox"
                  checked={schedule[day]?.enabled ?? false}
                  onChange={(event) => updateDay(day, { enabled: event.target.checked })}
                  className="h-4 w-4 rounded border-white/20 bg-transparent"
                />
                Open
              </label>
            </div>
            {schedule[day]?.enabled && (
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <label className="text-white/60">Start</label>
                  <input
                    type="time"
                    value={schedule[day]?.start || '09:00'}
                    onChange={(event) => updateDay(day, { start: event.target.value })}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-white/60">End</label>
                  <input
                    type="time"
                    value={schedule[day]?.end || '17:00'}
                    onChange={(event) => updateDay(day, { end: event.target.value })}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-white"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl bg-white/5 p-6 text-sm text-white/80">
          <h3 className="text-lg font-semibold text-white">Booking buffers</h3>
          <label className="mt-3 block">
            Buffer minutes
            <input
              type="number"
              value={bufferMinutes}
              onChange={(event) => setBufferMinutes(Number(event.target.value))}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-3 py-2"
            />
          </label>
          <label className="mt-3 block">
            Lead time (hours)
            <input
              type="number"
              value={leadTimeHours}
              onChange={(event) => setLeadTimeHours(Number(event.target.value))}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-3 py-2"
            />
          </label>
        </div>
        <div className="rounded-3xl bg-white/5 p-6 text-sm text-white/80">
          <h3 className="text-lg font-semibold text-white">Blocked dates</h3>
          <div className="mt-4 flex gap-2">
            <input
              type="date"
              onChange={(event) => addBlockedDate(event.target.value)}
              className="flex-1 rounded-2xl border border-white/10 bg-white/10 px-3 py-2"
            />
          </div>
          <ul className="mt-4 space-y-2">
            {blockedDates.map((date) => (
              <li key={date} className="flex items-center justify-between rounded-2xl bg-white/10 px-3 py-2">
                <span>{date}</span>
                <button onClick={() => removeBlockedDate(date)} className="text-xs text-rose-200">
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="rounded-full bg-white px-6 py-2 text-sm font-semibold text-slate-900"
      >
        {saving ? 'Saving…' : 'Save availability'}
      </button>
    </div>
  );
}
