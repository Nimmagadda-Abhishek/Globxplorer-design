import { Outlet } from "react-router";
import { AlumniManagerSidebar } from "../navigation/AlumniManagerSidebar";
import { AlumniManagerTopNavbar } from "../navigation/AlumniManagerTopNavbar";
import { useHeartbeat } from "../../../app/utils/heartbeat";

export function AlumniManagerLayout() {
  // Use centralized heartbeat hook
  useHeartbeat();
  return (
    <div className="min-h-screen bg-slate-50 font-sans flex">
      <AlumniManagerSidebar />
      <div className="flex-1 ml-72 flex flex-col min-h-screen">
        <AlumniManagerTopNavbar />
        <main className="flex-1 p-8 pb-32">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
