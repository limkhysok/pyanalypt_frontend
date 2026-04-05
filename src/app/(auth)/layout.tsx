// Auth layout — minimal shell for login, register, verify-email.
// No Navbar, no Footer, no SmoothScroll.
export default function AuthLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return <>{children}</>;
}
