import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PromotionBanner from '../components/PromotionBanner';
import { PromotionsProvider } from '../context/PromotionsContext';

export default function PublicLayout() {
  return (
    <PromotionsProvider>
      <div className="flex min-h-screen flex-col bg-blush-50">
        <PromotionBanner />
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </PromotionsProvider>
  );
}
