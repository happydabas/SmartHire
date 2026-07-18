import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, Server, HelpCircle, Loader2 } from 'lucide-react'

// Simulated fetch helper demonstrating React Query integration
const fetchServiceStatus = async (): Promise<{ status: string; database: string }> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return { status: 'healthy', database: 'connected' }
}

const Home: React.FC = () => {
  // TanStack Query hook tracking mock service calls
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['serviceStatus'],
    queryFn: fetchServiceStatus,
  })

  return (
    <div className="space-y-12">
      {/* Hero Welcome banner */}
      <section className="p-8 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-3xl shadow-xl shadow-blue-500/10 space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight">SmartHire Frontend Foundation</h1>
        <p className="text-blue-100 max-w-xl text-lg">
          The React 19 client environment is fully operational. Routing, type validations, path mappings, Tailwind CSS styling, and queries providers are bound.
        </p>
      </section>

      {/* Diagnostics verification cards grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Core Stack Setup status */}
        <div className="bg-white p-6 border border-slate-200/80 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800">React 19 & Vite</h3>
          </div>
          <p className="text-sm text-slate-600">
            TypeScript compilation and path aliases (`@/`) compile correctly. Standard routing is enabled.
          </p>
        </div>

        {/* Tailwind Status card */}
        <div className="bg-white p-6 border border-slate-200/80 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800">Tailwind Engine</h3>
          </div>
          <p className="text-sm text-slate-600">
            CSS utilities, hover behaviors, layouts, flex items, and animations are active.
          </p>
        </div>

        {/* TanStack Query Status */}
        <div className="bg-white p-6 border border-slate-200/80 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800">Query Cache Client</h3>
            </div>
            {isLoading && <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />}
          </div>

          {isLoading ? (
            <p className="text-sm text-slate-500 italic">Validating mock caching provider...</p>
          ) : isError ? (
            <div className="text-xs text-red-600 font-semibold bg-red-50 p-2 rounded-lg">
              Failed to query state check.
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-slate-600">
                Data cached successfully. Results:
              </p>
              <div className="text-xs font-mono bg-slate-50 p-2 rounded-lg border border-slate-100 flex justify-between">
                <span className="text-slate-500">status:</span>
                <span className="text-emerald-600 font-bold">{data?.status}</span>
              </div>
              <button 
                onClick={() => refetch()}
                className="w-full py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-lg transition-all"
              >
                Re-trigger Cache Query
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Home
