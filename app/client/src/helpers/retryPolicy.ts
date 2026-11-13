import { isAxiosError } from "axios";

// Called after each failed request: true = try again after a delay, false = show the error.
// failureCount is 0 for the first retry. By default TanStack Query tries again 3 times for any error.
// 401 (not logged in) and 403 (forbidden) are answers of the API, not breakdowns: trying again would not change them.
export function retryPolicy(failureCount: number, error: Error): boolean {
	if (isAxiosError(error) && error.response) {
		const status = error.response.status;
		if (status === 401 || status === 403) {
			return false;
		}
	}
	return failureCount < 3;
}
