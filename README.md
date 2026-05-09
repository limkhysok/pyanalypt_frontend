# PyAnalypt Frontend

A modern data analysis and visualization platform built with **Next.js**, **TypeScript**, and **Tailwind CSS**.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Auth:** JWT + Google OAuth2 (via dj-rest-auth)
- **HTTP Client:** Axios (with auto token refresh)
- **Animations:** Framer Motion

## Features

### Datasets

A full dataset management workspace for importing, organizing, and exporting data files.

- **Import** — upload CSV, JSON, XLSX, or Parquet files (25 MB limit) via format-picker dropdown
- **Dataset table** — lists all datasets with file name, format badge, size, and date added; supports search, sort (newest / oldest / name A–Z / name Z–A), and format filter
- **Actions per dataset** — rename, duplicate (quick clone or convert to another format), export as any supported format, delete
- **Storage stats** — total file count, format diversity count, and a live storage usage bar (out of 2 GB quota)
- **Activity logs** — timestamped feed of every upload, rename, duplicate, export, and delete event with action-specific details

---

### DataLab

An interactive data inspection and transformation workspace. Select any dataset from the dropdown to load it.

**Data Preview tab**

- Scrollable table showing raw dataset rows with a metadata strip (name, format, storage size, row count, column count)
- **Inline column rename** — hover a column header to reveal a pencil icon; click to edit in-place, confirm with Enter or blur, cancel with Escape
- **Inline cell editing** — click any cell to enter edit mode; Enter commits, Escape reverts; backend type coercion is applied automatically (int, float, bool, datetime, string, category)
- **Dtype error feedback** — if a committed value is rejected by the backend (wrong dtype), the cell turns red with an inline error tooltip for 5 seconds before auto-clearing, with no toast noise

**Inspect tab**

- Per-column stats table: dtype, non-null count, unique count, null count, null % — null-heavy rows are highlighted red
- **Key column detection** — columns where every value is unique (IDs, transaction keys) are flagged with a key icon
- **Type casting** — select a target dtype for one or more columns, then apply all casts at once; results show per-column success/error badges inline
- **Cast warnings** — if a cast would lose data (e.g. float → int truncation), a confirmation dialog previews the affected columns before committing
- **Drop Duplicates** — configure which columns to check (subset) and which copy to keep (first / last / drop all); shows rows before/after on completion

---

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
