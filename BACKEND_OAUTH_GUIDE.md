# Backend Implementation Guide for Google OAuth

This guide explains how to implement the backend endpoint required by the frontend's Google OAuth implementation.

The frontend uses the **Authorization Code Flow** with `@react-oauth/google` in popup mode. This means the frontend receives an `authorization_code` from Google and sends it to the backend. The backend must validation this code and exchange it for tokens.

## Required Endpoint

**URL:** `POST /api/v1/auth/google/callback`

**Request Body:**

```json
{
  "code": "4/0AeanS0..."
}
```

## Implementation with Node.js & google-auth-library

You need the `google-auth-library` package:

```bash
npm install google-auth-library
```

### Example Controller Logic

```javascript
const { OAuth2Client } = require("google-auth-library");

// Configure client with same credentials as frontend
const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "postmessage", // IMPORTANT: Must be 'postmessage' for popup flow
);

exports.googleCallback = async (req, res) => {
  try {
    const { code } = req.body;

    // 1. Exchange code for tokens
    const { tokens } = await client.getToken(code);

    // 2. Verify the ID token to get user info
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    // payload contains: email, name, picture, sub (google id), etc.

    const { email, name, picture, sub: googleId } = payload;

    // 3. Find or Create User in your database
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        username: name,
        email,
        password: generateRandomPassword(), // or handle passwordless
        avatarUrl: picture,
        provider: ["google"],
        googleId,
      });
    } else {
      // Prepare user if they previously signed up with email/password
      if (!user.provider.includes("google")) {
        user.provider.push("google");
        user.googleId = googleId;
        await user.save();
      }
    }

    // 4. Generate your own JWT tokens (Access & Refresh)
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // 5. Send response
    res.json({
      success: true,
      data: {
        user,
        tokens: {
          accessToken,
          refreshToken,
        },
      },
      message: "Signed in successfully",
    });
  } catch (error) {
    console.error("Google OAuth Error:", error);
    res.status(400).json({
      success: false,
      error: "Google authentication failed",
    });
  }
};
```

## Common Pitfalls (Why you get 400 Bad Request)

### 1. Incorrect Redirect URI

When exchanging the code, the `redirect_uri` MUST match what was used by the frontend to get the code.

- If frontend uses **popup** (default), backend MUST use `postmessage`.
- If frontend uses **redirect** (ux_mode: 'redirect'), backend MUST use the actual callback URL (e.g., `http://localhost:5173`).

**The Fix:** Ensure your `OAuth2Client` is initialized with `'postmessage'` as the redirect URI if using the popup method.

```javascript
const client = new OAuth2Client(
  CLIENT_ID,
  CLIENT_SECRET,
  "postmessage", // <--- CRITICAL
);
```

### 2. Code Re-use

The authorization code is single-use. If you try to exchange it twice (e.g., due to React Strict Mode double-invoking effects in dev), it will fail with `invalid_grant`.

### 3. Missing Client Secret

Ensure `GOOGLE_CLIENT_SECRET` is correctly set in your backend `.env`.

### 4. Clock Skew

Ensure your server time is correct. Google tokens are time-sensitive.
