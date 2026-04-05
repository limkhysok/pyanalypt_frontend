import { cookies } from "next/headers";

export default async function VerifyEmailLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    await cookies();
    return <>{children}</>;
}
