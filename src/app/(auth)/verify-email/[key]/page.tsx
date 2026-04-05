"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CircleX, RefreshCw } from "lucide-react";
import { authApi } from "@/services/auth.service";
import { getErrorMessage } from "@/lib/error-handler";
import { AuthShell } from "@/components/auth/AuthShell";

function resolveKey(k: string | string[] | undefined): string {
	if (typeof k === "string") return decodeURIComponent(k);
	if (Array.isArray(k)) return decodeURIComponent(k.join(""));
	return "";
}

// Module-level: persists across React Strict Mode unmount/remount cycles
const _attemptedKeys = new Set<string>();

export default function VerifyEmailConfirm() {
	const params = useParams();
	const router = useRouter();
	const key = resolveKey(params.key);

	const [status, setStatus] = React.useState<"loading" | "error">("loading");
	const [error, setError] = React.useState<string | null>(null);

	// Resend state
	const [resendEmail, setResendEmail] = React.useState("");
	const [isResending, setIsResending] = React.useState(false);
	const [resendStatus, setResendStatus] = React.useState<"idle" | "sent" | "error">("idle");
	const [resendError, setResendError] = React.useState<string | null>(null);

	React.useEffect(() => {
		if (!key || _attemptedKeys.has(key)) return;
		_attemptedKeys.add(key);
		void (async () => {
			try {
				await authApi.verifyEmail(key);
				router.replace("/login?verified=true");
			} catch (err) {
				const status = err instanceof AxiosError ? err.response?.status : undefined;
				if (status === 400 || status === 404) {
					setError("Verification link is invalid or expired.");
				} else {
					setError(getErrorMessage(err));
				}
				setStatus("error");
			}
		})();
	}, [key, router]);

	const handleResend = () => {
		if (!resendEmail) return;
		setIsResending(true);
		setResendStatus("idle");
		setResendError(null);
		void (async () => {
			try {
				await authApi.resendVerificationEmail(resendEmail);
				setResendStatus("sent");
			} catch (err) {
				setResendError(getErrorMessage(err));
				setResendStatus("error");
			} finally {
				setIsResending(false);
			}
		})();
	};

	if (status === "loading") {
		return (
			<AuthShell title="Verifying…" subtitle="">
				<div className="flex flex-col items-center gap-4 py-6">
					<Loader2 className="h-8 w-8 animate-spin text-blue-500" />
					<p className="text-sm text-muted-foreground">Verifying your email…</p>
				</div>
			</AuthShell>
		);
	}

	return (
		<AuthShell title="Verification failed" subtitle="">
			<div className="flex flex-col items-center gap-6 py-2">
				<div className="p-4 rounded-full bg-destructive/10 border border-destructive/20">
					<CircleX className="h-8 w-8 text-destructive" />
				</div>

				<p className="text-sm text-center text-destructive">
					{error ?? "Verification link is invalid or expired."}
				</p>

				<div className="w-full space-y-3">
					<p className="text-sm font-medium text-foreground">Resend verification email</p>

					<div className="space-y-2">
						<Label htmlFor="resend-email">Your email address</Label>
						<Input
							id="resend-email"
							type="email"
							placeholder="name@example.com"
							value={resendEmail}
							onChange={(e) => setResendEmail(e.target.value)}
							disabled={resendStatus === "sent"}
						/>
					</div>

					{resendStatus === "sent" && (
						<p className="text-xs text-emerald-600 dark:text-emerald-400">
							Verification email sent. Check your inbox.
						</p>
					)}
					{resendStatus === "error" && resendError && (
						<p className="text-xs text-destructive">{resendError}</p>
					)}

					<Button
						className="w-full"
						variant="outline"
						disabled={isResending || !resendEmail || resendStatus === "sent"}
						onClick={handleResend}
					>
						{isResending ? (
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						) : (
							<RefreshCw className="mr-2 h-4 w-4" />
						)}
						{resendStatus === "sent" ? "Email sent" : "Resend verification email"}
					</Button>
				</div>
			</div>
		</AuthShell>
	);
}
