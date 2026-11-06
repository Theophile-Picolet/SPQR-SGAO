import client from "./client";

// Try to get a connection to the database
client
	.connect()
	.then((connection) => {
		console.info("Database connection established");
		connection.release();
	})
	.catch((error: Error) => {
		console.warn(
			"Warning:",
			"Failed to establish a database connection.",
			"Please check the DB_* variables in the .env file if you need a database access.",
		);
		console.warn(error.message);
	});
