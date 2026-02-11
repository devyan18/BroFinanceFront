import { Router, Route, Switch } from "wouter";
import { AuthProvider } from "./providers/AuthProvider";
import { SignInPage, SignUpPage, DashboardPage } from "./pages";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Switch>
          <Route path="/">
            <SignInPage />
          </Route>
          <Route path="/register">
            <SignUpPage />
          </Route>
          <Route path="/dashboard">
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          </Route>
        </Switch>
      </Router>
    </AuthProvider>
  );
}
