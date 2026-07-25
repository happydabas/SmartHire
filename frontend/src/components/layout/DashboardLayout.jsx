import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { X } from 'lucide-react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
      {/* Top Navbar with onMenuClick toggle */}
      <Navbar onMenuClick={() => setIsSidebarOpen(true)} />

      {/* Sidebar + Main Content — fills remaining height */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar (collapsible) */}
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

        {/* Mobile Slide-out Drawer Overlay */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop Overlay */}
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
              onClick={() => setIsSidebarOpen(false)}
            />

            {/* Slide-out Panel */}
            <div className="relative flex-grow-0 max-w-xs w-full bg-slate-900 text-white p-5 animate-slide-right flex flex-col justify-between shadow-2xl z-10">
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Workspace Portal</span>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sidebar Menu in Mobile Mode */}
              <div className="flex-grow flex flex-col min-h-0 overflow-y-auto">
                <Sidebar isMobile={true} onLinkClick={() => setIsSidebarOpen(false)} />
              </div>
            </div>
          </div>
        )}

        {/* Main area: scrollable */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <main className="flex-1 p-4 sm:p-6 md:p-8">
            <div className="animate-fadeIn animate-slideUp">
              <Outlet />
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
