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

export default function Register() {
	const router = useRouter();
	const { login: setAuthUser, refreshUser } = useAuth();
	const [isLoading, setIsLoading] = React.useState(false);
	const [email, setEmail] = React.useState("");
	const [password, setPassword] = React.useState("");
	const [showPassword, setShowPassword] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);
	const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});

	const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);
		setFieldErrors({});
		try {
			await authApi.register({ email, password });
			router.push(`/verify-email?email=${encodeURIComponent(email)}`);
		} catch (err) {
			const formattedErrors = formatFieldErrors(err);
			if (formattedErrors) {
				setFieldErrors(formattedErrors);
			} else {
				setError(getErrorMessage(err));
			}
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
					setAuthUser(response.user);
					await refreshUser();
					router.push("/dashboard");
				} catch (err) {
					setError(getErrorMessage(err));
					setIsLoading(false);
				}
			})();
		},
		onError: () => setError("Google registration failed. Please try again."),
	});

	return (
		<AuthShell
			title="REGISTER"
			subtitle="IDENTITY GENERATION HUD"
		>
			<form onSubmit={handleSubmit} className="space-y-5">

				{error && (
					<div className="p-3 rounded-xl bg-red-500/5 text-red-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-3 border border-red-500/10 animate-in fade-in slide-in-from-top-1">
						<AlertCircle size={14} />
						{error}
					</div>
				)}

				<div className="space-y-4">
					<div className="space-y-2">
						<Label
							htmlFor="email"
							className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60 ml-1"
						>
							Email
						</Label>
						<div className="relative group/input">
							<Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within/input:text-blue-500 dark:group-focus-within/input:text-blue-400 transition-colors pointer-events-none z-10 opacity-40" />
							<Input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="name@example.com"
								className="h-11 pl-12 rounded-xl bg-muted/20 border-border/40 focus:border-blue-500/50 dark:focus:border-blue-400/50 focus:ring-0 transition-all text-[11px] font-medium"
								required
							/>
						</div>
						{fieldErrors.email && (
							<p className="text-[9px] text-red-500 font-bold uppercase tracking-tight ml-4 mt-1 opacity-80">{fieldErrors.email}</p>
						)}
					</div>

					<div className="space-y-2">
						<Label
							htmlFor="password"
							className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground opacity-60 ml-1"
						>
							Password
						</Label>
						<div className="relative group/input">
							<Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within/input:text-blue-500 dark:group-focus-within/input:text-blue-400 transition-colors pointer-events-none z-10 opacity-40" />
							<Input
								id="password"
								type={showPassword ? "text" : "password"}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="••••••••"
								className="h-11 pl-12 pr-12 rounded-xl bg-muted/20 border-border/40 focus:border-blue-500/50 dark:focus:border-blue-400/50 focus:ring-0 transition-all text-[11px] font-medium"
								required
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-blue-500 dark:hover:text-blue-400 transition-all z-20"
							>
								{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
							</button>
						</div>
						{fieldErrors.password && (
							<p className="text-[9px] text-red-500 font-bold uppercase tracking-tight ml-4 mt-1 opacity-80">{fieldErrors.password}</p>
						)}
					</div>
				</div>

				<Button
					disabled={isLoading}
					className="w-full h-11 bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-400 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 shadow-xl shadow-blue-500/20 hover:scale-[1.01] active:scale-[0.98]"
				>
					{isLoading ? (
						<div className="flex items-center gap-3">
							<Loader2 className="h-4 w-4 animate-spin" />
							<span>PROCESSING...</span>
						</div>
					) : (
						<div className="flex items-center gap-3">
							<span>Register</span>
							<UserPlus size={16} />
						</div>
					)}
				</Button>

				<div className="relative flex items-center gap-4 py-0.5">
					<span className="h-px bg-border/40 flex-1" />
					<span className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-30">or</span>
					<span className="h-px bg-border/40 flex-1" />
				</div>

				<Button
					variant="outline"
					type="button"
					disabled={isLoading}
					className="w-full h-11 rounded-xl border-border/60 hover:bg-muted text-[10px] font-black uppercase tracking-widest transition-all hover:border-blue-500/30 dark:hover:border-blue-400/30"
					onClick={() => loginWithGoogle()}
				>
					<svg viewBox="0 0 24 24" className="mr-3 h-4 w-4" aria-hidden="true">
						<path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
						<path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
						<path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
						<path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
					</svg>
					CONTINUE WITH GOOGLE
				</Button>

				<p className="text-center text-[10px] font-black text-muted-foreground mt-6 uppercase tracking-widest opacity-60 flex items-center justify-center gap-2">
					Joined already?
					<Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5">
						Initialize Access <ArrowRight size={11} />
					</Link>
				</p>


			</form>
		</AuthShell>
	);
}
