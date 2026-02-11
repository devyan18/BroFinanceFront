import { useAuth } from "../providers/AuthProvider";
import { Redirect } from "wouter";

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
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
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

  // User object = Authenticated
  // Render protected content if authenticated
  return <>{children}</>;
}
