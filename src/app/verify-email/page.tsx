"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, MailCheck, RefreshCw } from "lucide-react";
import { authApi } from "@/services/auth.service";
import { getErrorMessage } from "@/lib/error-handler";
import { AuthShell } from "@/components/auth/AuthShell";

function VerifyEmailContent() {
	const searchParams = useSearchParams();
	const email = searchParams.get("email") ?? "";

	const [isResending, setIsResending] = React.useState(false);
	const [resendStatus, setResendStatus] = React.useState<"idle" | "sent" | "error">("idle");
	const [resendError, setResendError] = React.useState<string | null>(null);

	const handleResend = () => {
		if (!email) return;
		setIsResending(true);
		setResendStatus("idle");
		setResendError(null);
		void (async () => {
			try {
				await authApi.resendVerificationEmail(email);
				setResendStatus("sent");
			} catch (err) {
				setResendError(getErrorMessage(err));
				setResendStatus("error");
			} finally {
				setIsResending(false);
			}
		})();
	};

	return (
		<AuthShell
			title="Check your email"
			subtitle="A verification link has been sent to your inbox."
		>
			<div className="flex flex-col items-center gap-6 py-2">
				<div className="p-4 rounded-full bg-blue-500/10 border border-blue-500/20">
					<MailCheck className="h-8 w-8 text-blue-500" />
				</div>

				<div className="text-center space-y-2">
					<p className="text-sm text-muted-foreground">We sent a verification link to</p>
					{email && (
						<p className="text-sm font-semibold text-foreground break-all">{email}</p>
					)}
					<p className="text-sm text-muted-foreground">
						Click the link in the email to activate your account.
						Check your spam folder if you don&apos;t see it.
						Links expire after <span className="font-medium text-foreground">3 days</span>.
					</p>
				</div>

				<div className="w-full space-y-3">
					{resendStatus === "sent" && (
						<p className="text-center text-xs text-emerald-600 dark:text-emerald-400">
							Verification email resent successfully.
						</p>
					)}
					{resendStatus === "error" && resendError && (
						<p className="text-center text-xs text-destructive">{resendError}</p>
					)}

					<Button
						variant="outline"
						className="w-full"
						disabled={isResending || resendStatus === "sent"}
						onClick={handleResend}
					>
						{isResending ? (
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						) : (
							<RefreshCw className="mr-2 h-4 w-4" />
						)}
						{resendStatus === "sent" ? "Email sent" : "Resend verification email"}
					</Button>

					<p className="text-center text-sm text-muted-foreground">
						Already verified?{" "}
						<Link href="/login" className="text-blue-500 hover:underline font-medium">
							Log in
						</Link>
					</p>

					<p className="text-center text-xs text-muted-foreground">
						Wrong email?{" "}
						<Link href="/register" className="text-blue-500 hover:underline">
							Register again
						</Link>
					</p>
				</div>
			</div>
		</AuthShell>
	);
}

export default function VerifyEmail() {
	return (
		<React.Suspense>
			<VerifyEmailContent />
		</React.Suspense>
	);
}
