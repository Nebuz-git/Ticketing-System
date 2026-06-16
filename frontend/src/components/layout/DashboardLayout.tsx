import Sidebar from "./Sidebar";
import Header from "./Header";
import { Outlet, useLocation } from "react-router-dom";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/tickets": "Tickets",
  "/users": "Users",
  "/audit-logs": "Audit Logs",
};

export default function DashboardLayout() {
  const location = useLocation();
  const title = pageTitles[location.pathname] ?? "TicketSys";

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] dark:bg-gray-950 transition-colors">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header title={title} />
        <main className="flex-1 overflow-y-scroll p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}