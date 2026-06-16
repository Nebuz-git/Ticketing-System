import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { Ticket, Clock, CheckCircle, XCircle, BarChart2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL;

interface DashboardStats {
  total: number;
  open: number;
  in_progress: number;
  resolved: number;
  closed: number;
  recentTickets: {
    id: string;
    title: string;
    status: string;
    priority: string;
    createdAt: string;
    user: { username: string; department: string | null };
  }[];
}

const statusConfig: Record<string, { label: string; color: string }> = {
  open: { label: "Open", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  in_progress: { label: "In Progress", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300" },
  resolved: { label: "Resolved", color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" },
  closed: { label: "Closed", color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: "Low", color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
  medium: { label: "Medium", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300" },
  high: { label: "High", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300" },
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/api/tickets/stats/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { label: "Total Tickets", value: stats?.total ?? 0, icon: BarChart2, color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20" },
    { label: "Open", value: stats?.open ?? 0, icon: Ticket, color: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20" },
    { label: "In Progress", value: stats?.in_progress ?? 0, icon: Clock, color: "text-orange-600 bg-orange-50 dark:bg-orange-900/20" },
    { label: "Resolved", value: stats?.resolved ?? 0, icon: CheckCircle, color: "text-green-600 bg-green-50 dark:bg-green-900/20" },
    { label: "Closed", value: stats?.closed ?? 0, icon: XCircle, color: "text-gray-500 bg-gray-100 dark:bg-gray-800" },
  ];

  return (
    <div className="space-y-6">

      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Welcome back, {user?.username} 
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Here's what's happening with your tickets today.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex flex-col gap-3 transition-colors"
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${card.color}`}>
              <card.icon size={18} />
            </div>
            <div>
              {loading ? (
                <div className="h-7 w-10 bg-gray-100 dark:bg-gray-800 rounded animate-pulse mb-1" />
              ) : (
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{card.value}</p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent tickets */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl transition-colors">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Tickets</h3>
          <a href="/tickets" className="text-xs text-blue-600 hover:underline font-medium">View all</a>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
            ))}
          </div>
        ) : !stats?.recentTickets?.length ? (
          <div className="py-12 text-center">
            <Ticket size={32} className="text-gray-300 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No tickets yet</p>
            <button
              onClick={() => navigate("/tickets")}
              className="text-xs text-blue-600 hover:underline mt-1 inline-block"
            >
              Create your first ticket
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {stats.recentTickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => navigate(`/tickets/${ticket.id}`)}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
              >
                <div className="flex flex-col gap-0.5 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{ticket.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {ticket.user.username}
                    {ticket.user.department ? ` · ${ticket.user.department}` : ""}
                    {" · "}
                    {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${priorityConfig[ticket.priority]?.color}`}>
                    {priorityConfig[ticket.priority]?.label}
                  </span>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${statusConfig[ticket.status]?.color}`}>
                    {statusConfig[ticket.status]?.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}