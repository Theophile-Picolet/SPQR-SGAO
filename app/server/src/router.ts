import type { FastifyInstance } from "fastify";

/* ************************************************************************* */

// Define the API routes here, with their schema and middlewares, one block per resource (from epic E).
// Example:
//   app.get("/api/references", { preHandler: [auth.verify] }, tenderController.browse);
//   app.post("/api/references", { schema: tenderSchema.create, preHandler: [auth.verify] }, tenderController.add);

async function router(_app: FastifyInstance) {}

/* ************************************************************************* */

export default router;
