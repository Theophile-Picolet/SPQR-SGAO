// Accounts for development only, with known passwords so every role can be tried in the application.
// seed.ts loads them only when NODE_ENV=development: they must never exist in production,
// where the admin account comes from ADMIN_EMAIL and ADMIN_PASSWORD instead.

export type SeedUser = {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	role: "admin" | "manager" | "consultant";
};

export const seedUsers: SeedUser[] = [
	{ email: "admin@sgao.test", password: "admin", firstName: "admin", lastName: "SGAO1", role: "admin" },
	{ email: "manager@sgao.test", password: "manager", firstName: "manager", lastName: "SGAO2", role: "manager" },
	{ email: "consultant@sgao.test", password: "consultant", firstName: "consultant", lastName: "SGAO3", role: "consultant" },
];
