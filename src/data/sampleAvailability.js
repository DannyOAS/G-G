export const weeklyScheduleTemplate = {
  sunday: { enabled: false, slots: [] },
  monday: { enabled: true, start: '09:00', end: '17:00' },
  tuesday: { enabled: true, start: '09:00', end: '17:00' },
  wednesday: { enabled: true, start: '10:00', end: '19:00' },
  thursday: { enabled: true, start: '10:00', end: '19:00' },
  friday: { enabled: true, start: '09:00', end: '15:00' },
  saturday: { enabled: true, start: '08:00', end: '14:00' },
};

export const defaultSettings = {
  businessName: 'Gorgeous & Groomed',
  address: '123 Glamour Ave Suite 7B, Toronto, ON',
  phone: '(555) 123-4567',
  email: 'hello@gorgeousandgroomed.com',
  instagram: 'https://www.instagram.com/gorgeousandgroomed',
  facebook: 'https://www.facebook.com/gorgeousandgroomed',
  bufferMinutes: 15,
  leadTimeHours: 24,
  depositEmail: 'payments@gorgeousandgroomed.com',
  eTransferInstructions:
    'Send your e-transfer to payments@gorgeousandgroomed.com within 12 hours to confirm your appointment. Include your name and appointment date in the message.',
  stripeEnabled: false,
};
