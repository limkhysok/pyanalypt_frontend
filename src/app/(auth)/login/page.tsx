"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle, Mail, Lock, ShieldCheck, ArrowRight, Eye, EyeOff, KeyRound } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import { authApi } from "@/services/auth.service";
import { getErrorMessage } from "@/lib/error-handler";
import { AuthShell } from "@/components/auth/AuthShell";

type Step = "credentials" | "totp";

export default function Login() {
	const router = useRouter();
	const { login: setAuthUser, refreshUser } = useAuth();
	const [isLoading, setIsLoading] = React.useState(false);
	const [email, setEmail] = React.useState("");
	const [password, setPassword] = React.useState("");
	const [showPassword, setShowPassword] = React.useState(false);
	const [rememberMe, setRememberMe] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);

	const [step, setStep] = React.useState<Step>("credentials");
	const [totpToken, setTotpToken] = React.useState("");
	const [totpCode, setTotpCode] = React.useState("");

	const formRef = React.useRef<HTMLFormElement>(null);

	const triggerShake = () => {
		const el = formRef.current;
		if (!el) return;
		el.classList.remove("animate-shake");
		el.getBoundingClientRect();
		el.classList.add("animate-shake");
		setTimeout(() => el.classList.remove("animate-shake"), 600);
	};

	const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);
		try {
			const response = await authApi.login({ email, password });
			if ('requires_2fa' in response) {
				setTotpToken(response.totp_token);
				setStep("totp");
				return;
			}
			setAuthUser(response.user);
			await refreshUser();

			if (response.requires_profile_completion) {
				router.push("/complete-profile");
				return;
			}

					router.push("/datasets");
		} catch (err: unknown) {
			const axiosErr = err as { response?: { status: number; data?: { requires_verification?: boolean; email?: string } } };
			if (axiosErr.response?.status === 403 && axiosErr.response?.data?.requires_verification) {
				const unverifiedEmail = axiosErr.response.data.email || email;
				sessionStorage.setItem('otp_pending_email', unverifiedEmail.toLowerCase());
				router.push(`/verify-otp?email=${encodeURIComponent(unverifiedEmail)}`);
				return;
			}
			setError(getErrorMessage(err));
			triggerShake();
		} finally {
			setIsLoading(false);
		}
	};

	const handleTotpSubmit = async (e?: React.SyntheticEvent<HTMLFormElement>) => {
		e?.preventDefault();
		setIsLoading(true);
		setError(null);
		try {
			const response = await authApi.verify2FALogin({ totp_token: totpToken, code: totpCode });
			setAuthUser(response.user);
			await refreshUser();

			if (response.requires_profile_completion) {
				router.push("/complete-profile");
				return;
			}

					router.push("/datasets");
		} catch (err: unknown) {
			const axiosErr = err as { response?: { status: number } };
			// 429 and token-expired both require restarting from the login screen
			if (axiosErr.response?.status === 429) {
				setStep("credentials");
				setTotpToken("");
				setTotpCode("");
				setError("Too many attempts. Please try again later.");
				triggerShake();
				return;
			}
			const msg = getErrorMessage(err);
			if (msg.toLowerCase().includes("expired")) {
				setStep("credentials");
				setTotpToken("");
				setTotpCode("");
				setError("Session expired. Please log in again.");
			} else {
				setError(msg);
			}
			triggerShake();
		} finally {
			setIsLoading(false);
		}
	};

	// Auto-submit TOTP when 6 digits are entered
	React.useEffect(() => {
		if (step === "totp" && totpCode.length === 6 && !isLoading) {
			void handleTotpSubmit();
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [totpCode, step]);

	const loginWithGoogle = useGoogleLogin({
		onSuccess: (tokenResponse) => {
			void (async () => {
				setIsLoading(true);
				setError(null);
				try {
					const response = await authApi.googleAuth(tokenResponse.access_token);
					
					if ('requires_2fa' in response) {
						setTotpToken(response.totp_token);
						setStep("totp");
						return;
					}

					setAuthUser(response.user);
					await refreshUser();

					if (response.requires_profile_completion) {
						router.push("/complete-profile");
						return;
					}

							router.push("/datasets");
				} catch (err: unknown) {
					const axiosErr = err as { response?: { status: number; data?: { requires_verification?: boolean; email?: string } } };
					if (axiosErr.response?.status === 403 && axiosErr.response?.data?.requires_verification) {
						const unverifiedEmail = axiosErr.response.data.email || email;
						router.push(`/verify-otp?email=${encodeURIComponent(unverifiedEmail)}`);
						return;
					}
					setError(getErrorMessage(err));
					triggerShake();
				} finally {
					setIsLoading(false);
				}
			})();
		},
		onError: () => {
			setError("Google login failed. Please try again.");
			triggerShake();
		},
	});

	// ── 2FA TOTP step ────────────────────────────────────────────────────────
	if (step === "totp") {
		return (
			<AuthShell title="Verify">
				<form ref={formRef} onSubmit={handleTotpSubmit} className="space-y-4 sm:space-y-5">
					{error && (
						<div className="p-3 rounded-none bg-red-500/8 text-red-500 text-xs font-medium flex items-center gap-3 border border-red-500/15 animate-in fade-in slide-in-from-top-1">
							<AlertCircle size={14} className="shrink-0" />
							{error}
						</div>
					)}

					<p className="text-xs sm:text-[12px] text-muted-foreground text-center leading-relaxed px-2">
						Open your authenticator app and enter the 6-digit code for{" "}
						<span className="font-semibold text-foreground">PyAnalypt</span>.
					</p>

					<div className="space-y-2">
						<Label htmlFor="totp" className="text-xs font-semibold tracking-wide text-muted-foreground ml-1">
							Authentication code
						</Label>
						<div className="relative group/input">
							<KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within/input:text-foreground/60 transition-colors pointer-events-none z-10 opacity-50" />
							<Input
								id="totp"
								type="text"
								inputMode="numeric"
								pattern="[0-9]{6}"
								maxLength={6}
								value={totpCode}
								onChange={(e) => setTotpCode(e.target.value.replaceAll(/\D/g, ""))}
								placeholder="000000"
								className="h-11 pl-12 rounded-none bg-muted/20 border-border/40 focus:border-foreground/25 focus:ring-0 transition-all text-[15px] font-mono font-medium tracking-[0.4em] text-center"
								autoFocus
								required
							/>
						</div>
						<p className="text-[10px] sm:text-[10px] text-muted-foreground/40 text-center mt-1">
							Auto-submits when all 6 digits are entered
						</p>
					</div>

					<Button
						disabled={isLoading || totpCode.length < 6}
						className="w-full h-11 bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 dark:from-blue-500 dark:to-blue-400 dark:hover:from-blue-600 dark:hover:to-blue-500 text-white rounded-none text-sm font-semibold tracking-wide transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 hover:scale-[1.01] active:scale-[0.98]"
					>
						{isLoading ? (
							<div className="flex items-center gap-2.5">
								<Loader2 className="h-4 w-4 animate-spin" />
								<span>Verifying...</span>
							</div>
						) : (
							<div className="flex items-center gap-2.5">
								<span>Verify code</span>
								<ShieldCheck size={15} />
							</div>
						)}
					</Button>

					<button
						type="button"
						onClick={() => { setStep("credentials"); setError(null); setTotpCode(""); }}
						className="w-full text-center text-xs font-medium text-muted-foreground/40 hover:text-foreground transition-colors py-1"
					>
						← Back to sign in
					</button>
				</form>
			</AuthShell>
		);
	}

	// ── Credentials step ─────────────────────────────────────────────────────
	return (
		<AuthShell title="Login">
			<form ref={formRef} onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">

				{error && (
					<div className="p-3 rounded-xl bg-red-500/8 text-red-500 text-xs font-medium flex items-center gap-3 border border-red-500/15 animate-in fade-in slide-in-from-top-1">
						<AlertCircle size={14} className="shrink-0" />
						{error}
					</div>
				)}

				<div className="space-y-3 sm:space-y-4">
					<div className="space-y-1.5">
						<Label htmlFor="email" className="text-xs font-semibold tracking-wide text-muted-foreground ml-1">
							Email address
						</Label>
						<div className="relative group/input">
							<Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within/input:text-foreground/60 transition-colors pointer-events-none z-10 opacity-50" />
							<Input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="name@example.com"
								className="h-11 pl-12 rounded-none bg-muted/20 border-border/40 focus:border-foreground/25 focus:ring-0 transition-all text-sm"
								autoFocus
								required
							/>
						</div>
					</div>

					<div className="space-y-1.5">
						<div className="flex items-center justify-between ml-1 mr-0.5">
							<Label htmlFor="password" className="text-xs font-semibold tracking-wide text-muted-foreground">
								Password
							</Label>
							<Link
								href="/forgot-password"
								className="text-xs font-medium text-muted-foreground/45 hover:text-foreground transition-colors"
							>
								Forgot password?
							</Link>
						</div>
						<div className="relative group/input">
							<Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within/input:text-foreground/60 transition-colors pointer-events-none z-10 opacity-50" />
							<Input
								id="password"
								type={showPassword ? "text" : "password"}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="••••••••"
								className="h-11 pl-12 pr-12 rounded-none bg-muted/20 border-border/40 focus:border-foreground/25 focus:ring-0 transition-all text-sm"
								required
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-foreground transition-all z-20"
							>
								{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
							</button>
						</div>
					</div>

					{/* Remember me */}
					<div className="flex items-center gap-2 ml-1">
						<input
							id="remember"
							type="checkbox"
							checked={rememberMe}
							onChange={(e) => setRememberMe(e.target.checked)}
							className="h-3.5 w-3.5 rounded border-border/60 cursor-pointer"
						/>
						<Label htmlFor="remember" className="text-xs font-medium text-muted-foreground/60 cursor-pointer select-none">
							Remember me
						</Label>
					</div>
				</div>

				<div className="space-y-2">
					<Button
						disabled={isLoading}
						className="w-full h-11 bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 dark:from-blue-500 dark:to-blue-400 dark:hover:from-blue-600 dark:hover:to-blue-500 text-white rounded-none text-sm font-semibold tracking-wide transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 hover:scale-[1.01] active:scale-[0.98]"
					>
						{isLoading ? (
							<div className="flex items-center gap-2.5">
								<Loader2 className="h-4 w-4 animate-spin" />
								<span>Signing in...</span>
							</div>
						) : (
							<div className="flex items-center gap-2.5">
								<span>Sign in</span>
								<ShieldCheck size={15} />
							</div>
						)}
					</Button>
				</div>

				<div className="relative flex items-center gap-3">
					<span className="flex-1 border-t border-dashed border-border/50" />
					<span className="text-xs font-medium text-muted-foreground/35 px-1">or</span>
					<span className="flex-1 border-t border-dashed border-border/50" />
				</div>

				<Button
					variant="outline"
					type="button"
					disabled={isLoading}
					className="w-full h-11 rounded-none border-border/60 bg-transparent hover:bg-muted/60 text-sm font-medium tracking-wide transition-all duration-200 hover:border-border"
					onClick={() => loginWithGoogle()}
				>
					<svg viewBox="0 0 24 24" className="mr-2.5 h-4 w-4 shrink-0" aria-hidden="true">
						<path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
						<path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
						<path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
						<path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
					</svg>
					Continue with Google
				</Button>

				<p className="text-center text-sm font-medium text-muted-foreground/70 flex items-center justify-center gap-1.5">
					Don&apos;t have an account?
					<Link href="/register" className="text-foreground hover:underline font-semibold flex items-center gap-1">
						Sign up <ArrowRight size={12} />
					</Link>
				</p>
			</form>
		</AuthShell>
	);
}
