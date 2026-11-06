// Check the environment, then try the database connection
import "./config/checkEnv";
import "./config/checkConnection";

// Import the Fastify application from ./app
import app from "./app";

// Get the port from the environment variables
const port = Number(process.env.APP_PORT);

// Start the server and listen on the specified port
// (0.0.0.0 is required to be reachable from outside a Docker container)
app
	.listen({ port, host: "0.0.0.0" })
	.then(() => {
		console.info(`Server is listening on port ${port}`);
	})
	.catch((err: Error) => {
		console.error("Error:", err.message);
		process.exit(1);
	});
