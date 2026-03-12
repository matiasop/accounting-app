export const COOKIE_NAME = "auth_session"
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days in seconds

/**
 * Derives the expected session token by SHA-256 hashing AUTH_PASSWORD.
 * Changing the env var automatically invalidates all existing sessions.
 */
export async function getExpectedToken(): Promise<string | undefined> {
	const password = process.env.AUTH_PASSWORD
	if (!password) return undefined
	const data = new TextEncoder().encode(password)
	const hash = await crypto.subtle.digest("SHA-256", data)
	return Array.from(new Uint8Array(hash))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("")
}

/**
 * Checks whether the given cookie value matches the expected session token.
 */
export async function isTokenValid(
	token: string | undefined,
): Promise<boolean> {
	if (!token) return false
	const expected = await getExpectedToken()
	return !!expected && token === expected
}
