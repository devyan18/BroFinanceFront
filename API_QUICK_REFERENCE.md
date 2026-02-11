# BroFinance API - Quick Reference

## Base URL

```
http://localhost:4000/api/v1
```

## Response Format

### Success Response

```typescript
{
  success: true,
  data: any,
  message?: string
}
```

### Error Response

```typescript
{
  success: false,
  error: string,
  errors?: Array<{ path: string, message: string }>
}
```

## Authentication Endpoints

### 1. Register User

```typescript
POST /auth/local/sign-up

// Request
{
  username: string,  // min 3 chars
  email: string,     // valid email
  password: string   // min 5 chars
}

// Response (201)
{
  success: true,
  data: {
    user: User,
    tokens: {
      accessToken: string,   // expires in 15 min
      refreshToken: string   // expires in 30 days
    }
  },
  message: "User registered successfully"
}
```

### 2. Login

```typescript
POST /auth/local/sign-in

// Request
{
  email: string,
  password: string
}

// Response (200)
{
  success: true,
  data: {
    user: User,
    tokens: {
      accessToken: string,
      refreshToken: string
    }
  },
  message: "Signed in successfully"
}
```

### 3. Get Current User

```typescript
GET /auth/me

// Headers
{
  "Authorization": "Bearer <accessToken>",
  "x-refresh-token": "Bearer <refreshToken>"
}

// Response (200)
{
  success: true,
  data: {
    user: User
  }
}
```

### 4. Logout

```typescript
POST /auth/sign-out

// Headers
{
  "Authorization": "Bearer <accessToken>",
  "x-refresh-token": "Bearer <refreshToken>"
}

// Response (200)
{
  success: true,
  data: null,
  message: "Signed out successfully"
}
```

### 5. Refresh Token

```typescript
POST /auth/refresh

// Headers
{
  "x-refresh-token": "Bearer <refreshToken>"
}

// Response (200)
{
  success: true,
  data: {
    accessToken: string
  },
  message: "Token refreshed successfully"
}
```

## User Type

```typescript
interface User {
  _id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  provider: string[];
  balance: number;
  createdAt: string;
  updatedAt: string;
}
```

## Frontend Usage Examples

### Using the API Service

```typescript
import api from "../services/api.service";

// Register
const response = await api.auth.signUp({
  username: "johndoe",
  email: "john@example.com",
  password: "password123",
});

if (response.success) {
  const { user, tokens } = response.data;
  // Store tokens and redirect
}

// Login
const response = await api.auth.signIn({
  email: "john@example.com",
  password: "password123",
});

// Get current user
const response = await api.auth.getMe();
if (response.success) {
  const user = response.data.user;
}

// Logout
await api.auth.signOut();
```

### Using the Auth Context

```typescript
import { useAuth } from "../providers/AuthProvider";

function MyComponent() {
  const { user, login, register, logout, isLoading } = useAuth();

  // Register
  const handleRegister = async () => {
    try {
      await register({
        username: "johndoe",
        email: "john@example.com",
        password: "password123"
      });
      // Success - user is now logged in
    } catch (error) {
      // Handle error
    }
  };

  // Login
  const handleLogin = async () => {
    try {
      await login({
        email: "john@example.com",
        password: "password123"
      });
      // Success - user is now logged in
    } catch (error) {
      // Handle error
    }
  };

  // Logout
  const handleLogout = async () => {
    await logout();
    // User is now logged out
  };

  return (
    <div>
      {isLoading && <p>Loading...</p>}
      {user && <p>Welcome, {user.username}!</p>}
    </div>
  );
}
```

## HTTP Status Codes

| Code | Meaning                               |
| ---- | ------------------------------------- |
| 200  | Success                               |
| 201  | Created                               |
| 400  | Bad Request (validation error)        |
| 401  | Unauthorized (invalid/expired token)  |
| 404  | Not Found                             |
| 409  | Conflict (e.g., email already exists) |
| 429  | Too Many Requests (rate limit)        |
| 500  | Internal Server Error                 |

## Rate Limiting

- **Limit**: 500 requests per IP
- **Window**: 15 minutes
- **Response**: 429 status code

## Token Management

### Storage (localStorage)

```typescript
localStorage.setItem("accessToken", tokens.accessToken);
localStorage.setItem("refreshToken", tokens.refreshToken);
localStorage.setItem("user", JSON.stringify(user));
```

### Retrieval

```typescript
const accessToken = localStorage.getItem("accessToken");
const refreshToken = localStorage.getItem("refreshToken");
const user = JSON.parse(localStorage.getItem("user") || "null");
```

### Cleanup

```typescript
localStorage.removeItem("accessToken");
localStorage.removeItem("refreshToken");
localStorage.removeItem("user");
```

## Error Handling

### Validation Errors

```typescript
{
  success: false,
  error: "Validation failed",
  errors: [
    { path: "email", message: "Invalid email format" },
    { path: "password", message: "Password too short" }
  ]
}
```

### Authentication Errors

```typescript
{
  success: false,
  error: "Invalid credentials"
}
```

### Handle in Frontend

```typescript
try {
  const response = await api.auth.signIn(credentials);
  if (response.success) {
    // Success
  } else {
    // Show error message
    console.error(response.error);
    if (response.errors) {
      response.errors.forEach((err) => {
        console.error(`${err.path}: ${err.message}`);
      });
    }
  }
} catch (error) {
  console.error("Network error:", error);
}
```

## Environment Variables

### Frontend (.env)

```bash
VITE_API_URL=http://localhost:4000/api/v1
```

### Usage in Code

```typescript
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1";
```

## Common Patterns

### Protected API Call

```typescript
const makeProtectedCall = async () => {
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");

  const response = await fetch(`${API_BASE_URL}/some-endpoint`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "x-refresh-token": `Bearer ${refreshToken}`,
      "Content-Type": "application/json",
    },
  });

  // Check for new access token
  const newToken = response.headers.get("x-new-access-token");
  if (newToken) {
    localStorage.setItem("accessToken", newToken);
  }

  return response.json();
};
```

### Handle 401 Errors

```typescript
if (response.status === 401) {
  // Clear tokens and redirect to login
  localStorage.clear();
  window.location.href = "/";
}
```

## Tips

1. **Always send both tokens** in authenticated requests
2. **Check for token refresh** in response headers
3. **Handle 401 errors** by clearing tokens and redirecting
4. **Validate input** on frontend before sending to API
5. **Use TypeScript types** for better development experience
6. **Handle loading states** for better UX
7. **Show meaningful error messages** to users
