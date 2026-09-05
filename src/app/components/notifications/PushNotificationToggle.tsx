import { useEffect, useState, useCallback } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import {
  enablePushNotifications,
  unsubscribeFromPush,
  isPushSubscribed,
  getPushPermissionState,
} from "../../utils/pushNotifications";
import { toast } from "sonner";

/**
 * A self-contained toggle component that lets users opt-in / opt-out
 * of browser push notifications.
 *
 * Usage: Drop <PushNotificationToggle /> anywhere in the settings or
 * notification UI.
 */
export function PushNotificationToggle() {
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [permissionState, setPermissionState] = useState<
    NotificationPermission | "unsupported"
  >(getPushPermissionState());

  // Check current subscription status on mount
  useEffect(() => {
    isPushSubscribed()
      .then(setSubscribed)
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = useCallback(async () => {
    setLoading(true);
    try {
      if (subscribed) {
        const ok = await unsubscribeFromPush();
        if (ok) {
          setSubscribed(false);
          toast.success("Push notifications disabled");
        } else {
          toast.error("Could not unsubscribe — please try again");
        }
      } else {
        const ok = await enablePushNotifications();
        if (ok) {
          setSubscribed(true);
          setPermissionState("granted");
          toast.success("Push notifications enabled!");
        } else {
          // Re-check permission state to show the right message
          const perm = getPushPermissionState();
          setPermissionState(perm);
          if (perm === "denied") {
            toast.error(
              "Notifications are blocked. Please enable them in your browser settings.",
            );
          } else if (perm === "unsupported") {
            toast.error("Your browser does not support push notifications.");
          } else {
            toast.error(
              "Could not enable push notifications. Make sure VAPID keys are configured.",
            );
          }
        }
      }
    } catch (err) {
      console.error("[PushToggle]", err);
      toast.error("Something went wrong — check console for details");
    } finally {
      setLoading(false);
    }
  }, [subscribed]);

  // Don't render if the browser doesn't support it
  if (permissionState === "unsupported") {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4 bg-white rounded-2xl border border-[#E5E7EB] shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            subscribed
              ? "bg-indigo-50 text-indigo-600"
              : "bg-gray-50 text-gray-400"
          }`}
        >
          {subscribed ? (
            <Bell className="w-5 h-5" />
          ) : (
            <BellOff className="w-5 h-5" />
          )}
        </div>
        <div>
          <p className="text-sm font-bold text-[#111827]">
            Browser Push Notifications
          </p>
          <p className="text-xs text-[#6B7280]">
            {subscribed
              ? "You'll receive native browser alerts"
              : permissionState === "denied"
                ? "Blocked — update browser settings to enable"
                : "Get notified even when this tab is closed"}
          </p>
        </div>
      </div>

      <button
        onClick={handleToggle}
        disabled={loading || permissionState === "denied"}
        className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
          subscribed ? "bg-indigo-600" : "bg-gray-200"
        }`}
        role="switch"
        aria-checked={subscribed}
        aria-label="Toggle push notifications"
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ${
            subscribed ? "translate-x-6" : "translate-x-1"
          }`}
        />
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-4 h-4 text-white animate-spin" />
          </span>
        )}
      </button>
    </div>
  );
}
