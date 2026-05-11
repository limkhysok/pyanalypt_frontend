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
	const { user, refreshUser } = useAuth();

	// Redirect immediately if profile is already complete
	React.useEffect(() => {
		if (user?.full_name && user?.birthday) {
			router.replace("/datasets");
		}
	}, [user, router]);
	
	const [username, setUsername] = React.useState("");
	const [fullName, setFullName] = React.useState("");
	const [birthday, setBirthday] = React.useState("");
	const [dobMonth, setDobMonth] = React.useState("");
	const [dobDay, setDobDay] = React.useState("");
	const [dobYear, setDobYear] = React.useState("");
	
	const [isLoading, setIsLoading] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);
	const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
	
	// Sync individual DOB parts → ISO date string for the API
	React.useEffect(() => {
		if (dobYear && dobMonth && dobDay) {
			const mm = dobMonth.padStart(2, "0");
			const dd = dobDay.padStart(2, "0");
			setBirthday(`${dobYear}-${mm}-${dd}`);
		} else {
			setBirthday("");
		}
	}, [dobMonth, dobDay, dobYear]);

	const currentYear = new Date().getFullYear();
	const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
	const months = [
		{ value: "1", label: "January" },
		{ value: "2", label: "February" },
		{ value: "3", label: "March" },
		{ value: "4", label: "April" },
		{ value: "5", label: "May" },
		{ value: "6", label: "June" },
		{ value: "7", label: "July" },
		{ value: "8", label: "August" },
		{ value: "9", label: "September" },
		{ value: "10", label: "October" },
		{ value: "11", label: "November" },
		{ value: "12", label: "December" },
	];
	const daysInMonth = dobMonth && dobYear
		? new Date(Number(dobYear), Number(dobMonth), 0).getDate()
		: 31;
	const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

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
			router.push("/datasets");
		} catch (err: unknown) {
			const axiosErr = err as { response?: { status: number; data?: { detail?: string } } };
			// Profile already complete — treat as success and redirect
			if (axiosErr.response?.status === 400 &&
				axiosErr.response?.data?.detail === "Profile has already been completed.") {
				router.replace("/datasets");
				return;
			}
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
					<div className="p-3 rounded-none bg-red-500/8 text-red-500 text-xs font-medium flex items-center gap-3 border border-red-500/15 animate-in fade-in slide-in-from-top-1">
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
							className="h-11 pl-12 rounded-none bg-muted/20 border-border/40 focus:border-foreground/25 focus:ring-0 transition-all text-sm"
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
							className="h-11 pl-12 rounded-none bg-muted/20 border-border/40 focus:border-foreground/25 focus:ring-0 transition-all text-sm"
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
					<Label className="text-xs font-semibold tracking-wide text-muted-foreground ml-1">
						Date of Birth
					</Label>
					<div className="grid grid-cols-3 gap-2">
						{/* Month */}
						<div className="relative group/select">
							<Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within/select:text-foreground/60 transition-colors pointer-events-none z-10 opacity-50" />
							<select
								value={dobMonth}
								onChange={(e) => {
									setDobMonth(e.target.value);
									// Reset day if it exceeds new month's days
									const newDays = dobYear
										? new Date(Number(dobYear), Number(e.target.value), 0).getDate()
										: 31;
									if (Number(dobDay) > newDays) setDobDay("");
								}}
								required
								className="h-11 w-full pl-9 pr-2 rounded-none bg-muted/20 border border-border/40 focus:border-foreground/25 focus:outline-none transition-all text-sm appearance-none text-foreground cursor-pointer"
							>
								<option value="" disabled className="text-muted-foreground bg-background">Month</option>
								{months.map((m) => (
									<option key={m.value} value={m.value} className="bg-background">{m.label}</option>
								))}
							</select>
						</div>

						{/* Day */}
						<div className="relative group/select">
							<select
								value={dobDay}
								onChange={(e) => setDobDay(e.target.value)}
								required
								className="h-11 w-full px-3 rounded-none bg-muted/20 border border-border/40 focus:border-foreground/25 focus:outline-none transition-all text-sm appearance-none text-foreground cursor-pointer"
							>
								<option value="" disabled className="text-muted-foreground bg-background">Day</option>
								{days.map((d) => (
									<option key={d} value={d} className="bg-background">{d}</option>
								))}
							</select>
						</div>

						{/* Year */}
						<div className="relative group/select">
							<select
								value={dobYear}
								onChange={(e) => {
									setDobYear(e.target.value);
									// Reset day if current month/day combo is invalid for new year (leap year edge case)
									if (dobMonth === "2" && dobDay === "29") {
										const isLeap = new Date(Number(e.target.value), 1, 29).getDate() === 29;
										if (!isLeap) setDobDay("");
									}
								}}
								required
								className="h-11 w-full px-3 rounded-none bg-muted/20 border border-border/40 focus:border-foreground/25 focus:outline-none transition-all text-sm appearance-none text-foreground cursor-pointer"
							>
								<option value="" disabled className="text-muted-foreground bg-background">Year</option>
								{years.map((y) => (
									<option key={y} value={y} className="bg-background">{y}</option>
								))}
							</select>
						</div>
					</div>
					{fieldErrors.birthday && (
						<p className="text-xs text-red-500 font-medium ml-1">{fieldErrors.birthday}</p>
					)}
				</div>

				<div className="pt-4">
					<Button
						disabled={isLoading}
						className="w-full h-11 bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 dark:from-blue-500 dark:to-blue-400 dark:hover:from-blue-600 dark:hover:to-blue-500 text-white rounded-none text-sm font-semibold tracking-wide transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 hover:scale-[1.01] active:scale-[0.98]"
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
