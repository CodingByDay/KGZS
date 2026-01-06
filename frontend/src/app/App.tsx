import { useEffect } from 'react';
import { AppRouter } from './router/AppRouter';
import { OfflineBanner } from '@/ui/components/OfflineBanner';
import { OfflineQueue } from '@/infrastructure/storage/OfflineQueue';
import { apiClient } from '@/infrastructure/api/apiClient';

function App() {
  useEffect(() => {
    const handleOnline = async () => {
      try {
        await OfflineQueue.flushQueue(async (endpoint, options) => {
          return apiClient.request(endpoint, options);
        });
      } catch (error) {
        console.error('Failed to flush offline queue:', error);
      }
    };

    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return (
    <>
      <OfflineBanner />
      <AppRouter />
    </>
  );
}

export default App;
