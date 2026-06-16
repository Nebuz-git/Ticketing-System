import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

import { useAuth } from "../../context/AuthContext";


const API_URL = import.meta.env.VITE_API_URL;

const schema = z.object({
  title: z.string().min(3, "Min. 3 characters"),
  description: z.string().min(10, "Min. 10 characters"),
  priority: z.enum(["low", "medium", "high"]),
  status: z.enum(["open", "in_progress", "resolved", "closed"]).optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editTicket?: any | null;
}

function DrawerForm({ onClose, onSuccess, editTicket }: Omit<Props, "open">) {
  const isEdit = !!editTicket;
  const token = localStorage.getItem("token");

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { priority: "medium" },
  });


  console.log("Current status:", watch("status"));
    const { user } = useAuth();

  useEffect(() => {
    if (editTicket) {      
      const fetchFull = async () => {
        try {
          const res = await axios.get(`${API_URL}/api/tickets/${editTicket.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          reset({
            title: res.data.title,
            description: res.data.description,
            priority: res.data.priority,
            status: res.data.status,
          });
        } catch {
          toast.error("Failed to load ticket data");
        }
      };
      fetchFull();
    }
  }, []);

  const onSubmit = async (data: FormData) => {
    console.log("Submitting:", data);
    try {
      if (isEdit) {
        await axios.patch(`${API_URL}/api/tickets/${editTicket.id}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Ticket updated");
      } else {
        await axios.post(`${API_URL}/api/tickets`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Ticket created");
      }
      onSuccess();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-y-auto">
      <div className="flex flex-col gap-5 px-6 py-5 flex-1">

        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Title</label>
          <input
            type="text"
            placeholder="Brief description of the issue"
            {...register("title")}
            className="w-full h-10 border border-gray-200 dark:border-gray-700 rounded-lg px-3 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 transition"
          />
          {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Description</label>
          <textarea
            placeholder="Describe the issue in detail..."
            rows={5}
            {...register("description")}
            className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 transition resize-none"
          />
          {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Priority</label>
          <select
            {...register("priority")}
            className="w-full h-10 border border-gray-200 dark:border-gray-700 rounded-lg px-3 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:border-blue-500 transition cursor-pointer"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        {isEdit && (user?.role === "support" || user?.role === "admin") && (
            <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Status</label>
                <select
                {...register("status")}
                className="w-full h-10 border border-gray-200 dark:border-gray-700 rounded-lg px-3 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:border-blue-500 transition cursor-pointer"
                >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
                </select>
            </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-800">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : isEdit ? "Save changes" : "Create ticket"}
        </button>
      </div>
    </form>
  );
}

export default function CreateTicketDrawer({ open, onClose, onSuccess, editTicket }: Props) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/30 dark:bg-black/50 z-30 transition-opacity"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-[420px] max-w-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 z-40 shadow-xl flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            {editTicket ? "Edit Ticket" : "New Ticket"}
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {open && (
          <DrawerForm
            onClose={onClose}
            onSuccess={onSuccess}
            editTicket={editTicket}
          />
        )}
      </div>
    </>
  );
}