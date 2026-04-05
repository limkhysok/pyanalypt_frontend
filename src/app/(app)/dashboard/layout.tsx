import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";

export default async function DashboardLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    const cookieStore = await cookies();
    if (!cookieStore.get("auth_session")?.value) {
        redirect("/login");
    }

    return <AppShell>{children}</AppShell>;
}
