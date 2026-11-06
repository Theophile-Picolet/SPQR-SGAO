// Stop at startup if a mandatory variable is missing (only names are shown, never values)
const required = [
	"APP_PORT",
	"DB_HOST",
	"DB_PORT",
	"DB_USER",
	"DB_PASSWORD",
	"DB_NAME",
	"ALLOWED_ORIGINS",
	"APP_SECRET",
];

const missing = required.filter((name) => !process.env[name]);

if (missing.length > 0) {
	console.error(`Missing environment variables: ${missing.join(", ")}`);
	process.exit(1);
}

if (!Number.isInteger(Number(process.env.DB_PORT))) {
	console.error("DB_PORT must be a number");
	process.exit(1);
}

const secret = process.env.APP_SECRET;

if (secret === undefined || secret.length < 32) {
	console.error("APP_SECRET must contain at least 32 characters");
	process.exit(1);
}
