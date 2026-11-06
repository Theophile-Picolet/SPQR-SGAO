// Load fastify to create a web application
import Fastify from "fastify";

// Built-in logger (Pino) and a limit on the size of the request body
const app = Fastify({ logger: true, bodyLimit: 100 * 1024 });

/* ************************************************************************* */

// Read the cookies of the requests (the JWT is stored in an HttpOnly cookie)
import cookie from "@fastify/cookie";

app.register(cookie);

/* ************************************************************************* */

import cors from "@fastify/cors";

// Origins allowed to call the API (comma-separated list, checked at startup by checkEnv).
// If the variable is missing, no origin is allowed.
const allowedOrigins = process.env.ALLOWED_ORIGINS;

app.register(cors, {
	origin: allowedOrigins ? allowedOrigins.split(",").map((origin) => origin.trim()) : [],
	credentials: true,
});

/* ************************************************************************* */

// Register the API routes
import router from "./router";

app.register(router);

/* ************************************************************************* */

// Unknown routes and most errors are handled by Fastify (native error handler).
// Only server errors (5xx) go through our safety net, except in development
// where the raw error helps debugging. Tests, staging and production use the safety net.
import errorHandler from "./middlewares/errorHandler";

if (process.env.NODE_ENV !== "development") {
	app.setErrorHandler(errorHandler);
}

export default app;
