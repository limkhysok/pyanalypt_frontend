"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle, User, Fingerprint, Calendar, ArrowRight } from "lucide-react";
import { authApi } from "@/services/auth.service";
import { getErrorMessage, formatFieldErrors } from "@/lib/error-handler";
import { AuthShell } from "@/components/auth/AuthShell";

export default function CompleteProfile() {
	const router = useRouter();
	const { refreshUser } = useAuth();
	
	const [username, setUsername] = React.useState("");
	const [fullName, setFullName] = React.useState("");
	const [birthday, setBirthday] = React.useState("");
	
	const [isLoading, setIsLoading] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);
	const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
	
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
			await authApi.completeProfile({ 
				username, 
				full_name: fullName, 
				birthday 
			});
			await refreshUser();
			router.push("/dashboard");
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
			title="Complete your profile" 
			subtitle="Just a few more details to get started with PyAnalypt."
		>
			<form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
				{error && (
					<div className="p-3 rounded-xl bg-red-500/8 text-red-500 text-xs font-medium flex items-center gap-3 border border-red-500/15 animate-in fade-in slide-in-from-top-1">
						<AlertCircle size={14} className="shrink-0" />
						{error}
					</div>
				)}

				<div className="space-y-1.5">
					<Label htmlFor="full_name" className="text-xs font-semibold tracking-wide text-muted-foreground ml-1">
						Full Name
					</Label>
					<div className="relative group/input">
						<User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within/input:text-foreground/60 transition-colors pointer-events-none z-10 opacity-50" />
						<Input
							id="full_name"
							type="text"
							value={fullName}
							onChange={(e) => setFullName(e.target.value)}
							placeholder="John Doe"
							className="h-11 pl-12 rounded-xl bg-muted/20 border-border/40 focus:border-foreground/25 focus:ring-0 transition-all text-sm"
							required
							autoFocus
						/>
					</div>
					{fieldErrors.full_name && (
						<p className="text-xs text-red-500 font-medium ml-1">{fieldErrors.full_name}</p>
					)}
				</div>

				<div className="space-y-1.5">
					<Label htmlFor="username" className="text-xs font-semibold tracking-wide text-muted-foreground ml-1">
						Username
					</Label>
					<div className="relative group/input">
						<Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within/input:text-foreground/60 transition-colors pointer-events-none z-10 opacity-50" />
						<Input
							id="username"
							type="text"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							placeholder="johndoe"
							className="h-11 pl-12 rounded-xl bg-muted/20 border-border/40 focus:border-foreground/25 focus:ring-0 transition-all text-sm"
							required
						/>
					</div>
                    <p className="text-[10px] text-muted-foreground/50 ml-1">
                        Must be unique. You can change this later.
                    </p>
					{fieldErrors.username && (
						<p className="text-xs text-red-500 font-medium ml-1">{fieldErrors.username}</p>
					)}
				</div>

				<div className="space-y-1.5">
					<Label htmlFor="birthday" className="text-xs font-semibold tracking-wide text-muted-foreground ml-1">
						Date of Birth
					</Label>
					<div className="relative group/input">
						<Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within/input:text-foreground/60 transition-colors pointer-events-none z-10 opacity-50" />
						<Input
							id="birthday"
							type="date"
							value={birthday}
							onChange={(e) => setBirthday(e.target.value)}
							className="h-11 pl-12 rounded-xl bg-muted/20 border-border/40 focus:border-foreground/25 focus:ring-0 transition-all text-sm block w-full appearance-none"
							required
						/>
					</div>
					{fieldErrors.birthday && (
						<p className="text-xs text-red-500 font-medium ml-1">{fieldErrors.birthday}</p>
					)}
				</div>

				<div className="pt-4">
					<Button
						disabled={isLoading}
						className="w-full h-11 bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 dark:from-blue-500 dark:to-blue-400 dark:hover:from-blue-600 dark:hover:to-blue-500 text-white rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 hover:scale-[1.01] active:scale-[0.98]"
					>
						{isLoading ? (
							<div className="flex items-center gap-2.5">
								<Loader2 className="h-4 w-4 animate-spin" />
								<span>Finalizing...</span>
							</div>
						) : (
							<div className="flex items-center gap-2.5">
								<span>Complete Profile</span>
								<ArrowRight size={15} />
							</div>
						)}
					</Button>
				</div>
			</form>
		</AuthShell>
	);
}
