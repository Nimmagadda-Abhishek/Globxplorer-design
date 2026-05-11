import { useEffect } from "react";
import { activityApi } from "../../lib/api";

const HEARTBEAT_ROLES = [
  "AGENT_MANAGER",
  "VISA_AGENT",
  "TELECALLER",
  "COUNSELLOR",
  "ALUMNI_MANAGER"
];

export function useHeartbeat() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("userRole");

  useEffect(() => {
    if (!token || !role || !HEARTBEAT_ROLES.includes(role)) {
      return;
    }

    // Send initial heartbeat
    activityApi.sendHeartbeat().catch(console.error);

    // Setup interval for subsequent heartbeats (every 2 minutes)
    const intervalId = setInterval(() => {
      activityApi.sendHeartbeat().catch(err => {
        console.error("Heartbeat failed", err);
      });
    }, 2 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [token, role]);
}
