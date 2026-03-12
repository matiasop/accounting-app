import { createServerFn } from "@tanstack/react-start"
import { getCookie, setCookie, deleteCookie } from "@tanstack/react-start/server"
import { COOKIE_NAME, COOKIE_MAX_AGE, getExpectedToken, isTokenValid } from "@/lib/auth"

/**
 * Returns whether the current request has a valid auth cookie.
 * Called from __root.tsx beforeLoad to guard all routes.
 */
export const checkAuthFn = createServerFn({ method: "GET" }).handler(async () => {
	const token = getCookie(COOKIE_NAME)
	const authenticated = await isTokenValid(token)
	return { authenticated }
})

/**
 * Validates the password and sets the session cookie.
 * Includes a 1.5-second delay on failure to slow brute-force attacks.
 */
export const loginFn = createServerFn({ method: "POST" })
	.inputValidator((data: unknown) => {
		if (
			typeof data !== "object" ||
			data === null ||
			typeof (data as { password?: unknown }).password !== "string"
		) {
			throw new Error("Invalid input")
		}
		return data as { password: string }
	})
	.handler(async ({ data }) => {
		const expectedToken = await getExpectedToken()

		if (!expectedToken) {
			throw new Error("AUTH_PASSWORD environment variable is not configured")
		}

		// Hash the submitted password exactly like getExpectedToken()
		const encoder = new TextEncoder()
		const hash = await crypto.subtle.digest("SHA-256", encoder.encode(data.password))
		const submittedToken = Array.from(new Uint8Array(hash))
			.map((b) => b.toString(16).padStart(2, "0"))
			.join("")

		if (submittedToken !== expectedToken) {
			// Slow down brute-force attempts
			await new Promise((resolve) => setTimeout(resolve, 1500))
			throw new Error("Incorrect password")
		}

		setCookie(COOKIE_NAME, expectedToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: COOKIE_MAX_AGE,
			path: "/",
		})

		return { success: true as const }
	})

/**
 * Clears the session cookie, effectively logging out.
 */
export const logoutFn = createServerFn({ method: "POST" }).handler(async () => {
	deleteCookie(COOKIE_NAME, { path: "/" })
	return { success: true as const }
})
