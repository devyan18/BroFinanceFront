# Authentication Implementation

This document describes the authentication implementation for the BroFinance frontend application.

## Overview

The authentication system is built using the BroFinance API and implements:

- Local authentication (email/password)
- Token-based authentication (access + refresh tokens)
- Automatic token refresh
- Protected routes
- Persistent sessions

## Architecture

### Components

1. **AuthProvider** (`src/providers/AuthProvider.tsx`)
   - Manages authentication state
   - Provides auth context to the entire app
   - Handles login, register, logout, and token verification

2. **ProtectedRoute** (`src/components/ProtectedRoute.tsx`)
   - Wrapper component for protected pages
   - Shows loading state during auth verification
   - Redirects to login if not authenticated

3. **API Client** (`src/utils/api.ts`)
   - Handles all HTTP requests
   - Automatically includes auth tokens in headers
   - Handles token refresh from response headers
   - Manages token storage

4. **API Service** (`src/services/api.service.ts`)
   - Typed API endpoints
   - Organized by feature (auth, health, etc.)

### Pages

- **SignInPage** (`src/pages/SignInPage.tsx`) - Login page
- **SignUpPage** (`src/pages/SignUpPage.tsx`) - Registration page
- **DashboardPage** (`src/pages/DashboardPage.tsx`) - Protected dashboard

## API Endpoints

All endpoints are documented in `AUTH_README.md`. Key endpoints:

- `POST /auth/local/sign-up` - Register new user
- `POST /auth/local/sign-in` - Login
- `GET /auth/me` - Get current user
- `POST /auth/sign-out` - Logout
- `POST /auth/refresh` - Refresh access token

## Token Management

### Storage

Tokens are stored in `localStorage`:

- `accessToken` - Short-lived token (15 min)
- `refreshToken` - Long-lived token (30 days)
- `user` - User data (JSON)

### Automatic Refresh

The API client automatically:

1. Sends both tokens with each request
2. Checks for `x-new-access-token` header in responses
3. Updates the access token if a new one is provided

### Security Notes

⚠️ **Development Only**: Current implementation uses localStorage for simplicity.

**Production Recommendations**:

- Use httpOnly cookies for tokens
- Implement CSRF protection
- Use HTTPS only
- Consider using a state management library (Redux, Zustand)

## User Flow

### Registration Flow

1. User fills registration form (username, email, password)
2. Form validates input (min 3 chars username, min 5 chars password)
3. API call to `/auth/local/sign-up`
4. Tokens and user data stored
5. Redirect to dashboard

### Login Flow

1. User fills login form (email, password)
2. API call to `/auth/local/sign-in`
3. Tokens and user data stored
4. Redirect to dashboard

### Session Verification

1. On app load, `AuthProvider` checks for tokens
2. If tokens exist, calls `/auth/me` to verify
3. If valid, user is authenticated
4. If invalid, tokens are cleared

### Logout Flow

1. User clicks logout
2. API call to `/auth/sign-out`
3. Tokens and user data cleared from localStorage
4. Redirect to login page

## Protected Routes

Use the `ProtectedRoute` component to protect pages:

```tsx
<Route path="/dashboard">
  <ProtectedRoute>
    <DashboardPage />
  </ProtectedRoute>
</Route>
```

The component handles three states:

- `undefined` - Verifying authentication (shows loading)
- `null` - Not authenticated (redirects to login)
- `User` - Authenticated (shows protected content)

## Usage Examples

### Using the Auth Context

```tsx
import { useAuth } from "../providers/AuthProvider";

function MyComponent() {
  const { user, login, logout, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!user) return <div>Not logged in</div>;

  return <div>Welcome, {user.username}!</div>;
}
```

### Using the API Service

```tsx
import api from "../services/api.service";

// Register
const response = await api.auth.signUp({
  username: "johndoe",
  email: "john@example.com",
  password: "password123",
});

if (response.success) {
  console.log("User registered:", response.data);
}
```

## Error Handling

All API calls return a standardized response:

```typescript
{
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Array<{ path: string; message: string }>;
}
```

Handle errors appropriately:

```tsx
try {
  await login({ email, password });
} catch (err) {
  setError("Invalid email or password");
}
```

## Environment Variables

Create a `.env` file (copy from `.env.example`):

```bash
VITE_API_URL=http://localhost:4000/api/v1
```

## Type Safety

All types are defined in `src/types/auth.ts`:

- `User` - User object from API
- `AuthTokens` - Access and refresh tokens
- `AuthResponse` - Login/register response
- `LoginCredentials` - Login form data
- `RegisterCredentials` - Registration form data
- `ApiResponse<T>` - Generic API response wrapper

## Testing

To test the authentication flow:

1. Start the backend server (port 4000)
2. Start the frontend dev server
3. Navigate to `http://localhost:5173`
4. Register a new account
5. Verify redirect to dashboard
6. Refresh the page (should stay logged in)
7. Logout and verify redirect to login

## Future Enhancements

- [ ] Google OAuth integration
- [ ] Password reset functionality
- [ ] Email verification
- [ ] Remember me functionality
- [ ] Session timeout warnings
- [ ] Multi-factor authentication
- [ ] Account settings page

## Troubleshooting

### "401 Unauthorized" errors

- Check if backend is running on port 4000
- Verify API URL in `.env`
- Check browser console for token issues
- Clear localStorage and try again

### Infinite redirect loops

- Check `ProtectedRoute` logic
- Verify `/auth/me` endpoint is working
- Check for circular dependencies in routing

### Tokens not persisting

- Check localStorage in browser DevTools
- Verify token storage functions are called
- Check for localStorage quota issues
