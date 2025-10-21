# Gorgeous & Groomed

A mobile-first booking platform for the Gorgeous & Groomed braiding studio. The application delivers a polished client-facing experience with Tailwind CSS styling, a multi-step booking flow, and a Firebase-powered admin dashboard for managing services, availability, gallery content, promotions, and business settings.

## ✨ Feature highlights

### Public site
- **Home, Services, and Gallery pages** with rich visuals, service pricing, and a lightbox media experience.
- **Guided booking wizard** (service → availability → guest details → payment preference → confirmation) with real-time slot validation and deposit calculation.
- **Email notifications** sent through Gmail SMTP (via a serverless webhook) containing confirmation details and payment instructions.
- **Stripe-ready flow** – toggle on when credentials are provided to shift from e-transfer messaging to Stripe Checkout links.

### Admin dashboard (Firebase Auth protected)
- **Bookings management**: status tracking, manual payment confirmation, and CSV export.
- **Services management**: CRUD with add-ons, sub-services, variable pricing, deposits, and image uploads.
- **Availability controls**: weekly schedule, buffer minutes, lead time, and blocked dates.
- **Gallery & promotions**: upload media, reorder items, manage homepage banners with validity windows.
- **Business settings**: contact info, Gmail SMTP details, Stripe keys, and e-transfer instructions.

## 🛠️ Tech stack
- React 18 + Vite
- Tailwind CSS 3
- Firebase (Auth, Firestore, Storage, optional Analytics)
- React Router + React Query for routing/data hydration
- Gmail SMTP (via custom endpoint) for transactional emails
- Stripe integration scaffolding (disabled by default)

## 📁 Project structure
```
src/
  components/        Shared UI elements (navigation, banners, loaders)
  context/           Firebase/Auth/Promotion providers
  data/              Sample seed data + defaults
  hooks/             Firestore helpers (collections, documents)
  layouts/           Public + admin shells
  pages/             Public pages + admin modules
  routes/            Router definitions + guards
  utils/             Booking logic, CSV export, email templates
```

## 🚀 Getting started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   Duplicate `.env.example` → `.env` and fill in your credentials:

   ```env
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   VITE_FIREBASE_MEASUREMENT_ID=...   # optional analytics
   VITE_EMAIL_ENDPOINT=https://your-cloud-function-url/sendBookingEmail
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
   VITE_STRIPE_SECRET_KEY=sk_live_...
   ```

   These values are injected at build time via Vite's `import.meta.env`.

3. **Run the dev server**
   ```bash
   npm run dev
   ```
   The site is available at `http://localhost:5173` (mobile-first responsive layout).

4. **Create a production build**
   ```bash
   npm run build
   npm run preview
   ```

## 🔐 Firebase setup

1. **Create a Firebase project** and enable:
   - Authentication (Email/Password for admin access).
   - Cloud Firestore (production mode recommended with security rules).
   - Firebase Storage for service/gallery media.

2. **Firestore collections** (auto-created when the UI saves data):
   - `services` (documents containing pricing, add-ons, etc.)
   - `bookings`
   - `availability` → document `config`
   - `gallery`
   - `promotions`
   - `settings`
     - `business`, `email`, `payments` documents

3. **Storage buckets**
   - Images upload to `services/` and `gallery/`. Configure security rules to allow authenticated writes for admin users only.

4. **Authentication**
   - Manually create admin users in Firebase Auth.
   - (Optional) use [Custom Claims](https://firebase.google.com/docs/auth/admin/custom-claims) to gate specific roles.

## 📬 Gmail SMTP webhook

Transactional emails are sent by posting to `VITE_EMAIL_ENDPOINT`. Implement this endpoint with your preferred serverless platform (Firebase Functions, Cloud Run, Vercel, etc.) using a Gmail app password.

Example Node.js (Express) handler using Nodemailer:
```js
import functions from 'firebase-functions';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export const sendBookingEmail = functions.https.onRequest(async (req, res) => {
  const { to, subject, html } = req.body;
  await transporter.sendMail({
    from: `Gorgeous & Groomed <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  });
  res.status(200).send({ ok: true });
});
```
Update the Firebase security rules to restrict who can trigger the endpoint.

## 💳 Stripe enablement

- The UI reads the `settings/payments` document to decide whether to surface Stripe messaging.
- Toggle **Enable Stripe payments** inside the admin settings page after storing publishable/secret keys.
- When enabled, the booking confirmation email references Stripe and the Firestore booking document includes `paymentGateway: "stripe"` for downstream automations.
- Integrate with Stripe Checkout by listening for new bookings (Cloud Function or backend service) and creating payment links/intents referencing the booking ID.

## 📧 Email templates

Located in `src/utils/emailTemplates.js`:
1. Booking confirmation (e-transfer or Stripe instructions depending on toggle)
2. Payment confirmation (trigger manually from back office)
3. Booking reminder (send 24h before appointment via scheduled Cloud Function)

## 🧪 Testing notes
- The project uses React Query + Firestore listeners; data updates live as documents change.
- For local testing without Firebase, the UI falls back to sample data in `src/data/`.
- To test booking logic without sending emails, omit `VITE_EMAIL_ENDPOINT` — the app logs a console warning instead of throwing.

## 📱 Responsive design
- Tailwind utility classes deliver a phone-first layout with progressive enhancements up to desktop breakpoints.
- Key components (hero, booking steps, admin tables) are optimized for touch interactions and narrow viewports.

## ✅ Production checklist
- Populate `.env` with production Firebase + SMTP + Stripe credentials.
- Configure Firebase Hosting or any static host with `npm run build` output (`dist/`).
- Harden Firestore and Storage security rules.
- Deploy the SMTP webhook and Stripe integration functions (if using automation for payment links).
- Update social/contact details from the Admin → Settings page.

Enjoy creating unforgettable braid experiences with Gorgeous & Groomed! 💖
