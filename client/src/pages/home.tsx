import Finances from "@/components/Finances";
import AuthGuard from "@/components/AuthGuard";

export default function Home() {
  return (
    <AuthGuard>
      <Finances />
    </AuthGuard>
  );
}