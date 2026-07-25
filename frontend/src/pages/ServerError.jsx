import React from 'react';
import ServerErrorComponent from '@/components/common/ServerError';

export function ServerErrorPage() {
  const handleRetry = () => {
    // Reload back to main screen or dashboard
    window.location.href = '/';
  };

  return <ServerErrorComponent onRetry={handleRetry} />;
}

export default ServerErrorPage;
