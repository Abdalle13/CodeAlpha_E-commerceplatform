import React from 'react';
import { Outlet } from 'react-router-dom';
import { AnnouncementBar } from './AnnouncementBar';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export const StorefrontLayout = () => (
  <div className="min-h-screen flex flex-col bg-warm-ivory">
    <AnnouncementBar />
    <Navbar />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
);
