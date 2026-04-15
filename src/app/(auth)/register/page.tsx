"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle, Mail, Lock, UserPlus, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import { authApi } from "@/services/auth.service";
import { getErrorMessage, formatFieldErrors } from "@/lib/error-handler";
import { AuthShell } from "@/components/auth/AuthShell";

function getPasswordStrength(pwd: string): number {
	if (!pwd) return 0;
	let score = 0;
	if (pwd.length >= 8) score++;
	if (pwd.length >= 12) score++;
	if (/[A-Z]/.test(pwd)) score++;
	if (/\d/.test(pwd)) score++;
	if (/[^A-Za-z0-9]/.test(pwd)) score++;
	return score;
}

const strengthLabel = ["", "Weak", "Fair", "Good", "Strong", "Very strong"];
const strengthColor = ["", "bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-teal-500", "bg-green-500"];
const strengthTextColor = ["", "text-red-500", "text-orange-400", "text-yellow-500", "text-teal-500", "text-green-500"];

export default function Register() {
	const router = useRouter();
	const { login: setAuthUser, refreshUser } = useAuth();
	const [isLoading, setIsLoading] = React.useState(false);
	const [email, setEmail] = React.useState("");
	const [password, setPassword] = React.useState("");
	const [showPassword, setShowPassword] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);
	const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});

	const strength = getPasswordStrength(password);
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
		setFieldErrors({});
		try {
			await authApi.register({ 
				email, 
				password 
			});
			router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
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

	const loginWithGoogle = useGoogleLogin({
		onSuccess: (tokenResponse) => {
			void (async () => {
				setIsLoading(true);
				setError(null);
				try {
					const response = await authApi.googleAuth(tokenResponse.access_token);
					
					if ('requires_2fa' in response) {
						// Google shouldn't normally trigger 2FA here unless specifically configured,
						// but Case B in API docs allows for it.
						return; 
					}

					setAuthUser(response.user);
					await refreshUser();
					router.push("/dashboard");
				} catch (err) {
					setError(getErrorMessage(err));
					triggerShake();
					setIsLoading(false);
				}
			})();
		},
		onError: () => {
			setError("Google registration failed. Please try again.");
			triggerShake();
		},
	});

	return (
		<AuthShell title="Create Account">
			<form ref={formRef} onSubmit={handleSubmit} className="space-y-5">

				{error && (
					<div className="p-3 rounded-xl bg-red-500/8 text-red-500 text-xs font-medium flex items-center gap-3 border border-red-500/15 animate-in fade-in slide-in-from-top-1">
						<AlertCircle size={14} className="shrink-0" />
						{error}
					</div>
				)}

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
							className="h-11 pl-12 rounded-xl bg-muted/20 border-border/40 focus:border-foreground/25 focus:ring-0 transition-all text-sm"
							required
							autoFocus
						/>
					</div>
					{fieldErrors.email && (
						<p className="text-xs text-red-500 font-medium ml-1">{fieldErrors.email}</p>
					)}
				</div>

				<div className="space-y-1.5">
					<Label htmlFor="password" className="text-xs font-semibold tracking-wide text-muted-foreground ml-1">
						Password
					</Label>
					<div className="relative group/input">
						<Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within/input:text-foreground/60 transition-colors pointer-events-none z-10 opacity-50" />
						<Input
							id="password"
							type={showPassword ? "text" : "password"}
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="••••••••"
							className="h-11 pl-12 pr-12 rounded-xl bg-muted/20 border-border/40 focus:border-foreground/25 focus:ring-0 transition-all text-sm"
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

					{/* Password strength meter */}
					{password.length > 0 && (
						<div className="space-y-1.5 px-0.5">
							<div className="flex gap-1">
								{(["s1", "s2", "s3", "s4", "s5"] as const).map((id, i) => (
									<div
										key={id}
										className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < strength ? strengthColor[strength] : "bg-muted/50"}`}
									/>
								))}
							</div>
							<p className={`text-[10px] font-medium ml-0.5 transition-colors ${strengthTextColor[strength]}`}>
								{strengthLabel[strength]}
							</p>
						</div>
					)}

					{fieldErrors.password && (
						<p className="text-xs text-red-500 font-medium ml-1">{fieldErrors.password}</p>
					)}
				</div>

				<div className="pt-2">
					<Button
						disabled={isLoading}
						className="w-full h-11 bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 dark:from-blue-500 dark:to-blue-400 dark:hover:from-blue-600 dark:hover:to-blue-500 text-white rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 hover:scale-[1.01] active:scale-[0.98]"
					>
						{isLoading ? (
							<div className="flex items-center gap-2.5">
								<Loader2 className="h-4 w-4 animate-spin" />
								<span>Creating account...</span>
							</div>
						) : (
							<div className="flex items-center gap-2.5">
								<span>Create account</span>
								<UserPlus size={15} />
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
					className="w-full h-11 rounded-xl border-border/60 bg-transparent hover:bg-muted/60 text-sm font-medium tracking-wide transition-all duration-200 hover:border-border"
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
					Already have an account?
					<Link href="/login" className="text-foreground hover:underline font-semibold flex items-center gap-1">
						Sign in <ArrowRight size={12} />
					</Link>
				</p>

			</form>
		</AuthShell>
	);
}
