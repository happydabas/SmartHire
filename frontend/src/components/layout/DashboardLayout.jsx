import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

function DashboardLayout() {
  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
      {/* Top Navbar */}
      <Navbar />

      {/* Sidebar + Main Content — fills remaining height */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar: fixed height, never scrolls */}
        <Sidebar />

        {/* Main area: scrollable */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          <main className="flex-1 p-8">
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;

