import { lazy, Suspense } from "react";
import { Router, Route, Switch, Redirect } from "wouter";
import { AuthProvider } from "./providers/AuthProvider";
import { AppSettingsProvider } from "./providers/AppSettingsProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import Spinner from "./components/ui/Spinner";

// Lazy-loaded pages for code splitting and faster initial load
const SignInPage = lazy(() => import("./pages/SignInPage"));
const SignUpPage = lazy(() => import("./pages/SignUpPage"));
const CompleteProfilePage = lazy(() => import("./pages/CompleteProfilePage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const FriendsPage = lazy(() => import("./pages/FriendsPage"));
const ChartsPage = lazy(() => import("./pages/ChartsPage"));
const UserProfilePage = lazy(() => import("./pages/UserProfilePage"));

function PageFallback() {
  return (
    <div className="min-h-screen bg-[#0B0E11] flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}

export default function App() {
  return (
    <AppSettingsProvider>
      <AuthProvider>
        <Router>
          <Suspense fallback={<PageFallback />}>
            <Switch>
              <Route path="/">
                <SignInPage />
              </Route>
              <Route path="/login">
                <SignInPage />
              </Route>
              <Route path="/register">
                <SignUpPage />
              </Route>
              <Route path="/completar-registro">
                <CompleteProfilePage />
              </Route>
              <Route path="/forgot-password">
                <ForgotPasswordPage />
              </Route>
              <Route path="/reset-password">
                <ResetPasswordPage />
              </Route>
              <Route path="/inicio">
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              </Route>
              <Route path="/dashboard">
                <Redirect to="/inicio" />
              </Route>
              <Route path="/profile">
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              </Route>
              <Route path="/amigos">
                <ProtectedRoute>
                  <FriendsPage />
                </ProtectedRoute>
              </Route>
              <Route path="/charts">
                <ProtectedRoute>
                  <ChartsPage />
                </ProtectedRoute>
              </Route>
              <Route path="/user/:userId">
                <ProtectedRoute>
                  <UserProfilePage />
                </ProtectedRoute>
              </Route>
            </Switch>
          </Suspense>
        </Router>
      </AuthProvider>
    </AppSettingsProvider>
  );
}
