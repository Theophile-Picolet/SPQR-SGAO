// Load the development data (DB_* variables of server/.env): reference lists, the accounts of seeds/users.ts
// and invented tenders. Safe to run again: nothing is duplicated or overwritten.
// The accounts have known passwords, so this script refuses to run outside development.
import argon2 from "argon2";
import { Client } from "pg";
import * as nomenclatures from "../seeds/nomenclatures";
import * as tenders from "../seeds/tenders";
import * as users from "../seeds/users";

const required = ["DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD", "DB_NAME"];

async function hash(password: string): Promise<string> {
	// Argon2id with the OWASP minimum: 19 MiB, 2 passes, 1 lane
	return argon2.hash(password, { type: argon2.argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 });
}

// Create the account if its e-mail is unknown, and return its id. An existing account is left untouched.
async function ensureUser(client: Client, user: users.SeedUser): Promise<number> {
	await client.query(
		`INSERT INTO "user" (email, hashed_password, first_name, last_name, role)
		 VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO NOTHING`,
		[user.email, await hash(user.password), user.firstName, user.lastName, user.role],
	);
	const found = await client.query<{ id: number }>('SELECT id FROM "user" WHERE email = $1', [user.email]);
	const id = found.rows[0]?.id;

	if (id === undefined) {
		throw new Error(`The account ${user.role} could not be created`);
	}

	return id;
}

async function seedLists(client: Client): Promise<void> {
	// Each export of nomenclatures.ts is named after its table
	for (const [table, labels] of Object.entries(nomenclatures)) {
		for (const label of labels) {
			await client.query(`INSERT INTO ${table} (label) VALUES ($1) ON CONFLICT (label) DO NOTHING`, [label]);
		}
	}
}

async function loadTenders(client: Client, ids: Record<string, number>): Promise<number> {
	// Tenders have no natural key: they are only loaded in an empty table
	const existing = await client.query<{ n: number }>("SELECT count(*)::int AS n FROM tender");

	if ((existing.rows[0]?.n ?? 0) > 0) {
		return 0;
	}

	const adminId = ids.admin;

	if (adminId === undefined) {
		throw new Error("The admin account is missing");
	}

	for (const tender of tenders.seedTenders) {
		const quote = tender.quotePrice;
		// RG17: final amount = quoted price minus the discount
		const finalAmount = quote === null ? null : Math.round(quote * (1 - (tender.discount ?? 0) / 100) * 100) / 100;
		// RG16: a won tender always has SPQR as winner
		const winnerName = tender.result === "Remportée" ? "SPQR" : (tender.winnerName ?? null);

		const inserted = await client.query<{ id: number }>(
			`INSERT INTO tender (
				division_id, community_id, subject_id, consultation_id, consultation_detail,
				send_date, return_date, quote_price, result,
				price_position, tech_position, note, win_price, winner_name, discount, final_amount, creator_id
			) VALUES (
				(SELECT id FROM division WHERE label = $1),
				(SELECT id FROM community WHERE label = $2),
				(SELECT id FROM subject WHERE label = $3),
				(SELECT id FROM consultation WHERE label = $4),
				$5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
			) RETURNING id`,
			[
				tender.division,
				tender.community,
				tender.subject,
				tender.consultation,
				tender.consultationDetail ?? null,
				tender.sendDate,
				tender.returnDate ?? null,
				quote,
				tender.result,
				tender.pricePosition ?? null,
				tender.techPosition ?? null,
				tender.note ?? null,
				tender.winPrice ?? null,
				winnerName,
				tender.discount ?? null,
				finalAmount,
				adminId,
			],
		);
		const tenderId = inserted.rows[0]?.id;

		if (tenderId === undefined) {
			throw new Error("Tender insert returned no id");
		}

		// RG3: the creator is assigned automatically
		const assignees = [adminId, ...tender.assignedTo.map((role) => ids[role]).filter((id) => id !== undefined)];

		for (const userId of assignees) {
			await client.query(
				`INSERT INTO assignment (user_id, tender_id, assigned_by) VALUES ($1, $2, $3)
				 ON CONFLICT (user_id, tender_id) DO NOTHING`,
				[userId, tenderId, adminId],
			);
		}
	}

	return tenders.seedTenders.length;
}

async function main(): Promise<void> {
	if (process.env.NODE_ENV !== "development") {
		throw new Error("The seed is for development only (NODE_ENV must be development)");
	}

	const missing = required.filter((name) => !process.env[name]);

	if (missing.length > 0) {
		throw new Error(`Missing environment variables: ${missing.join(", ")}`);
	}

	const client = new Client({
		host: process.env.DB_HOST,
		port: Number(process.env.DB_PORT),
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_NAME,
	});

	await client.connect();

	try {
		await client.query("BEGIN");

		await seedLists(client);

		const ids: Record<string, number> = {};

		for (const user of users.seedUsers) {
			ids[user.role] = await ensureUser(client, user);
		}

		const created = await loadTenders(client, ids);

		await client.query("COMMIT");
		console.info(`Seed done: reference lists, ${users.seedUsers.length} accounts, ${created} tenders created`);
	} catch (error) {
		await client.query("ROLLBACK");
		throw error;
	} finally {
		await client.end();
	}
}

main().catch((error: Error) => {
	console.error("Seed failed:", error.message);
	process.exit(1);
});
