import React from 'react';
import { Route, Routes } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import AdminLayout from '../layouts/AdminLayout';
import HomePage from '../pages/HomePage';
import ServicesPage from '../pages/ServicesPage';
import GalleryPage from '../pages/GalleryPage';
import BookingPage from '../pages/BookingPage';
import AdminBookingsPage from '../pages/admin/AdminBookingsPage';
import AdminServicesPage from '../pages/admin/AdminServicesPage';
import AdminAvailabilityPage from '../pages/admin/AdminAvailabilityPage';
import AdminGalleryPage from '../pages/admin/AdminGalleryPage';
import AdminPromotionsPage from '../pages/admin/AdminPromotionsPage';
import AdminSettingsPage from '../pages/admin/AdminSettingsPage';
import LoginPage from '../pages/LoginPage';
import ProtectedRoute from './ProtectedRoute';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/booking" element={<BookingPage />} />
      </Route>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminBookingsPage />} />
        <Route path="bookings" element={<AdminBookingsPage />} />
        <Route path="services" element={<AdminServicesPage />} />
        <Route path="availability" element={<AdminAvailabilityPage />} />
        <Route path="gallery" element={<AdminGalleryPage />} />
        <Route path="promotions" element={<AdminPromotionsPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>
    </Routes>
  );
}
