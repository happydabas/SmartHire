import React from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log unexpected errors securely without showing them directly in production UI
    console.error("SmartHire ErrorBoundary caught unhandled crash:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Premium friendly fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
          <Card className="p-8 sm:p-12 border border-slate-100 bg-white rounded-3xl text-center space-y-6 max-w-md shadow-2xl shadow-slate-100/50 select-none">
            <div className="mx-auto w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center shadow-inner">
              <AlertOctagon className="w-8 h-8 text-rose-600 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-snug">Application Error</h2>
              <p className="text-sm font-semibold text-slate-400 leading-relaxed max-w-xs mx-auto">
                An unexpected error occurred and the application crashed. Please refresh or reload to retry.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <Button
                variant="primary"
                size="md"
                onClick={this.handleReload}
                className="w-full rounded-xl font-bold flex items-center justify-center gap-2 py-3 shadow-lg shadow-blue-500/10"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Application</span>
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
