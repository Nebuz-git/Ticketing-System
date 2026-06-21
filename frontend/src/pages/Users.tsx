import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Search, UserPlus, Building2 } from "lucide-react";
import ConfirmModal from "@/components/ui/ConfirmModal";
import api from "@/lib/axios";

interface UserType {
  id: string;
  username: string;
  email: string;
  role: "employee" | "support" | "admin";
  department: string | null;
  createdAt: string;
}

const roleConfig: Record<string, { label: string; color: string }> = {
  employee: { label: "Employee", color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
  support: { label: "Support", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  admin: { label: "Admin", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" },
};

const roles = ["employee", "support", "admin"];

export default function Users() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [roleTarget, setRoleTarget] = useState<{ user: UserType; newRole: string } | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ username: "", email: "", password: "", department: "" });
  const [creating, setCreating] = useState(false);


  useEffect(() => {
    if (!createOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setCreateOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [createOpen]);

  const fetchUsers = async () => {
    try {
      const res = await api.get(`/api/users`)
      setUsers(res.data);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async () => {
    if (!roleTarget) return;
    try {
      await api.patch(
        `/api/users/${roleTarget.user.id}/role`,
        { role: roleTarget.newRole },
      );
      toast.success(`Role updated to ${roleTarget.newRole}`);
      setRoleTarget(null);
      fetchUsers();
    } catch {
      toast.error("Failed to update role");
    }
  };

  const handleCreateSupport = async () => {
    if (!createForm.username || !createForm.email || !createForm.password) {
      toast.error("Username, email and password are required");
      return;
    }
    setCreating(true);
    try {
      await api.post(`/api/users/support`, createForm)
      toast.success("Support account created");
      setCreateOpen(false);
      setCreateForm({ username: "", email: "", password: "", department: "" });
      fetchUsers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create user");
    } finally {
      setCreating(false);
    }
  };

  const filtered = users.filter((u) => {
    const matchSearch =
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-5">

      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Users</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {users.length} user{users.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <UserPlus size={16} />
          New Support User
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 transition"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="h-9 px-3 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 outline-none focus:border-blue-500 transition cursor-pointer"
        >
          <option value="all">All Roles</option>
          <option value="employee">Employee</option>
          <option value="support">Support</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-visible transition-colors">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">User</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Role</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Department</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Change Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  {[...Array(4)].map((_, j) => (
                    <td key={j} className="px-5 py-4">
                      <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-16 text-center text-sm text-gray-400 dark:text-gray-600">
                  No users found
                </td>
              </tr>
            ) : (
              filtered.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-semibold">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{user.username}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${roleConfig[user.role]?.color}`}>
                      {roleConfig[user.role]?.label}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <Building2 size={13} className="text-gray-400" />
                      {user.department ?? "—"}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <select
                      value={user.role}
                      onChange={(e) => setRoleTarget({ user, newRole: e.target.value })}
                      className="h-8 px-2 text-xs border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 outline-none focus:border-blue-500 transition cursor-pointer"
                    >
                      {roles.map((r) => (
                        <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create support modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          
          <div className="absolute inset-0 bg-black/30 dark:bg-black/50" onClick={() => setCreateOpen(false)} />
          <div className="relative w-[440px] max-w-[90vw] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl p-6 z-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <UserPlus size={16} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">New Support User</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Account will be created with support role</p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {[
                { label: "Username", key: "username", type: "text", placeholder: "johndoe" },
                { label: "Email", key: "email", type: "email", placeholder: "john@company.com" },
                { label: "Password", key: "password", type: "password", placeholder: "Min. 6 characters" },
                { label: "Department", key: "department", type: "text", placeholder: "e.g. IT (optional)" },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">{field.label}</label>
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    value={createForm[field.key as keyof typeof createForm]}
                    onChange={(e) => setCreateForm({ ...createForm, [field.key]: e.target.value })}
                    className="w-full h-10 border border-gray-200 dark:border-gray-700 rounded-lg px-3 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 transition"
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setCreateOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSupport}
                disabled={creating}
                className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-60"
              >
                {creating ? "Creating..." : "Create account"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm role change */}
      <ConfirmModal
        open={!!roleTarget}
        title="Change User Role"
        description={`Change ${roleTarget?.user.username}'s role from ${roleTarget?.user.role} to ${roleTarget?.newRole}?`}
        confirmLabel="Update Role"
        onConfirm={handleRoleChange}
        onCancel={() => setRoleTarget(null)}
      />
    </div>
  );
}