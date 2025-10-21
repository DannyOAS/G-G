export function bookingConfirmationTemplate({ customer, booking, service, settings }) {
  const stripeEnabled = settings?.stripeEnabled;
  return {
    subject: `Booking Received · ${service.name}`,
    html: `
      <h2 style="font-family: 'Work Sans', Arial, sans-serif; color: #ff3b83;">Thank you ${customer.name}!</h2>
      <p>Your appointment request for <strong>${service.name}</strong> has been received.</p>
      ${
        stripeEnabled
          ? `<p>Complete your payment using the secure Stripe link included below to confirm your appointment.</p>`
          : `<p>Please send your e-transfer deposit to <strong>${settings.depositEmail}</strong> within 12 hours to secure your spot.</p>`
      }
      <p>
        <strong>Appointment Details</strong><br />
        Date: ${booking.dateLabel}<br />
        Time: ${booking.timeLabel}<br />
        Total: ${booking.totalDueLabel}
      </p>
      ${stripeEnabled ? '' : `<p>${settings.eTransferInstructions}</p>`}
      <p>We can't wait to style you!<br />Gorgeous & Groomed</p>
    `,
  };
}

export function paymentConfirmationTemplate({ customer, booking, service }) {
  return {
    subject: `Payment Confirmed · ${service.name}`,
    html: `
      <h2 style="font-family: 'Work Sans', Arial, sans-serif; color: #ff3b83;">Payment Confirmed</h2>
      <p>Hi ${customer.name},</p>
      <p>Your payment for <strong>${service.name}</strong> has been confirmed.</p>
      <p>We will see you on ${booking.dateLabel} at ${booking.timeLabel}. Get ready to shine!</p>
      <p>— Gorgeous & Groomed</p>
    `,
  };
}

export function bookingReminderTemplate({ customer, booking, service }) {
  return {
    subject: `Reminder · ${service.name} tomorrow`,
    html: `
      <h2 style="font-family: 'Work Sans', Arial, sans-serif; color: #ff3b83;">Your appointment is tomorrow!</h2>
      <p>Hi ${customer.name},</p>
      <p>This is a reminder for your <strong>${service.name}</strong> appointment on ${booking.dateLabel} at ${booking.timeLabel}.</p>
      <p>Please arrive 10 minutes early and come with detangled hair unless otherwise noted.</p>
      <p>See you soon!<br />Gorgeous & Groomed</p>
    `,
  };
}
