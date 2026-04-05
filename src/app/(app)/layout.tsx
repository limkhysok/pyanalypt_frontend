// App layout — passthrough for authenticated routes.
// Each route (dashboard, datasets, analysis, etc.) owns its own layout.tsx
// with its AppNavbar + AppSidebar configuration.
export default function AppLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return <>{children}</>;
}
