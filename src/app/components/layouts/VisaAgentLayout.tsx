import { Outlet, Navigate } from "react-router";
import { VisaAgentSidebar } from "../navigation/VisaAgentSidebar";
import { VisaAgentTopNavbar } from "../navigation/VisaAgentTopNavbar";
import { MobileSidebar } from "../navigation/MobileSidebar";
import { useState, useEffect } from "react";
import { useHeartbeat } from "../../../app/utils/heartbeat";

export function VisaAgentLayout() {
  // Use centralized heartbeat hook
  useHeartbeat();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("userRole");
  
  // For development/demo, if no role is set, assume visa agent
  const isVisaAgent = role === "VISA_AGENT" || !role;

  // In production, we'd uncomment this
  /*
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  */

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      {/* Sidebar for Desktop */}
      <div className="hidden lg:block">
        <VisaAgentSidebar />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <VisaAgentTopNavbar />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>
      
      {/* Mobile Sidebar - We can update it later for Visa Agent specific menus */}
      <div className="lg:hidden">
        <MobileSidebar />
      </div>
    </div>
  );
}
