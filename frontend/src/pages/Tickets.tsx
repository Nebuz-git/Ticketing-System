import { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Search, MoreVertical, Pencil, Trash2, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import CreateTicketDrawer from "../components/tickets/CreateTicketDrawer";
import ConfirmModal from "../components/ui/ConfirmModal";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

interface Ticket {
  id: string;
  title: string;
  status: string;
  priority: string;
  createdAt: string;
  user: { username: string; department: string | null };
}

const statusConfig: Record<string, string> = {
  open: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  in_progress: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  resolved: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  closed: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

const priorityConfig: Record<string, string> = {
  low: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  critical: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

const statusLabel: Record<string, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

export default function Tickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editTicket, setEditTicket] = useState<Ticket | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Ticket | null>(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const fetchTickets = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/tickets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTickets(res.data);
    } catch {
      toast.error("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    const handleClickOutside = () => setOpenMenu(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`${API_URL}/api/tickets/${deleteTarget.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Ticket deleted");
      setDeleteTarget(null);
      fetchTickets();
    } catch {
      toast.error("Failed to delete ticket");
    }
  };

  const filtered = tickets.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    const matchPriority = priorityFilter === "all" || t.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  return (
    <div className="flex flex-col h-full space-y-5">

      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tickets</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {filtered.length} of {tickets.length} ticket{tickets.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => { setEditTicket(null); setDrawerOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus size={16} />
          New Ticket
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 transition"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 px-3 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 outline-none focus:border-blue-500 transition cursor-pointer"
        >
          <option value="all">All Statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="h-9 px-3 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 outline-none focus:border-blue-500 transition cursor-pointer"
        >
          <option value="all">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-visible transition-colors">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Title</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Priority</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Created by</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Created</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  {[...Array(6)].map((_, j) => (
                    <td key={j} className="px-5 py-4">
                      <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-sm text-gray-400 dark:text-gray-600">
                  No tickets found
                </td>
              </tr>
) : (
  <>
    {/* Active tickets */}
    {filtered.filter(t => t.status === "open" || t.status === "in_progress").length > 0 && (
      <>
        <tr className="bg-gray-50 dark:bg-gray-800/30">
          <td colSpan={6} className="px-5 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Active
          </td>
        </tr>
        {filtered
          .filter(t => t.status === "open" || t.status === "in_progress")
          .map((ticket) => (
            <tr
              key={ticket.id}
              onClick={() => navigate(`/tickets/${ticket.id}`)}
              className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
            >
              <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-white max-w-[260px] truncate">
                {ticket.title}
              </td>
              <td className="px-5 py-3.5">
                <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${statusConfig[ticket.status]}`}>
                  {statusLabel[ticket.status]}
                </span>
              </td>
              <td className="px-5 py-3.5">
                <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full capitalize ${priorityConfig[ticket.priority]}`}>
                  {ticket.priority}
                </span>
              </td>
              <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">
                {ticket.user.username}
                {ticket.user.department ? ` · ${ticket.user.department}` : ""}
              </td>
              <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
              </td>
              <td
                className="px-5 py-3.5 relative overflow-visible"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === ticket.id ? null : ticket.id); }}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 transition-colors"
                >
                  <MoreVertical size={15} />
                </button>
                {openMenu === ticket.id && (
                  <div className="absolute right-0 bottom-10 z-50 w-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 text-sm">
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/tickets/${ticket.id}`); setOpenMenu(null); }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Eye size={14} /> View
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditTicket(ticket); setDrawerOpen(true); setOpenMenu(null); }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Pencil size={14} /> Edit
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget(ticket); setOpenMenu(null); }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
      </>
    )}

    {/* Resolved/Closed tickets */}
    {filtered.filter(t => t.status === "resolved" || t.status === "closed").length > 0 && (
      <>
        <tr className="bg-gray-50 dark:bg-gray-800/30">
          <td colSpan={6} className="px-5 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Resolved & Closed
          </td>
        </tr>
        {filtered
          .filter(t => t.status === "resolved" || t.status === "closed")
          .map((ticket) => (
            <tr
              key={ticket.id}
              onClick={() => navigate(`/tickets/${ticket.id}`)}
              className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer opacity-60"
            >
              <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-white max-w-[260px] truncate">
                <span className="line-through">{ticket.title}</span>
              </td>
              <td className="px-5 py-3.5">
                <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${statusConfig[ticket.status]}`}>
                  {statusLabel[ticket.status]}
                </span>
              </td>
              <td className="px-5 py-3.5">
                <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full capitalize ${priorityConfig[ticket.priority]}`}>
                  {ticket.priority}
                </span>
              </td>
              <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">
                {ticket.user.username}
                {ticket.user.department ? ` · ${ticket.user.department}` : ""}
              </td>
              <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
              </td>
              <td
                className="px-5 py-3.5 relative overflow-visible"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === ticket.id ? null : ticket.id); }}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 transition-colors"
                >
                  <MoreVertical size={15} />
                </button>
                {openMenu === ticket.id && (
                  <div className="absolute right-0 bottom-10 z-50 w-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 text-sm">
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/tickets/${ticket.id}`); setOpenMenu(null); }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Eye size={14} /> View
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditTicket(ticket); setDrawerOpen(true); setOpenMenu(null); }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Pencil size={14} /> Edit
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget(ticket); setOpenMenu(null); }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
      </>
    )}
  </>
)}
          </tbody>
        </table>
      </div>

      <CreateTicketDrawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEditTicket(null); }}
        onSuccess={() => { setDrawerOpen(false); setEditTicket(null); fetchTickets(); }}
        editTicket={editTicket}
      />

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Ticket"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        destructive
      />
    </div>
  );
}