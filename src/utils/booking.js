import { addMinutes, areIntervalsOverlapping, format, isAfter, isBefore, setHours, setMinutes } from 'date-fns';

export function generateTimeSlots({ date, serviceDuration, schedule, bufferMinutes = 0, existingBookings = [] }) {
  if (!schedule?.enabled) return [];
  const [startHour, startMinute] = schedule.start.split(':').map(Number);
  const [endHour, endMinute] = schedule.end.split(':').map(Number);
  const startDate = setMinutes(setHours(date, startHour), startMinute);
  const endDate = setMinutes(setHours(date, endHour), endMinute);

  const slots = [];
  let cursor = startDate;

  while (isBefore(addMinutes(cursor, serviceDuration), addMinutes(endDate, 1))) {
    const slotEnd = addMinutes(cursor, serviceDuration + bufferMinutes);
    const hasConflict = existingBookings.some((booking) => {
      const bookingStart = booking.start.toDate ? booking.start.toDate() : new Date(booking.start);
      const bookingEnd = booking.end.toDate ? booking.end.toDate() : new Date(booking.end);
      return areIntervalsOverlapping(
        { start: cursor, end: slotEnd },
        { start: bookingStart, end: addMinutes(bookingEnd, bufferMinutes) },
        { inclusive: true }
      );
    });

    if (!hasConflict && isAfter(cursor, new Date())) {
      slots.push({
        start: cursor,
        end: slotEnd,
        label: `${format(cursor, 'h:mm a')} - ${format(addMinutes(cursor, serviceDuration), 'h:mm a')}`,
      });
    }

    cursor = addMinutes(cursor, 30);
  }

  return slots;
}

export function calculateDeposit(service, totalPrice) {
  if (!service.requiresDeposit) return 0;
  if (service.depositType === 'percentage') {
    return Math.round((totalPrice * service.depositAmount) / 100);
  }
  if (service.depositType === 'flat') {
    return service.depositAmount;
  }
  return 0;
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(amount);
}
