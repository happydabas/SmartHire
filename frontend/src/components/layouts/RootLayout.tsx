import React from 'react'
import { Outlet, Link, NavLink } from 'react-router-dom'
import { Briefcase } from 'lucide-react'

/**
 * RootLayout provides standard visual shells (headers, page content, footers).
 * Integrates blur header styles.
 */
const RootLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Dynamic Blur Header */}
      <header className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              <Briefcase className="w-6 h-6 text-blue-600" />
              <span>SmartHire</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <NavLink 
                to="/" 
                className={({ isActive }) => 
                  isActive ? "text-blue-600" : "text-slate-600 hover:text-slate-900 transition-colors"
                }
              >
                Home
              </NavLink>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
              Foundation Active
            </div>
          </div>
        </div>
      </header>

      {/* Primary Visual Outlet */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Outlet />
      </main>

      {/* Footer bar */}
      <footer className="w-full bg-white border-t border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} SmartHire Job Portal. Build phase.
          </p>
          <div className="flex gap-6 text-sm text-slate-400">
            <span>React 19 + TypeScript</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default RootLayout
