// OfflineBanner.jsx — shows a banner when the user has no network connection
import { useOnlineStatus } from '../hooks/useOnlineStatus'

function OfflineBanner() {
  const isOnline = useOnlineStatus()

  if (isOnline) return null

  return (
    <div className="fixed left-0 right-0 top-0 z-50 bg-yellow-400 py-2 text-center text-sm font-medium text-yellow-900">
      You are offline. Changes will sync automatically when you reconnect.
    </div>
  )
}

export default OfflineBanner
