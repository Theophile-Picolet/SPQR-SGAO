// Add the authenticated user to the Fastify request (set by the auth middleware, epic G)
import "fastify";

export type Role = "consultant" | "manager" | "admin";

declare module "fastify" {
	interface FastifyRequest {
		user?: { id: number; role: Role };
	}
}
