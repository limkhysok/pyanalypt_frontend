"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle, ShieldCheck, ArrowLeft } from "lucide-react";
import { authApi } from "@/services/auth.service";
import { getErrorMessage, formatFieldErrors } from "@/lib/error-handler";
import { AuthShell } from "@/components/auth/AuthShell";
import Link from "next/link";

const RESEND_COOLDOWN_SECONDS = 60;
const SESSION_KEY = "otp_pending_email";
const RESEND_TS_KEY = "otp_resend_at";

function VerifyOtpContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { login: setAuthUser, refreshUser } = useAuth();

	const email = searchParams.get("email") ?? "";

	const [otp, setOtp] = React.useState("");
	const [isLoading, setIsLoading] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);
	const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});

	const [resendLoading, setResendLoading] = React.useState(false);
	const [resendSuccess, setResendSuccess] = React.useState(false);
	const [cooldown, setCooldown] = React.useState(0);

	const formRef = React.useRef<HTMLFormElement>(null);

	// ── Session gate: block direct URL access ────────────────────────────────
	React.useEffect(() => {
		const allowed = sessionStorage.getItem(SESSION_KEY);
		if (!allowed || allowed !== email.toLowerCase()) {
			router.replace("/register");
		}
	}, [email, router]);

	// ── Restore cooldown from sessionStorage on mount ────────────────────────
	React.useEffect(() => {
		const ts = Number.parseInt(sessionStorage.getItem(RESEND_TS_KEY) ?? "0", 10);
		if (ts) {
			const elapsed = Math.floor((Date.now() - ts) / 1000);
			const remaining = Math.max(0, RESEND_COOLDOWN_SECONDS - elapsed);
			if (remaining > 0) setCooldown(remaining);
		}
	}, []);

	// ── Countdown tick ───────────────────────────────────────────────────────
	React.useEffect(() => {
		if (cooldown <= 0) return;
		const timer = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
		return () => clearInterval(timer);
	}, [cooldown]);

	const triggerShake = () => {
		const el = formRef.current;
		if (!el) return;
		el.classList.remove("animate-shake");
		el.getBoundingClientRect();
		el.classList.add("animate-shake");
		setTimeout(() => el.classList.remove("animate-shake"), 600);
	};

	const handleResend = async () => {
		if (!email || resendLoading || cooldown > 0) return;
		setResendLoading(true);
		setResendSuccess(false);
		setError(null);
		try {
			await authApi.resendOtp(email);
			sessionStorage.setItem(RESEND_TS_KEY, Date.now().toString());
			setCooldown(RESEND_COOLDOWN_SECONDS);
			setResendSuccess(true);
			setTimeout(() => setResendSuccess(false), 5000);
		} catch (err) {
			setError(getErrorMessage(err));
			triggerShake();
		} finally {
			setResendLoading(false);
		}
	};

	const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (otp.length !== 6) {
			setError("Please enter the 6-digit verification code.");
			triggerShake();
			return;
		}

		setIsLoading(true);
		setError(null);
		setFieldErrors({});

		try {
			const response = await authApi.verifyOtp({ email, otp });
			// Verification succeeded — clear the session gate
			sessionStorage.removeItem(SESSION_KEY);
			sessionStorage.removeItem(RESEND_TS_KEY);
			setAuthUser(response.user);
			await refreshUser();
			router.push("/complete-profile");
		} catch (err) {
			const formattedErrors = formatFieldErrors(err);
			if (formattedErrors) {
				setFieldErrors(formattedErrors);
			} else {
				setError(getErrorMessage(err));
			}
			triggerShake();
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<AuthShell
			title="Verify your email"
			subtitle={`We've sent a 6-digit code to ${email || "your email"}`}
		>
			<form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
				{error && (
					<div className="p-3 rounded-none bg-red-500/8 text-red-500 text-xs font-medium flex items-center gap-3 border border-red-500/15 animate-in fade-in slide-in-from-top-1">
						<AlertCircle size={14} className="shrink-0" />
						{error}
					</div>
				)}

				{resendSuccess && (
					<div className="p-3 rounded-none bg-emerald-500/8 text-emerald-500 text-xs font-medium flex items-center gap-3 border border-emerald-500/15 animate-in fade-in slide-in-from-top-1">
						<ShieldCheck size={14} className="shrink-0" />
						A new code has been sent to your email.
					</div>
				)}

				<div className="space-y-4">
					<div className="space-y-1.5">
						<Label htmlFor="otp" className="text-xs font-semibold tracking-wide text-muted-foreground ml-1">
							Verification Code
						</Label>
						<div className="relative group/input">
							<ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within/input:text-foreground/60 transition-colors pointer-events-none z-10 opacity-50" />
							<Input
								id="otp"
								type="text"
								inputMode="numeric"
								pattern="[0-9]*"
								maxLength={6}
								value={otp}
								onChange={(e) => {
									const val = e.target.value.replaceAll(/\D/g, "");
									if (val.length <= 6) setOtp(val);
								}}
								placeholder="000000"
								className="h-12 pl-12 rounded-none bg-muted/20 border-border/40 focus:border-foreground/25 focus:ring-0 transition-all text-center text-xl tracking-[0.5em] font-mono"
								autoFocus
								required
							/>
						</div>
						{fieldErrors.otp && (
							<p className="text-xs text-red-500 font-medium ml-1 text-center">{fieldErrors.otp}</p>
						)}
					</div>
				</div>

				<Button
					disabled={isLoading || otp.length !== 6}
					className="w-full h-11 bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 dark:from-blue-500 dark:to-blue-400 dark:hover:from-blue-600 dark:hover:to-blue-500 text-white rounded-none text-sm font-semibold tracking-wide transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 hover:scale-[1.01] active:scale-[0.98]"
				>
					{isLoading ? (
						<div className="flex items-center gap-2.5">
							<Loader2 className="h-4 w-4 animate-spin" />
							<span>Verifying...</span>
						</div>
					) : (
						<span>Verify Account</span>
					)}
				</Button>

				<div className="flex flex-col gap-4 text-center">
					<p className="text-sm text-muted-foreground">
						Didn&apos;t receive the code?{" "}
						{cooldown > 0 ? (
							<span className="text-muted-foreground/50 font-semibold">
								Resend in {cooldown}s
							</span>
						) : (
							<button
								type="button"
								disabled={resendLoading}
								onClick={handleResend}
								className="text-foreground hover:underline font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{resendLoading ? "Sending..." : "Resend Code"}
							</button>
						)}
					</p>

					<Link
						href="/register"
						className="inline-flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
					>
						<ArrowLeft size={12} />
						Back to registration
					</Link>
				</div>
			</form>
		</AuthShell>
	);
}

export default function VerifyOtp() {
	return (
		<React.Suspense>
			<VerifyOtpContent />
		</React.Suspense>
	);
}
