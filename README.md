# PyAnalypt Frontend

A modern data analysis and visualization platform built with **Next.js**, **TypeScript**, and **Tailwind CSS**.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Auth:** JWT + Google OAuth2 (via dj-rest-auth)
- **HTTP Client:** Axios (with auto token refresh)
- **Animations:** Framer Motion

## Getting Started

### Prerequisites

- Node.js 18+
- Backend running at `http://localhost:8000` (see [pyanalypt](https://github.com/soklimkhy/pyanalypt))

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

## Project Structure

```
src/
├── app/                  # Next.js App Router pages
├── components/           # Reusable UI components
│   ├── layout/           # Navbar, Footer, etc.
│   └── ui/               # shadcn/ui components
├── contents/             # Page-level content components
├── context/              # React context (AuthContext)
├── lib/                  # Utilities (axios, token manager, error handler)
├── services/             # API service layer
│   └── auth.service.ts   # Authentication API calls
└── types/
    └── api.ts            # TypeScript type definitions
```

## API Documentation

See [`API_DOC.md`](./API_DOC.md) for the full public API reference including all endpoints, request/response shapes, and error codes.

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## License

MIT
