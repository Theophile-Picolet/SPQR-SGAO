// Create the tables and indexes of schema.sql in the database (DB_* variables of server/.env).
// Every statement uses IF NOT EXISTS, so running it again changes nothing and never drops data.
import { readFile } from "node:fs/promises";
import path from "node:path";
import { Client } from "pg";

const required = ["DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD", "DB_NAME"];

async function main(): Promise<void> {
	const missing = required.filter((name) => !process.env[name]);

	if (missing.length > 0) {
		throw new Error(`Missing environment variables: ${missing.join(", ")}`);
	}

	const sql = await readFile(path.resolve(__dirname, "../schema.sql"), "utf8");

	const client = new Client({
		host: process.env.DB_HOST,
		port: Number(process.env.DB_PORT),
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_NAME,
	});

	await client.connect();

	try {
		// One query string with several statements: PostgreSQL runs it as a single transaction
		await client.query(sql);
		console.info("Schema applied");
	} finally {
		await client.end();
	}
}

main().catch((error: Error) => {
	console.error("Schema failed:", error.message);
	process.exit(1);
});
