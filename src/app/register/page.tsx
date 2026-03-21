"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle, Mail, Lock } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import { authApi } from "@/services/auth.service";
import { getErrorMessage, formatFieldErrors } from "@/lib/error-handler";
import { AuthShell } from "@/components/auth/AuthShell";

export default function Register() {
	const router = useRouter();
	const { login: setAuthUser } = useAuth();
	const [isLoading, setIsLoading] = React.useState(false);
	const [username, setUsername] = React.useState("");
	const [password, setPassword] = React.useState("");
	const [error, setError] = React.useState<string | null>(null);
	const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});

	const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);
		setFieldErrors({});
		try {
			const response = await authApi.register({
				username,
				password1: password,
				password2: password,
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
			void (async () => {
				setIsLoading(true);
				setError(null);
				try {
					const response = await authApi.googleAuth(tokenResponse.access_token);
					setAuthUser(response.user);
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
					<Label htmlFor="username">Username</Label>
					<div className="relative">
						<Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
						<Input
							id="username"
							type="text"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							placeholder="johndoe"
							className="pl-10"
							required
						/>
					</div>
					{fieldErrors.username && (
						<p className="text-xs text-destructive">{fieldErrors.username}</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="password">Password</Label>
					<div className="relative">
						<Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
						<Input
							id="password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="••••••••"
							className="pl-10"
							required
						/>
					</div>
					{fieldErrors.password1 && (
						<p className="text-xs text-destructive">{fieldErrors.password1}</p>
					)}
				</div>

				<Button
					className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-2"
					disabled={isLoading}
				>
					{isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Register"}
				</Button>

				<div className="flex items-center gap-2 my-4">
					<span className="h-px bg-border flex-1" />
					<span className="text-xs text-muted-foreground">or continue with</span>
					<span className="h-px bg-border flex-1" />
				</div>

				<Button
					variant="outline"
					type="button"
					disabled={isLoading}
					className="w-full"
					onClick={() => loginWithGoogle()}
				>
					<svg viewBox="0 0 24 24" className="mr-2 h-4 w-4" aria-hidden="true">
						<path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
						<path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
						<path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
						<path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
					</svg>
					Google
				</Button>

				<p className="text-center text-sm text-muted-foreground mt-4">
					Already have an account?{" "}
					<Link href="/login" className="text-blue-500 hover:underline font-medium">
						Login
					</Link>
				</p>

				<p className="text-center text-xs text-muted-foreground mt-4 px-2">
					By registering, you agree to our{" "}
					<Link href="/terms" className="text-blue-500 hover:underline">Terms of Service</Link>
					{" "}and{" "}
					<Link href="/privacy" className="text-blue-500 hover:underline">Privacy Policy</Link>.
				</p>
			</form>
		</AuthShell>
	);
}
