import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AuthProvider from '@/contexts/AuthProvider';
import NotificationProvider from '@/contexts/NotificationProvider';
import AppRoutes from '@/routes/AppRoutes';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { Toaster } from 'sonner';

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <NotificationProvider>
            <AppRoutes />
            <Toaster position="top-right" richColors closeButton />
          </NotificationProvider>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
