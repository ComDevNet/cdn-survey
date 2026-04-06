export default function NetworkStatusBanner({ isOffline }: { isOffline: boolean }) {
  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 w-full bg-destructive text-destructive-foreground text-center py-2 z-50 animate-slide-in-right text-sm font-semibold tracking-wide">
      You are currently offline. Responses will be securely formatted but cannot be submitted until connection is restored.
    </div>
  );
}
