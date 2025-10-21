import React from 'react';
import { NavLink } from 'react-router-dom';
import { MapPinIcon, PhoneIcon, EnvelopeIcon, SparklesIcon } from '@heroicons/react/24/outline';

export default function Footer() {
  return (
    <footer className="mt-16 bg-black text-white">
      <div className="container-padded grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 className="font-display text-2xl font-semibold">Gorgeous & Groomed</h3>
          <p className="mt-4 text-sm text-white/70">
            Luxury braiding artistry celebrating texture, style, and confidence. Mobile-first booking made effortless.
          </p>
          <div className="mt-6 flex items-center gap-2 text-sm text-white/70">
            <SparklesIcon className="h-5 w-5 text-blush-400" />
            <span>Modern feminine experiences crafted with care.</span>
          </div>
        </div>
        <div>
          <h4 className="font-semibold uppercase tracking-wide text-white/60">Navigate</h4>
          <nav className="mt-4 flex flex-col gap-2 text-sm text-white/70">
            <NavLink to="/services" className="hover:text-white">
              Services
            </NavLink>
            <NavLink to="/gallery" className="hover:text-white">
              Gallery
            </NavLink>
            <NavLink to="/booking" className="hover:text-white">
              Book an Appointment
            </NavLink>
          </nav>
        </div>
        <div>
          <h4 className="font-semibold uppercase tracking-wide text-white/60">Visit</h4>
          <p className="mt-4 flex items-start gap-3 text-sm text-white/70">
            <MapPinIcon className="mt-1 h-5 w-5 text-blush-400" />
            <span>
              123 Glamour Ave Suite 7B
              <br />
              Toronto, ON
            </span>
          </p>
        </div>
        <div>
          <h4 className="font-semibold uppercase tracking-wide text-white/60">Contact</h4>
          <div className="mt-4 space-y-3 text-sm text-white/70">
            <p className="flex items-center gap-3">
              <PhoneIcon className="h-5 w-5 text-blush-400" />
              <span>(555) 123-4567</span>
            </p>
            <p className="flex items-center gap-3">
              <EnvelopeIcon className="h-5 w-5 text-blush-400" />
              <span>hello@gorgeousandgroomed.com</span>
            </p>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs text-white/60">
        © {new Date().getFullYear()} Gorgeous & Groomed. All rights reserved.
      </div>
    </footer>
  );
}
