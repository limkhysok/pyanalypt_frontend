import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function getInitials(user: {
    full_name?: string | null;
    username?: string;
    email?: string | null;
}): string {
    if (user.full_name) {
        const parts = user.full_name.trim().split(/\s+/);
        if (parts.length >= 2) {
            const last = parts.at(-1) ?? parts[0];
            return `${parts[0][0]}${last[0]}`.toUpperCase();
        }
        return parts[0].slice(0, 2).toUpperCase();
    }
    if (user.username) return user.username.slice(0, 2).toUpperCase();
    if (user.email)    return user.email[0].toUpperCase();
    return "U";
}

export function formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

export function formatRelative(dateStr: string | null | undefined): string {
    if (!dateStr) return "—";
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60_000);
    if (minutes < 1)   return "just now";
    if (minutes < 60)  return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24)    return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30)     return `${days}d ago`;
    return formatDate(dateStr);
}
