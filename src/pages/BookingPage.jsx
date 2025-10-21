import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { addHours, format, isBefore, parseISO } from 'date-fns';
import { collection, doc, onSnapshot, orderBy, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { useFirebase } from '../context/FirebaseContext';
import useRealtimeCollection from '../hooks/useRealtimeCollection';
import useRealtimeDocument from '../hooks/useRealtimeDocument';
import { sampleServices } from '../data/sampleServices';
import { weeklyScheduleTemplate, defaultSettings } from '../data/sampleAvailability';
import { calculateDeposit, formatCurrency, generateTimeSlots } from '../utils/booking';
import LoadingScreen from '../components/LoadingScreen';
import { sendEmail } from '../lib/email';
import { bookingConfirmationTemplate } from '../utils/emailTemplates';

const steps = [
  { id: 1, title: 'Select service' },
  { id: 2, title: 'Choose date & time' },
  { id: 3, title: 'Guest details' },
  { id: 4, title: 'Payment preference' },
  { id: 5, title: 'Confirm booking' },
];

function Stepper({ currentStep }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center gap-2 text-sm">
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-full font-semibold ${
              index <= currentStep ? 'bg-blush-500 text-white' : 'bg-white text-gray-400'
            }`}
          >
            {index + 1}
          </span>
          <span className={index <= currentStep ? 'font-semibold text-blush-600' : 'text-gray-400'}>{step.title}</span>
          {index < steps.length - 1 && <div className="hidden flex-1 border-t border-dashed border-gray-200 sm:block"></div>}
        </div>
      ))}
    </div>
  );
}

function ServiceCard({ service, selected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(service)}
      className={`flex flex-col rounded-3xl border-2 p-6 text-left transition ${
        selected ? 'border-blush-500 bg-white shadow-glow' : 'border-transparent bg-white/80 hover:border-blush-300'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-display text-xl text-blush-700">{service.name}</h3>
          <p className="mt-2 text-sm text-gray-600">{service.description}</p>
        </div>
        <span className="rounded-full bg-blush-100 px-4 py-1 text-xs font-semibold text-blush-600">
          {service.pricingType === 'fixed'
            ? formatCurrency(service.price || service.startingPrice)
            : `Starting at ${formatCurrency(service.startingPrice || service.price)}`}
        </span>
      </div>
      {service.addons?.length ? (
        <div className="mt-4 text-xs text-gray-500">
          Add-ons available · {service.addons.map((addon) => addon.name).join(', ')}
        </div>
      ) : null}
    </button>
  );
}

function AddonSelector({ addons = [], selectedAddons, toggleAddon }) {
  if (!addons.length) return null;
  return (
    <div className="mt-6">
      <h4 className="font-semibold text-gray-900">Enhance your look</h4>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {addons.map((addon) => {
          const isActive = selectedAddons.some((item) => item.id === addon.id);
          return (
            <button
              key={addon.id}
              onClick={() => toggleAddon(addon)}
              className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                isActive ? 'border-blush-400 bg-blush-50 text-blush-600' : 'border-gray-200 bg-white text-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{addon.name}</span>
                <span>{formatCurrency(addon.price)}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PaymentOption({ value, description, selected, onSelect, disabled }) {
  return (
    <button
      onClick={() => onSelect(value)}
      disabled={disabled}
      className={`w-full rounded-3xl border-2 p-6 text-left transition ${
        selected === value
          ? 'border-blush-500 bg-white shadow-glow'
          : 'border-transparent bg-white/80 hover:border-blush-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-blush-700 capitalize">{value}</h3>
      </div>
      <p className="mt-2 text-sm text-gray-600">{description}</p>
    </button>
  );
}

function SummaryCard({ service, addons, customer, slot, total, deposit, paymentOption, stripeEnabled, settings }) {
  if (!service || !slot) return null;
  return (
    <div className="card-glass sticky top-24 rounded-3xl bg-white p-6 shadow-xl">
      <h3 className="font-display text-xl text-blush-700">Booking summary</h3>
      <div className="mt-4 space-y-3 text-sm text-gray-700">
        <div>
          <p className="font-semibold">Service</p>
          <p>{service.name}</p>
        </div>
        <div>
          <p className="font-semibold">Appointment</p>
          <p>
            {format(slot.start, 'eeee, MMM d')} · {format(slot.start, 'h:mm a')}
          </p>
        </div>
        {addons.length ? (
          <div>
            <p className="font-semibold">Add-ons</p>
            <ul className="mt-1 space-y-1">
              {addons.map((addon) => (
                <li key={addon.id} className="flex justify-between">
                  <span>{addon.name}</span>
                  <span>{formatCurrency(addon.price)}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {customer?.name && (
          <div>
            <p className="font-semibold">Guest</p>
            <p>{customer.name}</p>
            <p className="text-xs text-gray-500">{customer.email}</p>
            <p className="text-xs text-gray-500">{customer.phone}</p>
          </div>
        )}
        <div className="flex justify-between border-t border-gray-100 pt-3 text-base font-semibold">
          <span>Total due</span>
          <span>{formatCurrency(total)}</span>
        </div>
        {deposit > 0 && (
          <div className="flex justify-between text-sm">
            <span>Deposit ({paymentOption})</span>
            <span>{formatCurrency(deposit)}</span>
          </div>
        )}
        {stripeEnabled ? (
          <p className="rounded-2xl bg-blush-50 p-3 text-xs text-blush-700">
            Stripe checkout is enabled. You'll receive a secure payment link after submitting this request.
          </p>
        ) : (
          <p className="rounded-2xl bg-blush-50 p-3 text-xs text-blush-700">
            Send your e-transfer to {settings?.depositEmail || 'the studio'} using the instructions provided after booking.
          </p>
        )}
      </div>
    </div>
  );
}

export default function BookingPage() {
  const { db } = useFirebase();
  const [searchParams] = useSearchParams();
  const preselectedServiceId = searchParams.get('service');

  const { data: services, loading: servicesLoading } = useRealtimeCollection(
    () => query(collection(db, 'services'), orderBy('order', 'asc')),
    [db]
  );

  const serviceList = services.length ? services : sampleServices;
  const defaultService = serviceList.find((svc) => svc.id === preselectedServiceId) || serviceList[0];

  const { data: availability } = useRealtimeDocument(db, 'availability', 'config');
  const { data: settingsDoc } = useRealtimeDocument(db, 'settings', 'business');

  const availabilityConfig = availability || { weeklySchedule: weeklyScheduleTemplate, bufferMinutes: 15, leadTimeHours: 24 };
  const settings = settingsDoc || defaultSettings;
  const stripeEnabled = settings?.stripeEnabled;

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedService, setSelectedService] = useState(defaultService || null);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '' });
  const [paymentOption, setPaymentOption] = useState('deposit');
  const [specialNotes, setSpecialNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [bookingError, setBookingError] = useState('');
  const [existingBookings, setExistingBookings] = useState([]);

  useEffect(() => {
    if (!selectedService?.id) return;
    setSelectedAddons([]);
  }, [selectedService?.id]);

  useEffect(() => {
    if (!appointmentDate) return;
    const q = query(collection(db, 'bookings'), where('appointmentDate', '==', appointmentDate));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setExistingBookings(items);
    });
    return () => unsubscribe();
  }, [db, appointmentDate]);

  const scheduleForDate = useMemo(() => {
    if (!appointmentDate) return null;
    const dayName = format(parseISO(`${appointmentDate}T00:00:00`), 'eeee').toLowerCase();
    return availabilityConfig.weeklySchedule?.[dayName] || null;
  }, [appointmentDate, availabilityConfig.weeklySchedule]);

  const availableSlots = useMemo(() => {
    if (!appointmentDate || !selectedService || !scheduleForDate) return [];
    const date = parseISO(`${appointmentDate}T00:00:00`);
    const leadTimeHours = availabilityConfig.leadTimeHours || 24;
    const minDate = addHours(new Date(), leadTimeHours);
    if (isBefore(date, new Date(minDate.toDateString()))) {
      return [];
    }
    return generateTimeSlots({
      date,
      serviceDuration: selectedService.duration || 120,
      schedule: scheduleForDate,
      bufferMinutes: availabilityConfig.bufferMinutes || 0,
      existingBookings: existingBookings.map((booking) => ({
        start: booking.appointmentStart,
        end: booking.appointmentEnd,
      })),
    });
  }, [appointmentDate, selectedService, scheduleForDate, availabilityConfig.bufferMinutes, availabilityConfig.leadTimeHours, existingBookings]);

  const addonsTotal = useMemo(() => selectedAddons.reduce((sum, addon) => sum + (addon.price || 0), 0), [selectedAddons]);
  const serviceBasePrice = selectedService?.pricingType === 'fixed'
    ? selectedService.price || selectedService.startingPrice || 0
    : selectedService?.startingPrice || 0;
  const total = serviceBasePrice + addonsTotal;
  const deposit = calculateDeposit(selectedService || {}, total);

  useEffect(() => {
    if (!selectedService) return;
    if (selectedService.requiresDeposit) {
      setPaymentOption('deposit');
    } else {
      setPaymentOption('full');
    }
  }, [selectedService]);

  const toggleAddon = (addon) => {
    setSelectedAddons((prev) => {
      const exists = prev.some((item) => item.id === addon.id);
      if (exists) {
        return prev.filter((item) => item.id !== addon.id);
      }
      return [...prev, addon];
    });
  };

  const canContinue = () => {
    switch (currentStep) {
      case 0:
        return Boolean(selectedService);
      case 1:
        return Boolean(appointmentDate && selectedSlot);
      case 2:
        return Boolean(customer.name && customer.email && customer.phone);
      case 3:
        return Boolean(paymentOption);
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (!canContinue()) return;
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const handleBooking = async () => {
    if (!canContinue()) return;
    setSubmitting(true);
    setBookingError('');
    try {
      const appointmentStart = selectedSlot.start;
      const appointmentEnd = selectedSlot.end;
      const docRef = await addDoc(collection(db, 'bookings'), {
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        addons: selectedAddons,
        customer,
        appointmentDate,
        appointmentStart,
        appointmentEnd,
        total,
        deposit,
        paymentOption,
        specialNotes,
        status: selectedService.requiresDeposit ? 'pending-payment' : 'confirmed',
        paymentGateway: stripeEnabled ? 'stripe' : 'e-transfer',
        stripeEnabled: Boolean(stripeEnabled),
        createdAt: serverTimestamp(),
      });

      const bookingDetails = {
        id: docRef.id,
        dateLabel: format(appointmentStart, 'eeee, MMM d'),
        timeLabel: `${format(appointmentStart, 'h:mm a')} - ${format(appointmentEnd, 'h:mm a')}`,
        totalDueLabel: formatCurrency(total),
      };

      await sendEmail({
        to: customer.email,
        ...bookingConfirmationTemplate({
          customer,
          booking: bookingDetails,
          service: selectedService,
          settings,
        }),
      });

      setConfirmation({ bookingId: docRef.id, bookingDetails });
      setCurrentStep(steps.length - 1);
    } catch (error) {
      console.error(error);
      setBookingError('There was a problem saving your booking. Please try again or contact us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  if (servicesLoading && !serviceList.length) {
    return <LoadingScreen message="Loading services" />;
  }

  return (
    <div className="container-padded section-padding">
      <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
        <div>
          <h1 className="font-display text-4xl text-blush-700">Book your appointment</h1>
          <p className="mt-2 text-sm text-gray-600">
            Follow the steps to reserve your seat. Deposits secure your time slot; final payment due after styling unless Stripe is enabled.
          </p>

          <div className="mt-10 space-y-8">
            <Stepper currentStep={currentStep} />

            {currentStep === 0 && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">Select your base service to begin.</p>
                <div className="grid gap-4">
                  {serviceList.map((service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      selected={selectedService?.id === service.id}
                      onSelect={(svc) => setSelectedService(svc)}
                    />
                  ))}
                </div>
                {selectedService && (
                  <AddonSelector
                    addons={selectedService.addons}
                    selectedAddons={selectedAddons}
                    toggleAddon={toggleAddon}
                  />
                )}
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-semibold text-gray-700">Choose your date</label>
                  <input
                    type="date"
                    value={appointmentDate}
                    onChange={(event) => {
                      setAppointmentDate(event.target.value);
                      setSelectedSlot(null);
                    }}
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-blush-400 focus:outline-none focus:ring-2 focus:ring-blush-200"
                  />
                </div>
                {appointmentDate && !scheduleForDate && (
                  <p className="rounded-2xl bg-blush-100 p-4 text-sm text-blush-700">
                    We're fully booked or closed on this day. Please select another date.
                  </p>
                )}
                {appointmentDate && scheduleForDate && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Available time slots</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {availableSlots.length ? (
                        availableSlots.map((slot) => (
                          <button
                            key={slot.label}
                            onClick={() => setSelectedSlot(slot)}
                            className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                              selectedSlot?.label === slot.label
                                ? 'border-blush-400 bg-blush-50 text-blush-600'
                                : 'border-gray-200 bg-white text-gray-700'
                            }`}
                          >
                            {slot.label}
                          </button>
                        ))
                      ) : (
                        <p className="rounded-2xl bg-white p-4 text-sm text-gray-500">
                          No slots available. Try another date.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentStep === 2 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="text-sm font-semibold text-gray-700">Full name</label>
                  <input
                    type="text"
                    value={customer.name}
                    onChange={(event) => setCustomer((prev) => ({ ...prev, name: event.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-blush-400 focus:outline-none focus:ring-2 focus:ring-blush-200"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Email</label>
                  <input
                    type="email"
                    value={customer.email}
                    onChange={(event) => setCustomer((prev) => ({ ...prev, email: event.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-blush-400 focus:outline-none focus:ring-2 focus:ring-blush-200"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Phone</label>
                  <input
                    type="tel"
                    value={customer.phone}
                    onChange={(event) => setCustomer((prev) => ({ ...prev, phone: event.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-blush-400 focus:outline-none focus:ring-2 focus:ring-blush-200"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-semibold text-gray-700">Special notes</label>
                  <textarea
                    value={specialNotes}
                    onChange={(event) => setSpecialNotes(event.target.value)}
                    rows={4}
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-blush-400 focus:outline-none focus:ring-2 focus:ring-blush-200"
                  ></textarea>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                {selectedService?.requiresDeposit && (
                  <PaymentOption
                    value="deposit"
                    description={`Secure your appointment with a ${
                      selectedService?.depositType === 'percentage'
                        ? `${selectedService.depositAmount}%`
                        : formatCurrency(selectedService?.depositAmount)
                    } deposit.`}
                    selected={paymentOption}
                    onSelect={(value) => setPaymentOption(value)}
                  />
                )}
                {!selectedService?.requiresDeposit && (
                  <>
                    <PaymentOption
                      value="deposit"
                      description={`Hold your slot with a ${
                        selectedService?.depositType === 'flat'
                          ? formatCurrency(selectedService?.depositAmount || 50)
                          : `${selectedService?.depositAmount || 20}%`
                      } deposit, payable by e-transfer.`}
                      selected={paymentOption}
                      onSelect={(value) => setPaymentOption(value)}
                    />
                    <PaymentOption
                      value="full"
                      description={stripeEnabled ? 'Pay in full securely via Stripe checkout.' : 'Pay your balance at the studio after your service.'}
                      selected={paymentOption}
                      onSelect={(value) => setPaymentOption(value)}
                    />
                    <p className="rounded-2xl bg-blush-100 p-4 text-sm text-blush-700">
                      Deposits are optional for this service. Choose the option that fits you best.
                    </p>
                  </>
                )}
              </div>
            )}

            {currentStep === 4 && confirmation && (
              <div className="space-y-4 rounded-3xl bg-white p-6 shadow-lg">
                <h3 className="font-display text-2xl text-blush-700">You're booked!</h3>
                <p className="text-sm text-gray-600">
                  {stripeEnabled
                    ? 'We sent your appointment details. Complete payment using the Stripe link included in your email.'
                    : `We sent your appointment details and e-transfer instructions to ${customer.email}. Please submit your deposit within 12 hours to secure your spot.`}
                </p>
                <div className="rounded-2xl bg-blush-50 p-4 text-sm text-blush-700">
                  <p className="font-semibold">Booking #{confirmation.bookingId.slice(-6)}</p>
                  <p>
                    {confirmation.bookingDetails.dateLabel} at {confirmation.bookingDetails.timeLabel}
                  </p>
                  <p>Total: {confirmation.bookingDetails.totalDueLabel}</p>
                </div>
                <p className="text-sm text-gray-600">Have questions? Email {settings.email} or text {settings.phone}.</p>
              </div>
            )}

            {bookingError && <p className="rounded-2xl bg-red-100 p-4 text-sm text-red-600">{bookingError}</p>}

            {currentStep < steps.length - 1 && (
              <div className="flex items-center justify-between">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="btn-outline disabled:opacity-50"
                >
                  Back
                </button>
                {currentStep === steps.length - 2 ? (
                  <button
                    onClick={handleBooking}
                    disabled={!canContinue() || submitting}
                    className="btn-primary disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Confirm booking'}
                  </button>
                ) : (
                  <button
                    onClick={nextStep}
                    disabled={!canContinue()}
                    className="btn-primary"
                  >
                    Next
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <SummaryCard
          service={selectedService}
          addons={selectedAddons}
          customer={customer}
          slot={selectedSlot}
          total={total}
          deposit={deposit}
          paymentOption={paymentOption}
          settings={settings}
          stripeEnabled={stripeEnabled}
        />
      </div>
    </div>
  );
}
