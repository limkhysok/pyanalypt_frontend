# API Usage Examples

This document provides examples of how to use the PyAnalypt API services in your components.

## Table of Contents
- [Installation](#installation)
- [Configuration](#configuration)
- [Basic Usage](#basic-usage)
- [Authentication Examples](#authentication-examples)
- [Error Handling](#error-handling)
- [TypeScript Types](#typescript-types)

---

## Installation

All dependencies are already installed. The API client uses:
- `axios` for HTTP requests
- Built-in interceptors for authentication
- Automatic token refresh

---

## Configuration

### Environment Variables

Make sure your `.env.local` file contains:
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Basic Usage

### Import the API Services

```typescript
// Import everything you need from one place
import { authApi, getErrorMessage, formatFieldErrors } from '@/services/api';

// Or import specific services
import { authApi } from '@/services/auth.service';
import { tokenManager } from '@/lib/token';
```

---

## Authentication Examples

### 1. User Registration

```typescript
'use client';

import { useState } from 'react';
import { authApi, getErrorMessage, type RegisterRequest } from '@/services/api';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (formData: RegisterRequest) => {
    try {
      setLoading(true);
      setError('');

      const response = await authApi.register(formData);
      
      console.log('Registration successful:', response.user);
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // ... rest of component
}
```

### 2. User Login

```typescript
'use client';

import { useState } from 'react';
import { authApi, getErrorMessage } from '@/services/api';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');

      const response = await authApi.login({ email, password });
      
      console.log('Login successful:', response.user);
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      {error && <div className="error">{error}</div>}
      
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

### 3. Google OAuth Login

First, install the Google OAuth library:
```bash
npm install @react-oauth/google
```

Then wrap your app with GoogleOAuthProvider:

```typescript
// app/layout.tsx or app/providers.tsx
'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';

export default function Providers({ children }: { children: React.ReactNode }) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      {children}
    </GoogleOAuthProvider>
  );
}
```

Then use it in your login component:

```typescript
'use client';

import { GoogleLogin } from '@react-oauth/google';
import { authApi, getErrorMessage } from '@/services/api';
import { useRouter } from 'next/navigation';

export default function GoogleAuthButton() {
  const router = useRouter();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const { credential } = credentialResponse;
      
      // Send Google token to backend
      const response = await authApi.googleAuth(credential);
      
      console.log('Google login successful:', response.user);
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Google login failed:', getErrorMessage(error));
    }
  };

  const handleGoogleError = () => {
    console.error('Google login failed');
  };

  return (
    <GoogleLogin
      onSuccess={handleGoogleSuccess}
      onError={handleGoogleError}
      useOneTap
      theme="outline"
      size="large"
      text="continue_with"
    />
  );
}
```

### 4. Logout

```typescript
'use client';

import { authApi } from '@/services/api';

export default function LogoutButton() {
  const handleLogout = () => {
    authApi.logout();
    // This automatically clears tokens and redirects to /login
  };

  return (
    <button onClick={handleLogout}>
      Logout
    </button>
  );
}
```

### 5. Check Authentication Status

```typescript
'use client';

import { useEffect, useState } from 'react';
import { authApi } from '@/services/api';
import { useRouter } from 'next/navigation';

export default function ProtectedPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authApi.isAuthenticated()) {
      router.push('/login');
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <div>Protected Content</div>;
}
```

---

## Error Handling

### Display Field-Specific Errors

```typescript
'use client';

import { useState } from 'react';
import { authApi, formatFieldErrors, getErrorMessage } from '@/services/api';

export default function RegisterForm() {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');

  const handleSubmit = async (formData: any) => {
    try {
      setFieldErrors({});
      setGeneralError('');

      await authApi.register(formData);
    } catch (error) {
      // Try to get field-specific errors
      const errors = formatFieldErrors(error);
      
      if (errors) {
        setFieldErrors(errors);
      } else {
        // Show general error if no field errors
        setGeneralError(getErrorMessage(error));
      }
    }
  };

  return (
    <form>
      {generalError && <div className="error">{generalError}</div>}
      
      <div>
        <input type="email" name="email" />
        {fieldErrors.email && <span className="error">{fieldErrors.email}</span>}
      </div>
      
      <div>
        <input type="password" name="password1" />
        {fieldErrors.password1 && <span className="error">{fieldErrors.password1}</span>}
      </div>
    </form>
  );
}
```

---

## TypeScript Types

All types are exported from `@/services/api`:

```typescript
import type { 
  User, 
  AuthResponse, 
  RegisterRequest, 
  LoginRequest 
} from '@/services/api';

// Use in your components
const handleLogin = async (credentials: LoginRequest): Promise<AuthResponse> => {
  return await authApi.login(credentials);
};
```

---

## Advanced: Making Custom API Calls

If you need to make custom API calls outside of the auth service:

```typescript
import { apiClient } from '@/services/api';

// GET request
const fetchUserProfile = async (userId: number) => {
  const response = await apiClient.get(`/users/${userId}/`);
  return response.data;
};

// POST request
const updateProfile = async (userId: number, data: any) => {
  const response = await apiClient.post(`/users/${userId}/update/`, data);
  return response.data;
};

// The apiClient automatically:
// - Adds Authorization header with JWT token
// - Refreshes token if expired
// - Redirects to login if refresh fails
```

---

## Token Management

The token management is automatic, but you can access it if needed:

```typescript
import { tokenManager } from '@/services/api';

// Check if authenticated
const isLoggedIn = tokenManager.isAuthenticated();

// Get tokens manually (usually not needed)
const accessToken = tokenManager.getAccessToken();
const refreshToken = tokenManager.getRefreshToken();

// Clear tokens manually
tokenManager.clearTokens();
```

---

## Summary

✅ **Automatic Features:**
- JWT token attachment to requests
- Automatic token refresh when expired
- Request queueing during token refresh
- Error handling and parsing
- Type safety with TypeScript

✅ **Available Services:**
- `authApi.register()` - User registration
- `authApi.login()` - Email/password login
- `authApi.googleAuth()` - Google OAuth login
- `authApi.logout()` - Logout and clear tokens
- `authApi.isAuthenticated()` - Check auth status

✅ **Error Utilities:**
- `getErrorMessage()` - Get user-friendly error message
- `formatFieldErrors()` - Get field-specific errors for forms
- `parseApiError()` - Parse raw errors into ApiError type

---

**Next Steps:**
1. Install Google OAuth library: `npm install @react-oauth/google`
2. Wrap your app with `GoogleOAuthProvider`
3. Create login/register pages using the examples above
4. Add authentication guards to protected routes
