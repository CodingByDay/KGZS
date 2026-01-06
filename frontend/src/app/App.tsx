import { useEffect } from 'react';
import { AppRouter } from './router/AppRouter';
import { OfflineBanner } from '@/ui/components/OfflineBanner';
import { OfflineQueue } from '@/infrastructure/storage/OfflineQueue';
import { apiClient } from '@/infrastructure/api/apiClient';
import { signalRService } from '@/infrastructure/realtime/SignalRService';
import { StorageService } from '@/infrastructure/storage/StorageService';

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

    // Connect SignalR if user is authenticated
    const token = StorageService.getToken();
    if (token) {
      signalRService.connect().catch((error) => {
        console.error('Failed to connect SignalR:', error);
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      signalRService.disconnect();
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
