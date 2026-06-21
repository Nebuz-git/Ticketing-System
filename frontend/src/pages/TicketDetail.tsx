import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Clock,
  User,
  Building2,
  Calendar,
  CheckCircle,
  XCircle,
  Ticket
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import ConfirmModal from "@/components/ui/ConfirmModal";
import CreateTicketDrawer from "@/components/tickets/CreateTicketDrawer";

import api from "@/lib/axios";

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

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    username: string;
    email: string;
    department: string | null;
  };
}

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const fetchTicket = async () => {
    try {
      const res = await api.get(`/api/tickets/${id}`)
      setTicket(res.data);
    } catch {
      toast.error("Failed to load ticket");
      navigate("/tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const handleDelete = async () => {
    try {
      await api.delete(`/api/tickets/${id}`)
      toast.success("Ticket deleted");
      navigate("/tickets");
    } catch {
      toast.error("Failed to delete ticket");
    }
  };

  if (loading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-8 w-48 bg-gray-100 dark:bg-gray-800 rounded" />
        <div className="h-40 bg-gray-100 dark:bg-gray-800 rounded-xl" />
        <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-xl" />
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <div className="space-y-5">
  
      {/* Back + actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/tickets")}
          className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Tickets
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Pencil size={14} />
            Edit
          </button>
          <button
            onClick={() => setDeleteOpen(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 border border-red-200 dark:border-red-900 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>
  
      {/* Status banner */}
      {ticket.status === "resolved" && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-700 dark:text-green-400">
              This ticket has been resolved
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Last updated {formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}
            </p>
          </div>
        </div>
      )}
  
      {ticket.status === "closed" && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <XCircle size={16} className="text-gray-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              This ticket is closed
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Last updated {formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}
            </p>
          </div>
        </div>
      )}
  
      {ticket.status === "in_progress" && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <Clock size={16} className="text-yellow-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
              This ticket is in progress
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Someone is actively working on this
            </p>
          </div>
        </div>
      )}
  
      {ticket.status === "open" && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <Ticket size={16} className="text-blue-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
              This ticket is open and awaiting action
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Submitted {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
      )}
  
      {/* Main card */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 space-y-5 transition-colors">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white leading-snug">
            {ticket.title}
          </h2>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${priorityConfig[ticket.priority]?.color}`}>
              {priorityConfig[ticket.priority]?.label}
            </span>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusConfig[ticket.status]?.color}`}>
              {statusConfig[ticket.status]?.label}
            </span>
          </div>
        </div>
  
        <div className="border-t border-gray-100 dark:border-gray-800" />
  
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
            Description
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
            {ticket.description}
          </p>
        </div>
      </div>
  
      {/* Meta card */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 transition-colors">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
          Details
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
              <User size={14} className="text-gray-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500">Created by</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{ticket.user.username}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{ticket.user.email}</p>
            </div>
          </div>
  
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
              <Building2 size={14} className="text-gray-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500">Department</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">
                {ticket.user.department ?? "—"}
              </p>
            </div>
          </div>
  
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
              <Calendar size={14} className="text-gray-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500">Created</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">
                {format(new Date(ticket.createdAt), "MMM d, yyyy")}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
  
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
              <Clock size={14} className="text-gray-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500">Last updated</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">
                {format(new Date(ticket.updatedAt), "MMM d, yyyy")}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        </div>
      </div>
  
      <CreateTicketDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSuccess={() => { setDrawerOpen(false); fetchTicket(); }}
        editTicket={ticket}
      />
  
      <ConfirmModal
        open={deleteOpen}
        title="Delete Ticket"
        description={`Are you sure you want to delete "${ticket.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
        destructive
      />
    </div>
  );
}