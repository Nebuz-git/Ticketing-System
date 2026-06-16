import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { loginUser } from "@/services/auth.service";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type FormData = z.infer<typeof schema>;

export default function Login() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data: FormData) => {
    try {
      const res = await loginUser(data);
      login(res.token, res.user);
      toast.success("Signed in successfully");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] dark:bg-gray-950 transition-colors">
      <div className="flex w-[900px] max-w-[95vw] min-h-[580px] rounded-2xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">

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
                Track issues.<br />Resolve faster.
              </h1>
              <p className="text-[#93B5D8] text-sm mt-3 leading-relaxed">
                A unified workspace for your support team to manage, prioritize, and close tickets.
              </p>
            </div>

            <div className="mt-10 flex flex-col gap-4">
              {[
                { label: "Real-time dashboard", sub: "Live stats across all ticket states" },
                { label: "Role-based access", sub: "Employee, support, and admin tiers" },
                { label: "Full audit trail", sub: "Every action logged and traceable" },
              ].map((f) => (
                <div key={f.label} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-md bg-blue-900/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  </div>
                  <div>
                    <p className="text-[#CBD9E8] text-sm font-medium">{f.label}</p>
                    <p className="text-[#6B90B0] text-xs">{f.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[#4A6F90] text-xs">© 2026 TicketSys</p>
        </div>

        {/* Right panel */}
        <div className="flex-1 bg-white dark:bg-gray-900 p-12 flex flex-col justify-center transition-colors">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight">Welcome back</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-4">
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
                placeholder="••••••••"
                {...register("password")}
                className="w-full h-10 border border-gray-200 dark:border-gray-700 rounded-lg px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 transition bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <div className="text-right -mt-1">
              <a href="#" className="text-xs text-blue-600 hover:underline">Forgot password?</a>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-60"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Don't have an account?{" "}
              <a href="/register" className="text-blue-600 font-medium hover:underline">Create one</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}