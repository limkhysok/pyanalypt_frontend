"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle, Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import { authApi } from "@/services/auth.service";
import { getErrorMessage } from "@/lib/error-handler";
import { AuthShell } from "@/components/auth/AuthShell";

export default function ForgotPasswordPage() {
	const [isLoading, setIsLoading] = React.useState(false);
	const [email, setEmail] = React.useState("");
	const [error, setError] = React.useState<string | null>(null);
	const [sent, setSent] = React.useState(false);

	const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);
		try {
			await authApi.forgotPassword(email);
			setSent(true);
		} catch (err) {
			setError(getErrorMessage(err));
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<AuthShell title="RECOVER" subtitle="PASSWORD RESET">
			{sent ? (
				<div className="space-y-5 text-center">
					<div className="flex justify-center">
						<div className="h-14 w-14 rounded-none bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
							<CheckCircle2 size={28} />
						</div>
					</div>
					<div className="space-y-2">
						<p className="text-[13px] font-bold">Check your inbox</p>
						<p className="text-[11px] text-muted-foreground leading-relaxed">
							We sent a password reset link to <span className="font-bold text-foreground">{email}</span>. The link expires in 3 days.
						</p>
					</div>
					<Link href="/login">
						<Button
							variant="ghost"
							className="w-full h-11 rounded-none text-[10px] font-black capitalize tracking-widest border border-border/40"
						>
							Back to Login
						</Button>
					</Link>
				</div>
			) : (
				<form onSubmit={handleSubmit} className="space-y-5">
					<p className="text-[11px] text-muted-foreground text-center leading-relaxed">
						Enter your account email and we&apos;ll send you a reset link.
					</p>

					{error && (
						<div className="p-3 rounded-none bg-red-500/5 text-red-500 text-[10px] font-black capitalize tracking-widest flex items-center gap-3 border border-red-500/10 animate-in fade-in slide-in-from-top-1">
							<AlertCircle size={14} />
							{error}
						</div>
					)}

					<div className="space-y-2">
						<Label
							htmlFor="email"
							className="text-[10px] font-black capitalize tracking-[0.2em] text-muted-foreground opacity-60 ml-1"
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
								className="h-11 pl-12 rounded-none bg-muted/20 border-border/40 focus:border-blue-500/50 dark:focus:border-blue-400/50 focus:ring-0 transition-all text-[11px] font-medium"
								required
								autoFocus
							/>
						</div>
					</div>

					<Button
						disabled={isLoading}
						className="w-full h-11 bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-400 rounded-none text-[11px] font-black capitalize tracking-[0.2em] transition-all duration-300 shadow-xl shadow-blue-500/20 hover:scale-[1.01] active:scale-[0.98]"
					>
						{isLoading ? (
							<div className="flex items-center gap-3">
								<Loader2 className="h-4 w-4 animate-spin" />
								<span>SENDING...</span>
							</div>
						) : (
							<div className="flex items-center gap-3">
								<span>Send Reset Link</span>
								<ArrowRight size={16} />
							</div>
						)}
					</Button>

					<p className="text-center text-[10px] font-black text-muted-foreground capitalize tracking-widest opacity-60 flex items-center justify-center gap-2">
						Remembered it?
						<Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5">
							Back to Login <ArrowRight size={11} />
						</Link>
					</p>
				</form>
			)}
		</AuthShell>
	);
}
