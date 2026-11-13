// TanStack Query keys, named like the backend domains ("account" = the logged-in user, GET /api/auth/account).
// Start every key of a domain with its name, e.g. [...queryKeys.tender, "list", filters],
// so that invalidateQueries({ queryKey: queryKeys.tender }) refreshes the whole domain.
export const queryKeys = {
	account: ["account"],
	tender: ["tender"],
	nomenclature: ["nomenclature"],
	user: ["user"],
	assignment: ["assignment"],
	request: ["request"],
	comment: ["comment"],
	notification: ["notification"],
} as const;
