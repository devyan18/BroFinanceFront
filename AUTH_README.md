# Authentication System

This application uses a token-based authentication system with localStorage persistence.

## Features

- ✅ JWT token storage in localStorage
- ✅ Automatic session verification on app load
- ✅ Protected routes with authentication checks
- ✅ API client with automatic token injection
- ✅ Login, Register, and Google OAuth support (Google OAuth ready for implementation)

## How It Works

### 1. **Token Storage**

Tokens are stored in `localStorage` with the key `auth_token`. The utility functions in `src/utils/api.ts` handle token management:

```typescript
getToken(); // Retrieve token from localStorage
setToken(token); // Store token in localStorage
removeToken(); // Remove token from localStorage
```

### 2. **Authentication Flow**

#### Initial Load

1. App loads → `AuthProvider` checks for existing token
2. If token exists → Calls `/auth/verify` API endpoint
3. If valid → User data is loaded, user stays logged in
4. If invalid → Token is removed, user redirected to login

#### Login/Register

1. User submits credentials
2. API returns `{ token, user }`
3. Token stored in localStorage
4. User data set in context
5. Redirect to `/dashboard`

#### Protected Routes

1. User tries to access protected route (e.g., `/dashboard`)
2. `ProtectedRoute` component checks:
   - Is user already loaded? → Allow access
   - Is token in localStorage but user not loaded? → Call `verifyAuth()`
   - No token? → Redirect to login
3. Shows loading state while verifying

### 3. **API Client**

The `apiClient` in `src/utils/api.ts` automatically:

- Adds `Authorization: Bearer <token>` header to all requests
- Handles JSON serialization
- Provides typed responses
- Centralizes error handling

Usage:

```typescript
// GET request
const data = await apiClient.get<{ user: User }>("/auth/verify");

// POST request
const result = await apiClient.post<{ token: string }>("/auth/login", {
  email: "user@example.com",
  password: "password123",
});
```

## API Endpoints Expected

Your backend should implement these endpoints:

### `POST /auth/login`

**Request:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "username": "johndoe",
    "avatar": null
  }
}
```

### `POST /auth/register`

**Request:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** Same as login

### `GET /auth/verify`

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "user": {
    "id": "123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "username": "johndoe",
    "avatar": null
  }
}
```

## Configuration

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:3000/api
```

If not set, defaults to `http://localhost:3000/api`.

## Google OAuth Implementation

To implement Google OAuth:

1. Set up Google OAuth in your backend
2. Update the `loginWithGoogle()` method in `AuthProvider.tsx`:

```typescript
const loginWithGoogle = async () => {
  // Your Google OAuth flow here
  const googleAuthUrl = `${API_BASE_URL}/auth/google`;
  window.location.href = googleAuthUrl;

  // After redirect back with token:
  // const urlParams = new URLSearchParams(window.location.search);
  // const token = urlParams.get('token');
  // if (token) {
  //   setToken(token);
  //   const data = await apiClient.get<{ user: User }>('/auth/verify');
  //   setUser(data.user);
  // }
};
```

## File Structure

```
src/
├── components/
│   └── ProtectedRoute.tsx    # Route protection component
├── pages/
│   ├── SignInPage.tsx        # Login page
│   ├── SignUpPage.tsx        # Registration page
│   └── DashboardPage.tsx     # Protected dashboard
├── providers/
│   └── AuthProvider.tsx      # Authentication context & logic
└── utils/
    └── api.ts                # API client & token utilities
```

## Usage in Components

```typescript
import { useAuth } from '../providers/AuthProvider';

function MyComponent() {
  const { user, isLoading, login, logout } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {user ? (
        <>
          <p>Welcome, {user.firstName}!</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <button onClick={() => login({ email: '...', password: '...' })}>
          Login
        </button>
      )}
    </div>
  );
}
```
