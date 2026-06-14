import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerUser } from "@/services/auth.service";
import { useNavigate } from "react-router-dom";

import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type FormData = z.infer<typeof schema>;

export default function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const navigate = useNavigate();
  
  const onSubmit = async (data: FormData) => {
    try {
      await registerUser(data);
      toast.success("Account created successfully");
      navigate("/home");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Registration failed"
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-[380px]">
        <CardHeader>
          <CardTitle>Create Account</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            <div>
              <Input placeholder="Email" {...register("email")} />
              {errors.email && (
                <p className="text-sm text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Input
                type="password"
                placeholder="Password"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Register"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}