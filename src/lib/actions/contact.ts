"use server";

export async function submitContact(
    _prevState: { success: boolean; message: string } | null,
    formData: FormData
): Promise<{ success: boolean; message: string }> {
    const name = (formData.get("name") as string)?.trim();
    const email = formData.get("email") as string;
    const message = (formData.get("message") as string)?.trim();

    if (!name) return { success: false, message: "Please enter your name." };
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { success: false, message: "Please enter a valid email address." };
    }
    if (!message || message.length < 20) {
        return { success: false, message: "Message must be at least 20 characters." };
    }

    // Email service integration (e.g. Resend) goes here.

    return { success: true, message: "Message sent! We'll get back to you within 24 hours." };
}
