import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { registerUser } from "@/services/auth.service";
import { useAuth } from "@/context/AuthContext";
const schema = z.object({
  username: z.string().min(2, "Min. 2 characters"),
  email: z.string().email(),
  password: z.string().min(6, "Min. 6 characters"),
});

type FormData = z.infer<typeof schema>;

export default function Register() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const navigate = useNavigate();
  const { login } = useAuth();

  const onSubmit = async (data: FormData) => {
    try {
      const res = await registerUser(data);
      login(res.token, res.user);
      toast.success("Account created successfully");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] dark:bg-gray-950 transition-colors">
      <div className="flex w-[900px] max-w-[95vw] min-h-[600px] rounded-2xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">

        {/* Left panel */}
        <div className="w-[42%] bg-[#1E3A5F] p-12 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
                  <path d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/>
                </svg>
              </div>
              <span className="text-white text-lg font-semibold tracking-tight">TicketSys</span>
            </div>

            <div className="mt-12">
              <h1 className="text-white text-2xl font-semibold leading-snug tracking-tight">
                Get started<br />in minutes.
              </h1>
              <p className="text-[#93B5D8] text-sm mt-3 leading-relaxed">
                Create your account and start managing tickets with your team right away.
              </p>
            </div>

            <div className="mt-10 flex flex-col gap-5">
              {[
                { n: "1", label: "Create your account", sub: "Register with your work email" },
                { n: "2", label: "Get assigned a role", sub: "Admin sets your access level" },
                { n: "3", label: "Start working", sub: "Submit and track your tickets" },
              ].map((s) => (
                <div key={s.n} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-900/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[11px] font-semibold text-blue-300">{s.n}</span>
                  </div>
                  <div>
                    <p className="text-[#CBD9E8] text-sm font-medium">{s.label}</p>
                    <p className="text-[#6B90B0] text-xs">{s.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[#4A6F90] text-xs">© 2026 TicketSys</p>
        </div>

        {/* Right panel */}
        <div className="flex-1 bg-white dark:bg-gray-900 p-12 flex flex-col justify-center transition-colors">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight">Create your account</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">All new accounts start as employee</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Username</label>
              <input
                type="text"
                placeholder="johndoe"
                {...register("username")}
                className="w-full h-10 border border-gray-200 dark:border-gray-700 rounded-lg px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 transition bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
              {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Email address</label>
              <input
                type="email"
                placeholder="you@company.com"
                {...register("email")}
                className="w-full h-10 border border-gray-200 dark:border-gray-700 rounded-lg px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 transition bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Password</label>
              <input
                type="password"
                placeholder="Min. 6 characters"
                {...register("password")}
                className="w-full h-10 border border-gray-200 dark:border-gray-700 rounded-lg px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 transition bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900 rounded-lg px-3 py-2.5 flex gap-2 items-start">
              <svg className="flex-shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                Your role will be assigned by an admin after registration. You'll start with employee access.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-60"
            >
              {isSubmitting ? "Creating..." : "Create account"}
            </button>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Already have an account?{" "}
              <a href="/login" className="text-blue-600 font-medium hover:underline">Sign in</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}