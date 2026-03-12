import { createMiddleware } from "@tanstack/react-start"
import { getCookie } from "@tanstack/react-start/server"
import { COOKIE_NAME, isTokenValid } from "@/lib/auth"

/**
 * Server function middleware that rejects unauthenticated requests.
 * Apply to all data server functions via .middleware([authMiddleware]).
 */
export const authMiddleware = createMiddleware({ type: "function" }).server(
	async ({ next }) => {
		const token = getCookie(COOKIE_NAME)
		if (!(await isTokenValid(token))) {
			throw new Error("Unauthorized")
		}
		return next()
	},
)
