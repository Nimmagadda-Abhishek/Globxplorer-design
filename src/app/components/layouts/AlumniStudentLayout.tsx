import { Outlet } from "react-router";
import { AlumniStudentSidebar } from "../navigation/AlumniStudentSidebar";
import { AlumniStudentTopNavbar } from "../navigation/AlumniStudentTopNavbar";

export function AlumniStudentLayout() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans flex">
      <AlumniStudentSidebar />
      <div className="flex-1 ml-72 flex flex-col min-h-screen">
        <AlumniStudentTopNavbar />
        <main className="flex-1 p-8 pb-32">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
