import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/services', label: 'Services' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/booking', label: 'Book Now' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/30 bg-blush-50/80 backdrop-blur">
      <div className="container-padded flex h-16 items-center justify-between">
        <NavLink to="/" className="font-display text-2xl font-semibold text-blush-700">
          Gorgeous & Groomed
        </NavLink>
        <nav className="hidden items-center gap-1 text-sm font-semibold text-gray-900 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 transition ${
                  isActive ? 'bg-white text-blush-600 shadow-glow' : 'hover:bg-white/80 hover:text-blush-600'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <button
          className="rounded-full bg-white p-2 text-blush-600 shadow md:hidden"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Open navigation"
        >
          {menuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
        </button>
      </div>
      {menuOpen && (
        <div className="md:hidden">
          <div className="container-padded space-y-2 pb-6">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `block rounded-2xl bg-white px-4 py-3 text-lg font-semibold transition ${
                    isActive ? 'text-blush-600 shadow-glow' : 'text-gray-900'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
