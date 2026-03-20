"use server";

export async function subscribeNewsletter(
  _prevState: { success: boolean; message: string } | null,
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  const email = formData.get("email") as string;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, message: "Please enter a valid email address." };
  }

  // TODO: integrate with email service (e.g. Resend, Mailchimp)

  return { success: true, message: "You're subscribed!" };
}
