import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function getInitials(user: {
    first_name?: string | null;
    last_name?: string | null;
    username?: string;
    email?: string | null;
}): string {
    if (user.first_name && user.last_name)
        return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    if (user.first_name) return user.first_name[0].toUpperCase();
    if (user.username)   return user.username.slice(0, 2).toUpperCase();
    if (user.email)      return user.email[0].toUpperCase();
    return "U";
}
