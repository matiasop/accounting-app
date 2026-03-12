import { useState } from "react"
import { createFileRoute, useRouter } from "@tanstack/react-router"
import { loginFn } from "@/functions/auth"

export const Route = createFileRoute("/login")({
	component: LoginPage,
})

function LoginPage() {
	const router = useRouter()
	const [password, setPassword] = useState("")
	const [error, setError] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(false)

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		setError(null)
		setIsLoading(true)

		try {
			await loginFn({ data: { password } })
			// Invalidate router so beforeLoad re-runs everywhere with the new cookie
			await router.invalidate()
			router.navigate({ to: "/entries" })
		} catch (err) {
			setError(err instanceof Error ? err.message : "Login failed")
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="min-h-screen bg-background flex items-center justify-center px-4">
			<div className="w-full max-w-sm">
				{/* Title */}
				<div className="mb-8">
					<h1 className="text-4xl font-extrabold uppercase tracking-widest text-foreground">
						Accounting
					</h1>
					<p className="mt-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
						Enter password to continue
					</p>
				</div>

				{/* Card */}
				<div className="rounded-sm border-[3px] border-black bg-white p-8 shadow-brutal-lg">
					<form onSubmit={handleSubmit} className="space-y-6">
						<div className="space-y-2">
							<label
								htmlFor="password"
								className="block text-xs font-extrabold uppercase tracking-widest text-foreground"
							>
								Password
							</label>
							<input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="••••••••"
								// biome-ignore lint/a11y/noAutofocus: login page, UX improvement
								autoFocus
								required
								className="h-11 w-full rounded-sm border-2 border-black bg-white px-3 text-sm font-medium shadow-brutal-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:shadow-brutal transition-shadow"
							/>
						</div>

						{error && (
							<div className="rounded-sm border-2 border-red-600 bg-red-50 px-3 py-2">
								<p className="text-sm font-bold text-red-700">{error}</p>
							</div>
						)}

						<button
							type="submit"
							disabled={!password || isLoading}
							className="inline-flex h-11 w-full items-center justify-center rounded-sm border-2 border-black bg-primary text-sm font-extrabold uppercase tracking-wide shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:pointer-events-none disabled:opacity-50"
						>
							{isLoading ? "Checking..." : "Login"}
						</button>
					</form>
				</div>
			</div>
		</div>
	)
}
