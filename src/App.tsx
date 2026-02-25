import { Router, Route, Switch, Redirect } from "wouter";
import { AuthProvider } from "./providers/AuthProvider";
import { SignInPage, SignUpPage, DashboardPage, ProfilePage, ChartsPage, UserProfilePage, FriendsPage, CompleteProfilePage, ForgotPasswordPage, ResetPasswordPage } from "./pages";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <AuthProvider>
      <Router>
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
      </Router>
    </AuthProvider>
  );
}
