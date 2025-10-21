import React, { useMemo, useState } from 'react';
import { collection, doc, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { useFirebase } from '../../context/FirebaseContext';
import useRealtimeCollection from '../../hooks/useRealtimeCollection';
import LoadingScreen from '../../components/LoadingScreen';
import { format } from 'date-fns';
import { formatCurrency } from '../../utils/booking';
import { exportToCsv } from '../../utils/export';

const statusFilters = ['all', 'pending-payment', 'confirmed', 'completed', 'cancelled'];

export default function AdminBookingsPage() {
  const { db } = useFirebase();
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: bookings, loading } = useRealtimeCollection(() => {
    const baseQuery = collection(db, 'bookings');
    return statusFilter === 'all'
      ? query(baseQuery, orderBy('appointmentStart', 'desc'))
      : query(baseQuery, where('status', '==', statusFilter), orderBy('appointmentStart', 'desc'));
  }, [db, statusFilter]);

  const updateStatus = async (bookingId, status) => {
    await updateDoc(doc(db, 'bookings', bookingId), { status });
  };

  const exportCsv = () => {
    if (!bookings.length) return;
    const rows = bookings.map((booking) => ({
      id: booking.id,
      service: booking.serviceName,
      customer: booking.customer?.name,
      email: booking.customer?.email,
      phone: booking.customer?.phone,
      appointmentDate: booking.appointmentDate,
      appointmentStart: booking.appointmentStart?.toDate?.()
        ? format(booking.appointmentStart.toDate(), 'yyyy-MM-dd HH:mm')
        : '',
      total: booking.total,
      deposit: booking.deposit,
      status: booking.status,
    }));
    exportToCsv('bookings.csv', rows);
  };

  const stats = useMemo(
    () => ({
      pending: bookings.filter((b) => b.status === 'pending-payment').length,
      confirmed: bookings.filter((b) => b.status === 'confirmed').length,
      completed: bookings.filter((b) => b.status === 'completed').length,
    }),
    [bookings]
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl">Bookings</h1>
          <p className="text-sm text-white/60">Manage appointment requests, confirm payments, and export data.</p>
        </div>
        <button
          onClick={exportCsv}
          className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
        >
          Export CSV
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl bg-white/10 p-4">
          <p className="text-xs uppercase tracking-wide text-white/60">Pending</p>
          <p className="text-2xl font-semibold">{stats.pending}</p>
        </div>
        <div className="rounded-3xl bg-white/10 p-4">
          <p className="text-xs uppercase tracking-wide text-white/60">Confirmed</p>
          <p className="text-2xl font-semibold">{stats.confirmed}</p>
        </div>
        <div className="rounded-3xl bg-white/10 p-4">
          <p className="text-xs uppercase tracking-wide text-white/60">Completed</p>
          <p className="text-2xl font-semibold">{stats.completed}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {statusFilters.map((filter) => (
          <button
            key={filter}
            onClick={() => setStatusFilter(filter)}
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
              statusFilter === filter ? 'bg-white text-slate-900' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/10">
        <table className="min-w-full divide-y divide-white/10 text-sm">
          <thead className="bg-white/5">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-white/80">Guest</th>
              <th className="px-4 py-3 text-left font-semibold text-white/80">Service</th>
              <th className="px-4 py-3 text-left font-semibold text-white/80">Date</th>
              <th className="px-4 py-3 text-left font-semibold text-white/80">Total</th>
              <th className="px-4 py-3 text-left font-semibold text-white/80">Status</th>
              <th className="px-4 py-3 text-right font-semibold text-white/80">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {bookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-white/5">
                <td className="px-4 py-3">
                  <p className="font-semibold text-white">{booking.customer?.name}</p>
                  <p className="text-xs text-white/60">{booking.customer?.email}</p>
                </td>
                <td className="px-4 py-3 text-white/80">{booking.serviceName}</td>
                <td className="px-4 py-3 text-white/80">
                  {booking.appointmentStart?.toDate?.()
                    ? format(booking.appointmentStart.toDate(), 'MMM d, h:mm a')
                    : booking.appointmentDate}
                </td>
                <td className="px-4 py-3 font-semibold text-white">{formatCurrency(booking.total || 0)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                      booking.status === 'confirmed'
                        ? 'bg-emerald-500/20 text-emerald-200'
                        : booking.status === 'pending-payment'
                        ? 'bg-amber-500/20 text-amber-200'
                        : booking.status === 'completed'
                        ? 'bg-sky-500/20 text-sky-100'
                        : 'bg-rose-500/20 text-rose-200'
                    }`}
                  >
                    {booking.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => updateStatus(booking.id, 'confirmed')}
                      className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/20"
                    >
                      Mark confirmed
                    </button>
                    <button
                      onClick={() => updateStatus(booking.id, 'completed')}
                      className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/20"
                    >
                      Completed
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <LoadingScreen message="Loading bookings" />}
        {!loading && !bookings.length && <p className="p-6 text-sm text-white/60">No bookings yet.</p>}
      </div>
    </div>
  );
}
