import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">
        Welcome {user?.email}
      </h1>

      <Button onClick={logout}>
        Sign out
      </Button>
    </div>
  );
}