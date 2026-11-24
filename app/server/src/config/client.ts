// Import pg for PostgreSQL
import { Pool } from "pg";
import type { Pool as PgPool, QueryResult, QueryResultRow } from "pg";

// Create the PostgreSQL pool from the environment variables (shared by all repositories)
const client = new Pool({
	host: process.env.DB_HOST,
	port: Number(process.env.DB_PORT),
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	ssl: false,
});

// An idle client can fail (network, database restart): log it instead of crashing the process
client.on("error", (error: Error) => {
	console.error("Unexpected PostgreSQL pool error:", error.message);
});

export default client;

// Types shared by the repositories: import them from here with the client.
// Result and Rows accept the shape of a row, e.g. Result<TenderRow>
type Pg = PgPool;
type Result<T extends QueryResultRow = QueryResultRow> = QueryResult<T>;
type Rows<T extends QueryResultRow = QueryResultRow> = T[];

export type { Pg, Result, Rows };
