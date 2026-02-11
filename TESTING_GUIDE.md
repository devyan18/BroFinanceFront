# Testing Guide - BroFinance Authentication

This guide will help you test the authentication implementation step by step.

## Prerequisites

1. **Backend Server Running**
   - The BroFinance backend must be running on `http://localhost:4000`
   - MongoDB must be connected
   - All environment variables must be configured

2. **Frontend Server Running**
   - Run `npm run dev` in the frontend directory
   - Should be accessible at `http://localhost:5173`

## Test Scenarios

### 1. User Registration Flow

**Steps:**

1. Open browser to `http://localhost:5173`
2. Click "Sign up" link at the bottom
3. Fill in the registration form:
   - Username: `testuser` (min 3 chars)
   - Email: `test@example.com`
   - Password: `test123` (min 5 chars)
   - Confirm Password: `test123`
4. Click "Create Account"

**Expected Results:**

- ✅ Loading spinner appears
- ✅ Redirect to `/dashboard`
- ✅ Dashboard shows welcome message with username
- ✅ User info displayed in navigation bar
- ✅ Tokens stored in localStorage

**Verify in Browser DevTools:**

```javascript
// Open Console (F12)
localStorage.getItem("accessToken"); // Should show JWT token
localStorage.getItem("refreshToken"); // Should show JWT token
localStorage.getItem("user"); // Should show user JSON
```

---

### 2. User Login Flow

**Steps:**

1. If logged in, logout first
2. Navigate to `http://localhost:5173`
3. Fill in the login form:
   - Email: `test@example.com`
   - Password: `test123`
4. Click "Sign In"

**Expected Results:**

- ✅ Loading spinner appears
- ✅ Redirect to `/dashboard`
- ✅ Dashboard shows welcome message
- ✅ User info displayed correctly

---

### 3. Session Persistence

**Steps:**

1. Login successfully
2. Refresh the page (F5 or Cmd+R)

**Expected Results:**

- ✅ Brief loading state shown
- ✅ User remains logged in
- ✅ Dashboard content displayed
- ✅ No redirect to login page

---

### 4. Protected Route Access

**Steps:**

1. Logout if logged in
2. Manually navigate to `http://localhost:5173/dashboard`

**Expected Results:**

- ✅ Brief loading state shown
- ✅ Automatic redirect to `/` (login page)
- ✅ Cannot access dashboard without authentication

---

### 5. Logout Flow

**Steps:**

1. Login successfully
2. Click "Logout" button in navigation

**Expected Results:**

- ✅ Redirect to `/` (login page)
- ✅ Tokens cleared from localStorage
- ✅ Cannot access dashboard anymore

**Verify in Browser DevTools:**

```javascript
localStorage.getItem("accessToken"); // Should be null
localStorage.getItem("refreshToken"); // Should be null
localStorage.getItem("user"); // Should be null
```

---

### 6. Auto-Redirect for Authenticated Users

**Steps:**

1. Login successfully
2. Manually navigate to `http://localhost:5173/` (login page)
3. Or navigate to `http://localhost:5173/register`

**Expected Results:**

- ✅ Automatic redirect to `/dashboard`
- ✅ Cannot access login/register pages while authenticated

---

### 7. Form Validation

#### Registration Validation

**Test Cases:**

1. **Short Username**
   - Username: `ab` (less than 3 chars)
   - Expected: Error message "Username must be at least 3 characters"

2. **Short Password**
   - Password: `1234` (less than 5 chars)
   - Expected: Error message "Password must be at least 5 characters"

3. **Password Mismatch**
   - Password: `password123`
   - Confirm: `password456`
   - Expected: Error message "Passwords do not match"

4. **Invalid Email**
   - Email: `notanemail`
   - Expected: Browser validation error

#### Login Validation

1. **Invalid Credentials**
   - Email: `wrong@example.com`
   - Password: `wrongpass`
   - Expected: Error message "Invalid email or password"

---

### 8. Error Handling

#### Network Error

**Steps:**

1. Stop the backend server
2. Try to login or register

**Expected Results:**

- ✅ Error message displayed
- ✅ No crash or blank screen
- ✅ User can retry

#### Duplicate Email

**Steps:**

1. Register with email `test@example.com`
2. Logout
3. Try to register again with same email

**Expected Results:**

- ✅ Error message about duplicate email
- ✅ Form remains filled
- ✅ User can correct and retry

---

### 9. Token Refresh (Automatic)

**Note:** This is automatic and happens in the background.

**Steps:**

1. Login successfully
2. Wait for access token to expire (15 minutes)
3. Make any authenticated request (e.g., refresh dashboard)

**Expected Results:**

- ✅ Request succeeds
- ✅ New access token received in response header
- ✅ New token stored in localStorage
- ✅ User remains logged in

**Verify in Browser DevTools:**

```javascript
// Before refresh
const oldToken = localStorage.getItem("accessToken");

// After automatic refresh (wait 15+ min or manually expire token)
const newToken = localStorage.getItem("accessToken");

console.log(oldToken !== newToken); // Should be true
```

---

### 10. Multiple Tabs/Windows

**Steps:**

1. Login in Tab 1
2. Open Tab 2 with same URL
3. Logout in Tab 1
4. Try to use Tab 2

**Expected Results:**

- ✅ Tab 2 should detect logout on next request
- ✅ Tab 2 should redirect to login

**Note:** Current implementation uses localStorage, which is shared across tabs but doesn't sync in real-time. Consider using `storage` event listener for real-time sync.

---

## Testing Checklist

### Registration

- [ ] Can register with valid credentials
- [ ] Cannot register with short username (< 3 chars)
- [ ] Cannot register with short password (< 5 chars)
- [ ] Cannot register with mismatched passwords
- [ ] Cannot register with duplicate email
- [ ] Redirects to dashboard after registration
- [ ] Tokens stored correctly

### Login

- [ ] Can login with valid credentials
- [ ] Cannot login with invalid credentials
- [ ] Redirects to dashboard after login
- [ ] Tokens stored correctly

### Session

- [ ] Session persists after page refresh
- [ ] Session cleared after logout
- [ ] Cannot access protected routes when logged out
- [ ] Auto-redirects to dashboard when logged in

### UI/UX

- [ ] Loading states shown during async operations
- [ ] Error messages displayed clearly
- [ ] Forms are user-friendly
- [ ] Navigation works correctly
- [ ] Responsive design works on mobile

### Security

- [ ] Tokens stored securely (localStorage for dev)
- [ ] Tokens cleared on logout
- [ ] 401 errors handled correctly
- [ ] No sensitive data in console logs (production)

---

## Debugging Tips

### Check Network Requests

1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "Fetch/XHR"
4. Look for requests to `/api/v1/auth/*`
5. Check request/response headers and body

### Check Console Logs

1. Open DevTools Console
2. Look for error messages
3. Check for failed API calls
4. Verify token storage operations

### Check localStorage

```javascript
// View all stored data
console.log("Access Token:", localStorage.getItem("accessToken"));
console.log("Refresh Token:", localStorage.getItem("refreshToken"));
console.log("User:", JSON.parse(localStorage.getItem("user")));

// Clear all data
localStorage.clear();
```

### Common Issues

#### "Network Error" or "Failed to fetch"

- **Cause**: Backend not running or wrong URL
- **Fix**: Check backend is running on port 4000
- **Fix**: Verify `.env` has correct `VITE_API_URL`

#### "401 Unauthorized"

- **Cause**: Invalid or expired tokens
- **Fix**: Clear localStorage and login again
- **Fix**: Check token format in headers

#### Infinite redirect loop

- **Cause**: Auth state not updating correctly
- **Fix**: Check `AuthProvider` logic
- **Fix**: Clear localStorage and refresh

#### Page stays in loading state

- **Cause**: API call hanging or failing silently
- **Fix**: Check Network tab for failed requests
- **Fix**: Check backend logs

---

## Performance Testing

### Load Time

- Initial page load should be < 2 seconds
- Auth verification should be < 500ms
- Login/register should be < 1 second

### Memory Leaks

1. Open DevTools > Performance
2. Record while navigating between pages
3. Check for memory growth
4. Verify cleanup on unmount

---

## Automated Testing (Future)

Consider adding:

- Unit tests for API client
- Unit tests for AuthProvider
- Integration tests for auth flows
- E2E tests with Playwright/Cypress

Example test structure:

```typescript
describe("Authentication", () => {
  it("should register a new user", async () => {
    // Test implementation
  });

  it("should login existing user", async () => {
    // Test implementation
  });

  it("should logout user", async () => {
    // Test implementation
  });
});
```

---

## Test Data

Use these test accounts for consistent testing:

```javascript
const testUsers = [
  {
    username: "testuser1",
    email: "test1@example.com",
    password: "test123",
  },
  {
    username: "testuser2",
    email: "test2@example.com",
    password: "test456",
  },
];
```

---

## Reporting Issues

When reporting issues, include:

1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Browser console logs
5. Network tab screenshots
6. Browser and version
7. Operating system

---

## Success Criteria

All tests should pass before considering the implementation complete:

- ✅ All registration flows work
- ✅ All login flows work
- ✅ Session persistence works
- ✅ Protected routes work
- ✅ Logout works
- ✅ Error handling works
- ✅ UI/UX is smooth
- ✅ No console errors
- ✅ Build passes without errors
