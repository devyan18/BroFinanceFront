# Bro Finances - Frontend

Modern financial management application built with React, TypeScript, and Vite.

## Features

- ✅ **Email/Password Authentication** - Secure local authentication
- ✅ **Google OAuth** - Sign in with Google
- ✅ **Protected Routes** - Automatic authentication verification
- ✅ **Token Management** - Access and refresh token handling
- ✅ **Session Persistence** - Stay logged in across page refreshes
- ✅ **Modern UI** - Beautiful, responsive design with Tailwind CSS
- ✅ **Type Safety** - Full TypeScript support

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Wouter** - Lightweight routing
- **@react-oauth/google** - Google OAuth integration
- **Tailwind CSS** - Styling

## Prerequisites

- Node.js 20.19+ or 22.12+
- pnpm (recommended) or npm
- BroFinance backend server running

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and add your configuration:

```bash
# API Configuration
VITE_API_URL=http://localhost:4000/api/v1

# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### 3. Start Development Server

```bash
pnpm dev
```

The app will be available at `http://localhost:5173`

## Google OAuth Setup

To enable Google Sign-In:

1. Follow the detailed guide in [`GOOGLE_OAUTH_SETUP.md`](./GOOGLE_OAUTH_SETUP.md)
2. Get your Google Client ID from [Google Cloud Console](https://console.cloud.google.com/)
3. Add the Client ID to your `.env` file
4. Restart the dev server

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── GoogleLoginButton.tsx
│   └── ProtectedRoute.tsx
├── pages/              # Page components
│   ├── SignInPage.tsx
│   ├── SignUpPage.tsx
│   └── DashboardPage.tsx
├── providers/          # Context providers
│   └── AuthProvider.tsx
├── services/           # API services
│   └── api.service.ts
├── types/              # TypeScript types
│   └── auth.ts
├── utils/              # Utility functions
│   └── api.ts
├── App.tsx             # Main app component
└── main.tsx            # Entry point
```

## Available Scripts

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Type check
pnpm exec tsc --noEmit

# Lint
pnpm lint
```

## Documentation

- [`AUTHENTICATION.md`](./AUTHENTICATION.md) - Authentication system overview
- [`GOOGLE_OAUTH_SETUP.md`](./GOOGLE_OAUTH_SETUP.md) - Google OAuth configuration guide
- [`GOOGLE_OAUTH_IMPLEMENTATION.md`](./GOOGLE_OAUTH_IMPLEMENTATION.md) - Implementation details
- [`API_QUICK_REFERENCE.md`](./API_QUICK_REFERENCE.md) - API endpoints reference
- [`TESTING_GUIDE.md`](./TESTING_GUIDE.md) - Testing instructions
- [`IMPLEMENTATION_SUMMARY.md`](./IMPLEMENTATION_SUMMARY.md) - Complete implementation summary

## Authentication Flow

### Local Authentication (Email/Password)

1. User enters email and password
2. Frontend sends credentials to `/auth/local/sign-in`
3. Backend validates and returns tokens
4. Frontend stores tokens and redirects to dashboard

### Google OAuth

1. User clicks "Continue with Google"
2. Google OAuth popup appears
3. User authenticates with Google
4. Google returns authorization code
5. Frontend sends code to `/auth/google/callback`
6. Backend exchanges code for tokens
7. Frontend stores tokens and redirects to dashboard

## Environment Variables

| Variable                | Description            | Required         |
| ----------------------- | ---------------------- | ---------------- |
| `VITE_API_URL`          | Backend API URL        | Yes              |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID | For Google login |

## API Integration

The app communicates with the BroFinance backend API:

- **Base URL**: `http://localhost:4000/api/v1`
- **Authentication**: JWT tokens (access + refresh)
- **Format**: JSON

See [`API_QUICK_REFERENCE.md`](./API_QUICK_REFERENCE.md) for detailed API documentation.

## Building for Production

```bash
# Build the app
pnpm build

# Preview the build
pnpm preview
```

The build output will be in the `dist/` directory.

### Production Checklist

- [ ] Update `VITE_API_URL` to production API
- [ ] Configure Google OAuth for production domain
- [ ] Enable HTTPS
- [ ] Set up proper CORS on backend
- [ ] Configure environment variables securely
- [ ] Test all authentication flows
- [ ] Optimize bundle size
- [ ] Enable production error tracking

## Troubleshooting

### Google OAuth Issues

See [`GOOGLE_OAUTH_SETUP.md`](./GOOGLE_OAUTH_SETUP.md#troubleshooting) for detailed troubleshooting.

### Common Issues

**"Cannot connect to API"**

- Ensure backend is running on port 4000
- Check `VITE_API_URL` in `.env`
- Verify CORS is configured on backend

**"401 Unauthorized"**

- Clear localStorage and login again
- Check if tokens are expired
- Verify backend authentication is working

**"Google button doesn't appear"**

- Check `VITE_GOOGLE_CLIENT_ID` is set
- Restart dev server after adding env variables
- Check browser console for errors

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT

## Support

For issues and questions:

- Check the documentation files
- Review the troubleshooting sections
- Check browser console for errors
- Verify backend is running correctly

## Credits

Built with:

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [@react-oauth/google](https://www.npmjs.com/package/@react-oauth/google)
- [Wouter](https://github.com/molefrog/wouter)
- [Tailwind CSS](https://tailwindcss.com/)
