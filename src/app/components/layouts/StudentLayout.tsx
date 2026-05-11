import { Outlet, Navigate } from "react-router";
import { StudentSidebar } from "../navigation/StudentSidebar";
import { StudentTopNavbar } from "../navigation/StudentTopNavbar";
import { MobileSidebar } from "../navigation/MobileSidebar";
import { useState } from "react";

export function StudentLayout() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("userRole");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // For development/demo, if no role is set, assume student
  const isStudent = role === "STUDENT" || !role;

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
        <StudentSidebar />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <StudentTopNavbar onMenuClick={() => setIsMobileSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>
      
      {/* Mobile Sidebar Overlay */}
      <MobileSidebar 
        isOpen={isMobileSidebarOpen} 
        onClose={() => setIsMobileSidebarOpen(false)} 
      />
    </div>
  );
}
