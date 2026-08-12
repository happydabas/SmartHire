import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { X, Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import Footer from './Footer';

function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="h-screen flex bg-slate-50/60 dark:bg-[#090a0f] overflow-hidden transition-colors duration-300">
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
          <div className="relative flex-grow-0 max-w-xs w-full bg-white dark:bg-[#090a0f] text-slate-800 dark:text-slate-205 p-5 animate-slide-right flex flex-col justify-between shadow-2xl z-10">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Workspace Portal</span>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1.5 text-slate-450 hover:text-slate-700 hover:bg-slate-55 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 rounded-lg transition-colors"
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
          {/* Mobile menu toggle bar (rendered only on small viewports since Navbar is removed) */}
          <div className="lg:hidden mb-4 flex justify-between items-center border-b border-slate-100 dark:border-slate-800/40 pb-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/60 rounded-xl transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="text-sm font-black text-blue-600 dark:text-white tracking-tight uppercase">
              Smart<span className="text-blue-600">Hire</span>
            </span>
            <div className="w-6 h-6" /> {/* spacer */}
          </div>

          <div className="animate-fadeIn animate-slideUp">
            <Outlet />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default DashboardLayout;
