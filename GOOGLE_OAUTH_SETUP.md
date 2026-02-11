# Google OAuth Configuration Guide

This guide will help you set up Google OAuth for the BroFinance application.

## Prerequisites

- Google Cloud Console account
- BroFinance backend server configured for Google OAuth
- Frontend application running

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter project name: `BroFinance` (or your preferred name)
5. Click "Create"

## Step 2: Enable Google+ API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click on it and click "Enable"

## Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Select "External" (or "Internal" if using Google Workspace)
3. Click "Create"

### Fill in the required information:

**App information:**

- App name: `Bro Finances`
- User support email: Your email
- App logo: (Optional) Upload your logo

**App domain:**

- Application home page: `http://localhost:5173` (for development)
- Application privacy policy link: (Optional for testing)
- Application terms of service link: (Optional for testing)

**Authorized domains:**

- Add: `localhost` (for development)
- For production, add your actual domain

**Developer contact information:**

- Email addresses: Your email

4. Click "Save and Continue"

### Scopes:

1. Click "Add or Remove Scopes"
2. Add these scopes:
   - `userinfo.email`
   - `userinfo.profile`
   - `openid`
3. Click "Update" and then "Save and Continue"

### Test users (for External apps in testing):

1. Click "Add Users"
2. Add your email address and any other test users
3. Click "Save and Continue"

4. Review and click "Back to Dashboard"

## Step 4: Create OAuth Client ID

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application"

### Configure the OAuth client:

**Name:** `BroFinance Web Client`

**Authorized JavaScript origins:**

- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (if using different port)
- Add your production URL when deploying

**Authorized redirect URIs:**

- `http://localhost:5173`
- `http://localhost:4000/api/v1/auth/google/callback` (backend callback)
- Add production URLs when deploying

4. Click "Create"

## Step 5: Save Your Credentials

After creating, you'll see a modal with:

- **Client ID**: Something like `123456789-abcdefg.apps.googleusercontent.com`
- **Client Secret**: Something like `GOCSPX-abc123def456`

**Important:** Copy both values immediately!

## Step 6: Configure Frontend Environment

1. Open your `.env` file in the frontend directory
2. Add your Google Client ID:

```bash
# API Configuration
VITE_API_URL=http://localhost:4000/api/v1

# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE.apps.googleusercontent.com
```

3. Replace `YOUR_CLIENT_ID_HERE` with your actual Client ID

## Step 7: Configure Backend Environment

In your backend `.env` file, add:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE
GOOGLE_CALLBACK_URL=http://localhost:4000/api/v1/auth/google/callback
```

## Step 8: Restart Servers

1. **Stop both frontend and backend servers** (Ctrl+C)

2. **Restart backend:**

   ```bash
   cd ../back
   npm run dev
   ```

3. **Restart frontend:**
   ```bash
   cd ../front
   pnpm dev
   ```

## Step 9: Test Google OAuth

1. Open your browser to `http://localhost:5173`
2. Click "Continue with Google" button
3. You should see the Google sign-in popup
4. Select your Google account
5. Grant permissions
6. You should be redirected back and logged in

## Troubleshooting

### Error: "redirect_uri_mismatch"

**Cause:** The redirect URI doesn't match what's configured in Google Cloud Console.

**Solution:**

1. Go to Google Cloud Console > Credentials
2. Edit your OAuth client
3. Make sure `http://localhost:5173` is in "Authorized JavaScript origins"
4. Make sure `http://localhost:4000/api/v1/auth/google/callback` is in "Authorized redirect URIs"
5. Save and try again

### Error: "Access blocked: This app's request is invalid"

**Cause:** OAuth consent screen not properly configured.

**Solution:**

1. Go to "OAuth consent screen"
2. Make sure all required fields are filled
3. Add your email as a test user (for External apps)
4. Save and try again

### Error: "idpiframe_initialization_failed"

**Cause:** Cookies are blocked or third-party cookies are disabled.

**Solution:**

1. Enable cookies in your browser
2. Allow third-party cookies for `accounts.google.com`
3. Try in incognito mode
4. Clear browser cache and cookies

### Error: "popup_closed_by_user"

**Cause:** User closed the popup before completing authentication.

**Solution:**

- This is expected behavior, just try again
- Make sure popup blockers are disabled

### Google button doesn't appear

**Cause:** Missing or invalid Google Client ID.

**Solution:**

1. Check `.env` file has `VITE_GOOGLE_CLIENT_ID`
2. Restart the dev server after adding the variable
3. Check browser console for errors
4. Verify the Client ID is correct (should end with `.apps.googleusercontent.com`)

### Backend errors

**Cause:** Backend not configured for Google OAuth.

**Solution:**

1. Make sure backend has Google OAuth endpoints implemented
2. Check backend `.env` has `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
3. Verify backend is running on port 4000
4. Check backend logs for errors

## Production Deployment

When deploying to production:

1. **Update Google Cloud Console:**
   - Add production domain to "Authorized domains"
   - Add production URLs to "Authorized JavaScript origins"
   - Add production callback URL to "Authorized redirect URIs"

2. **Update Frontend `.env`:**

   ```bash
   VITE_API_URL=https://api.yourdomain.com/api/v1
   VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
   ```

3. **Update Backend `.env`:**

   ```bash
   GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET
   GOOGLE_CALLBACK_URL=https://api.yourdomain.com/api/v1/auth/google/callback
   ```

4. **Publish OAuth Consent Screen:**
   - Go to "OAuth consent screen"
   - Click "Publish App"
   - Follow the verification process (may take a few days)

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use environment variables** for all sensitive data
3. **Rotate secrets regularly** in production
4. **Use HTTPS** in production (required by Google)
5. **Implement CSRF protection** on backend
6. **Validate tokens** on backend before creating sessions
7. **Set appropriate scopes** - only request what you need
8. **Monitor OAuth usage** in Google Cloud Console

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Sign-In for Websites](https://developers.google.com/identity/sign-in/web)
- [@react-oauth/google Documentation](https://www.npmjs.com/package/@react-oauth/google)
- [Google Cloud Console](https://console.cloud.google.com/)

## Support

If you encounter issues:

1. Check the browser console for errors
2. Check the backend logs
3. Verify all environment variables are set correctly
4. Ensure all URLs match exactly (including http/https)
5. Try in incognito mode to rule out cache issues
