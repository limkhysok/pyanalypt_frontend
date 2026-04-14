"use client";

import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle, Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { authApi } from "@/services/auth.service";
import { getErrorMessage } from "@/lib/error-handler";
import { AuthShell } from "@/components/auth/AuthShell";

export default function ResetPasswordPage() {
	const params = useParams<{ uid: string; token: string }>();
	const router = useRouter();

	const [isLoading, setIsLoading] = React.useState(false);
	const [newPassword1, setNewPassword1] = React.useState("");
	const [newPassword2, setNewPassword2] = React.useState("");
	const [showPassword1, setShowPassword1] = React.useState(false);
	const [showPassword2, setShowPassword2] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);
	const [done, setDone] = React.useState(false);

	const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (newPassword1 !== newPassword2) {
			setError("Passwords do not match.");
			return;
		}
		if (newPassword1.length < 8) {
			setError("Password must be at least 8 characters.");
			return;
		}
		setIsLoading(true);
		setError(null);
		try {
			await authApi.resetPasswordConfirm({
				uid: params.uid,
				token: params.token,
				new_password1: newPassword1,
				new_password2: newPassword2,
			});
			setDone(true);
			setTimeout(() => router.push("/login"), 3000);
		} catch (err) {
			const msg = getErrorMessage(err);
			// Surface DRF field errors (token invalid / uid invalid)
			setError(msg || "Reset failed. The link may have expired — request a new one.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<AuthShell title="RESET" subtitle="SET NEW PASSWORD">
			{done ? (
				<div className="space-y-5 text-center">
					<div className="flex justify-center">
						<div className="h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
							<CheckCircle2 size={28} />
						</div>
					</div>
					<div className="space-y-2">
						<p className="text-[13px] font-bold">Password reset!</p>
						<p className="text-[11px] text-muted-foreground leading-relaxed">
							Your password has been updated. Redirecting to login…
						</p>
					</div>
					<Link href="/login">
						<Button className="w-full h-11 bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-400 rounded-xl text-[11px] font-black uppercase tracking-[0.2em]">
							Go to Login
						</Button>
					</Link>
				</div>
			) : (
				<form onSubmit={handleSubmit} className="space-y-5">
					<p className="text-[11px] text-muted-foreground text-center leading-relaxed">
						Choose a strong new password for your account.
					</p>

					{error && (
						<div className="p-3 rounded-xl bg-red-500/5 text-red-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-3 border border-red-500/10 animate-in fade-in slide-in-from-top-1">
							<AlertCircle size={14} />
							{error}
						</div>
					)}

					<div className="space-y-2">
						<Label
							htmlFor="password1"
							className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60 ml-1"
						>
							New Password
						</Label>
						<div className="relative group/input">
							<Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within/input:text-blue-500 dark:group-focus-within/input:text-blue-400 transition-colors pointer-events-none z-10 opacity-40" />
							<Input
								id="password1"
								type={showPassword1 ? "text" : "password"}
								value={newPassword1}
								onChange={(e) => setNewPassword1(e.target.value)}
								placeholder="••••••••"
								className="h-11 pl-12 pr-12 rounded-xl bg-muted/20 border-border/40 focus:border-blue-500/50 dark:focus:border-blue-400/50 focus:ring-0 transition-all text-[11px] font-medium"
								required
								autoFocus
								autoComplete="new-password"
							/>
							<button
								type="button"
								onClick={() => setShowPassword1(!showPassword1)}
								className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-blue-500 dark:hover:text-blue-400 transition-all z-20"
							>
								{showPassword1 ? <EyeOff size={16} /> : <Eye size={16} />}
							</button>
						</div>
					</div>

					<div className="space-y-2">
						<Label
							htmlFor="password2"
							className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60 ml-1"
						>
							Confirm Password
						</Label>
						<div className="relative group/input">
							<Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within/input:text-blue-500 dark:group-focus-within/input:text-blue-400 transition-colors pointer-events-none z-10 opacity-40" />
							<Input
								id="password2"
								type={showPassword2 ? "text" : "password"}
								value={newPassword2}
								onChange={(e) => setNewPassword2(e.target.value)}
								placeholder="••••••••"
								className="h-11 pl-12 pr-12 rounded-xl bg-muted/20 border-border/40 focus:border-blue-500/50 dark:focus:border-blue-400/50 focus:ring-0 transition-all text-[11px] font-medium"
								required
								autoComplete="new-password"
							/>
							<button
								type="button"
								onClick={() => setShowPassword2(!showPassword2)}
								className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-blue-500 dark:hover:text-blue-400 transition-all z-20"
							>
								{showPassword2 ? <EyeOff size={16} /> : <Eye size={16} />}
							</button>
						</div>
					</div>

					<Button
						disabled={isLoading}
						className="w-full h-11 bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-400 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 shadow-xl shadow-blue-500/20 hover:scale-[1.01] active:scale-[0.98]"
					>
						{isLoading ? (
							<div className="flex items-center gap-3">
								<Loader2 className="h-4 w-4 animate-spin" />
								<span>RESETTING...</span>
							</div>
						) : (
							"Set New Password"
						)}
					</Button>

					<p className="text-center text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
						Link expired?{" "}
						<Link href="/forgot-password" className="text-blue-600 dark:text-blue-400 hover:underline">
							Request a new one
						</Link>
					</p>
				</form>
			)}
		</AuthShell>
	);
}
