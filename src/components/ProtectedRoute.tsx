import { useAuth } from "../providers/AuthProvider";
import { Redirect } from "wouter";
import { IoWalletOutline } from "react-icons/io5";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user } = useAuth();

  // undefined = Still verifying (initial state)
  // Show loading state while verifying authentication
  if (user === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-2xl mb-4 shadow-lg shadow-emerald-500/20 animate-pulse">
            <IoWalletOutline className="w-8 h-8 text-white" />
          </div>
          <p className="text-slate-400 text-lg">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // null = Token verified but invalid (not authenticated)
  // Redirect to login if not authenticated
  if (user === null) {
    return <Redirect to="/" />;
  }

  // Google user that still needs to set up their password
  if (user.needsPasswordSetup) {
    return <Redirect to="/completar-registro" />;
  }

  // User object = Authenticated
  return <>{children}</>;
}
