import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Search,
  Shield,
  Ticket,
  Users,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

import api from "@/lib/axios";
interface AuditLog {
  id: string;
  action: string;
  targetId: string;
  details: string | null;
  createdAt: string;
  performedBy: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

const actionConfig: Record<string, { label: string; color: string; icon: any }> = {
  TICKET_CREATED: { label: "Ticket Created", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300", icon: Ticket },
  TICKET_UPDATED: { label: "Ticket Updated", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300", icon: Ticket },
  TICKET_DELETED: { label: "Ticket Deleted", color: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300", icon: Ticket },
  SUPPORT_CREATED: { label: "Support Created", color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300", icon: Users },
  ROLE_UPDATED: { label: "Role Updated", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300", icon: Shield },
};

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;


  const fetchLogs = async (currentPage = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/api/audit-logs`, {
        params: { page: currentPage, limit },
      });
      setLogs(res.data.logs);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch {
      toast.error("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(page);
  }, [page]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filtered = logs.filter((log) => {
    const matchSearch =
      log.performedBy.username.toLowerCase().includes(search.toLowerCase()) ||
      log.performedBy.email.toLowerCase().includes(search.toLowerCase()) ||
      (log.details ?? "").toLowerCase().includes(search.toLowerCase());
    const matchAction = actionFilter === "all" || log.action === actionFilter;
    return matchSearch && matchAction;
  });

  return (
    <div className="space-y-5">

      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Audit Logs</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {total} event{total !== 1 ? "s" : ""} recorded
          </p>
        </div>
        <button
          onClick={() => fetchLogs(page)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by user or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 transition"
          />
        </div>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="h-9 px-3 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 outline-none focus:border-blue-500 transition cursor-pointer"
        >
          <option value="all">All Actions</option>
          <option value="TICKET_CREATED">Ticket Created</option>
          <option value="TICKET_UPDATED">Ticket Updated</option>
          <option value="TICKET_DELETED">Ticket Deleted</option>
          <option value="SUPPORT_CREATED">Support Created</option>
          <option value="ROLE_UPDATED">Role Updated</option>
        </select>
      </div>

      {/* Logs */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden transition-colors">
        {loading ? (
          <div className="p-5 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-14 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Shield size={32} className="text-gray-300 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No audit logs found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {filtered.map((log) => {
              const config = actionConfig[log.action] ?? {
                label: log.action,
                color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
                icon: Shield,
              };
              const Icon = config.icon;

              return (
                <div
                  key={log.id}
                  className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${config.color}`}>
                    <Icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${config.color}`}>
                        {config.label}
                      </span>
                      {log.details && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {log.details}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-[9px] font-semibold">
                          {log.performedBy.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {log.performedBy.username}
                        </span>
                        {" · "}
                        {log.performedBy.role}
                        {" · "}
                        {log.performedBy.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">
                      {format(new Date(log.createdAt), "MMM d, HH:mm")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Page {page} of {totalPages} · {total} total events
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={14} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce((acc: (number | string)[], p, idx, arr) => {
                if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((p, idx) =>
                p === "..." ? (
                  <span key={`ellipsis-${idx}`} className="text-xs text-gray-400 px-1">...</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p as number)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                      page === p
                        ? "bg-blue-600 text-white"
                        : "border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}

            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}