"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, Mail, Lock, Sparkles } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import { authApi } from "@/services/auth.service";
import { getErrorMessage, formatFieldErrors } from "@/lib/error-handler";

// Shared Layout Component
function AuthLayout({ children, title, subtitle }: Readonly<{ children: React.ReactNode, title: string, subtitle: string }>) {
	return (
		<main className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-background text-foreground p-4">
			{/* Background Ambience */}
			<div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
				<div className="absolute top-[20%] left-[20%] w-[600px] h-[600px] bg-foreground/5 rounded-full blur-[120px] translate-z-0" />
				<div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-secondary/40 rounded-full blur-[100px] translate-z-0" />
			</div>
			<div className="relative z-10 w-full max-w-[420px] animation-in fade-in zoom-in duration-500">
				<div className="mb-8 text-center flex flex-col items-center gap-2">
					<Link href="/" className="p-2 rounded-xl bg-foreground text-background transition-transform hover:scale-110 mb-4">
						<Sparkles size={24} fill="currentColor" />
					</Link>
					<h1 className="text-3xl font-bold tracking-tight">Create an account</h1>
					<p className="text-muted-foreground text-sm max-w-xs">Start your data journey with PyAnalypt today.</p>
				</div>
				<div className="glass-card p-8 border border-border/50 bg-background/50 backdrop-blur-xl rounded-2xl shadow-2xl">
					{children}
				</div>
			</div>
		</main>
	);
}

// Shared helper for Google Auth to avoid duplication
const handleGoogleLoginSuccess = async (
	accessToken: string,
	setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
	setError: React.Dispatch<React.SetStateAction<string | null>>,
	setAuthUser: (user: any) => void,
	router: any
) => {
	setIsLoading(true);
	setError(null);
	try {
		const response = await authApi.googleAuth(accessToken);
		setAuthUser(response.user);
		router.push("/dashboard");
	} catch (err) {
		setError(getErrorMessage(err));
		setIsLoading(false);
	}
};

export default function Register() {
	const router = useRouter();
	const { login: setAuthUser } = useAuth();
	const [isLoading, setIsLoading] = React.useState(false);
	const [username, setUsername] = React.useState("");
	const [password, setPassword] = React.useState("");
	const [confirmPassword, setConfirmPassword] = React.useState("");
	const [error, setError] = React.useState<string | null>(null);
	const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (password !== confirmPassword) {
			setError("Passwords do not match.");
			return;
		}
		setIsLoading(true);
		setError(null);
		setFieldErrors({});
		try {
			const response = await authApi.register({
				username,
				password1: password,
				password2: confirmPassword
			});
			setAuthUser(response.user);
			router.push("/dashboard");
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
			handleGoogleLoginSuccess(
				tokenResponse.access_token,
				setIsLoading,
				setError,
				setAuthUser,
				router
			);
		},
		onError: () => {
			setError("Google registration failed. Please try again.");
		}
	});

	return (
		<AuthLayout
			title="Create an account"
			subtitle="Start your data journey with PyAnalypt today."
		>
			<form onSubmit={handleSubmit} className="space-y-4">
				{error && (
					<div className="p-3 rounded-lg bg-destructive/10 text-destructive text-xs flex items-center gap-2 border border-destructive/20 animate-in fade-in slide-in-from-top-1">
						<AlertCircle size={14} />
						{error}
					</div>
				)}
				<div className="space-y-2">
					<label className="text-sm font-medium leading-none" htmlFor="username">
						Username
					</label>
					<div className="relative">
						<Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
						<input
							id="username"
							type="text"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							placeholder="johndoe"
							className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 pl-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
							required
						/>
					</div>
					{fieldErrors.username && (
						<p className="text-xs text-destructive mt-1">{fieldErrors.username}</p>
					)}
				</div>
				<div className="space-y-2">
					<label className="text-sm font-medium leading-none" htmlFor="password">
						Password
					</label>
					<div className="relative">
						<Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
						<input
							id="password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="••••••••"
							className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 pl-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
							required
						/>
					</div>
					{fieldErrors.password1 && (
						<p className="text-xs text-destructive mt-1">{fieldErrors.password1}</p>
					)}
				</div>
				<div className="space-y-2">
					<label className="text-sm font-medium leading-none" htmlFor="confirmPassword">
						Confirm Password
					</label>
					<div className="relative">
						<Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
						<input
							id="confirmPassword"
							type="password"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							placeholder="••••••••"
							className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 pl-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
							required
						/>
					</div>
					{fieldErrors.password2 && (
						<p className="text-xs text-destructive mt-1">{fieldErrors.password2}</p>
					)}
				</div>
				<Button className="w-full bg-foreground text-background hover:bg-foreground/90 mt-2" disabled={isLoading}>
					{isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Register"}
				</Button>
				<div className="flex items-center gap-2 my-4">
					<span className="h-px bg-muted flex-1" />
					<span className="text-xs uppercase text-muted-foreground">Or continue with</span>
					<span className="h-px bg-muted flex-1" />
				</div>
				<div className="w-full">
					<Button
						variant="outline"
						type="button"
						disabled={isLoading}
						className="w-full"
						onClick={() => loginWithGoogle()}
					>
						Google
					</Button>
				</div>
				<div className="text-center text-sm text-muted-foreground mt-4">
					Already have an account?{" "}
					<Link href="/login" className="underline underline-offset-4 hover:text-primary">
						Login
					</Link>
				</div>
				<p className="text-center text-xs text-muted-foreground mt-6 px-4">
					By clicking continue, you agree to our
					<Link href="/terms" className="underline underline-offset-4 hover:text-primary mx-1">Terms of Service</Link>
					and
					<Link href="/privacy" className="underline underline-offset-4 hover:text-primary mx-1">Privacy Policy</Link>.
				</p>
			</form>
		</AuthLayout>
	);
}
