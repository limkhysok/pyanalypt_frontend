# ✅ Axios API Setup Complete

## 📦 What Was Created

### 1. **Type Definitions** (`src/types/api.ts`)
- User interface
- AuthResponse, RegisterRequest, LoginRequest
- GoogleAuthRequest, RefreshTokenRequest
- ApiError interface

### 2. **Token Management** (`src/lib/token.ts`)
- `tokenManager.getAccessToken()`
- `tokenManager.getRefreshToken()`
- `tokenManager.setTokens(access, refresh)`
- `tokenManager.clearTokens()`
- `tokenManager.isAuthenticated()`

### 3. **Axios Instance** (`src/lib/axios.ts`)
- Configured with base URL from environment
- Request interceptor: Automatically adds JWT token
- Response interceptor: Automatically refreshes expired tokens
- Queue system to prevent multiple refresh requests

### 4. **Auth Service** (`src/services/auth.service.ts`)
- `authApi.register(data)` - Register new user
- `authApi.login(data)` - Login with email/password
- `authApi.googleAuth(token)` - Google OAuth login
- `authApi.logout()` - Logout and clear tokens
- `authApi.isAuthenticated()` - Check auth status

### 5. **Error Handling** (`src/lib/error-handler.ts`)
- `parseApiError(error)` - Parse errors into ApiError
- `getErrorMessage(error)` - Get user-friendly message
- `formatFieldErrors(error)` - Get form field errors

### 6. **API Index** (`src/services/api.ts`)
- Centralized exports for easy importing

### 7. **Documentation** (`API_USAGE.md`)
- Complete usage examples
- Authentication flows
- Error handling patterns
- TypeScript types

---

## 🎯 Quick Start

### Import in your components:

```typescript
import { authApi, getErrorMessage } from '@/services/api';
```

### Example: Login

```typescript
const handleLogin = async (email: string, password: string) => {
  try {
    const response = await authApi.login({ email, password });
    console.log('Logged in:', response.user);
    // Tokens are automatically stored
    router.push('/dashboard');
  } catch (error) {
    console.error(getErrorMessage(error));
  }
};
```

---

## 🔧 Environment Variables

**Frontend** (`.env.local`):
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Backend** (`../pyanalypt/.env`):
```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback
```

---

## 🚀 Next Steps

1. **Install Google OAuth Library** (for Google Sign-In button):
   ```bash
   npm install @react-oauth/google
   ```

2. **Create Layout/Provider** with GoogleOAuthProvider

3. **Create Login/Register Pages** using the examples in `API_USAGE.md`

4. **Test the API** with your backend

---

## 📂 File Structure

```
src/
├── types/
│   └── api.ts                    # TypeScript types
├── lib/
│   ├── axios.ts                  # Axios instance with interceptors
│   ├── token.ts                  # Token management
│   └── error-handler.ts          # Error parsing utilities
└── services/
    ├── api.ts                    # Centralized exports
    └── auth.service.ts           # Authentication API methods
```

---

## ✨ Features

✅ Automatic JWT token attachment to requests  
✅ Automatic token refresh when expired  
✅ Request queueing during token refresh  
✅ Comprehensive error handling  
✅ Full TypeScript support  
✅ SSR-safe (checks for `window`)  
✅ Django REST Framework error format support  
✅ User-friendly error messages  

---

**Created**: 2026-02-10  
**Dependencies Installed**: axios  
**Documentation**: See `API_USAGE.md` for detailed examples
