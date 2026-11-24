import { STATUS_CODES } from "node:http";
import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";

// Safety net for server errors (5xx): the client never receives the raw message of an
// unexpected error (database host, constraint name, code detail), only a generic one.
// The detail stays in the logs. Other errors (validation, 404...) keep the native Fastify format.
const errorHandler = (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
	const status = error.statusCode ?? 500;

	if (status >= 500) {
		request.log.error(error);
		reply.status(status).send({
			statusCode: status,
			error: STATUS_CODES[status] ?? "Internal Server Error",
			message: "An internal error occurred.",
		});
		return;
	}

	reply.send(error);
};

export default errorHandler;
