import { useOnlineStatus } from '@/ui/hooks/useOnlineStatus';

export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div className="bg-yellow-500 text-white px-4 py-2 text-center">
      <p className="text-sm font-medium">
        You are currently offline. Some actions will be queued until you reconnect.
      </p>
    </div>
  );
}
