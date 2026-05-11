import { Outlet, Navigate } from "react-router";
import { Sidebar } from "../navigation/Sidebar";
import { TopNavbar } from "../navigation/TopNavbar";
import { MobileSidebar } from "../navigation/MobileSidebar";
import { VisaAgentSidebar } from "../navigation/VisaAgentSidebar";
import { useState, useEffect } from "react";
import { useHeartbeat } from "../../../app/utils/heartbeat";

export function DashboardLayout() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("userRole");
  
  // Use centralized heartbeat hook
  useHeartbeat();

  const isStaff = role === "ADMIN" || role === "AGENT_MANAGER" || role === "AGENT" || role === "COUNSELLOR" || role === "TELECALLER" || role === "VISA_AGENT";
  const isVisaAgent = role === "VISA_AGENT";
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Redirect non-staff roles to their specific portals
  if (role === "STUDENT") return <Navigate to="/student" replace />;
  if (role === "ALUMNI") return <Navigate to="/alumni" replace />;
  if (role === "ALUMNI_MANAGER") return <Navigate to="/alumni-manager" replace />;

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      {/* Sidebar for Desktop */}
      {isStaff && (
        <div className="hidden lg:block">
          {isVisaAgent ? <VisaAgentSidebar /> : <Sidebar />}
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {isStaff && (
        <MobileSidebar 
          isOpen={isMobileSidebarOpen} 
          onClose={() => setIsMobileSidebarOpen(false)} 
        />
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar onMenuClick={() => setIsMobileSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <div className={`${isStaff ? "px-6 py-8" : "max-w-[1600px] mx-auto"}`}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}