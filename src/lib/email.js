import axios from 'axios';

const emailEndpoint = import.meta.env.VITE_EMAIL_ENDPOINT;

export async function sendEmail(payload) {
  if (!emailEndpoint) {
    console.warn('Email endpoint missing. Configure VITE_EMAIL_ENDPOINT to enable email sending.');
    return;
  }

  await axios.post(emailEndpoint, payload);
}
