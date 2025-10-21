import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bars3Icon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

const links = [
  { to: '/admin/bookings', label: 'Bookings' },
  { to: '/admin/services', label: 'Services' },
  { to: '/admin/availability', label: 'Availability' },
  { to: '/admin/gallery', label: 'Gallery' },
  { to: '/admin/promotions', label: 'Promotions' },
  { to: '/admin/settings', label: 'Settings' },
];

export default function AdminLayout() {
  const { logout, user } = useAuth();
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-900/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              className="rounded-md border border-white/20 p-2 sm:hidden"
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <div>
              <p className="font-display text-xl">Gorgeous & Groomed Admin</p>
              {user && <p className="text-sm text-white/70">{user.email}</p>}
            </div>
          </div>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            Logout
          </button>
        </div>
      </header>
      <div className="mx-auto flex max-w-6xl flex-1 flex-col gap-6 px-4 py-6 sm:flex-row">
        <nav
          className={`card-glass w-full rounded-2xl p-4 text-sm text-slate-200 sm:w-56 ${
            menuOpen ? 'block' : 'hidden sm:block'
          }`}
        >
          <ul className="space-y-1">
            {links.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center rounded-xl px-3 py-2 font-semibold transition ${
                      isActive ? 'bg-white/15 text-white shadow-glow' : 'text-white/70 hover:bg-white/10'
                    }`
                  }
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <section className="flex-1">
          <Outlet />
        </section>
      </div>
    </div>
  );
}
