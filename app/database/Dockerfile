# The build context is the app/ folder: the lockfile is shared by all the workspaces.
#   docker build -f database/Dockerfile .
FROM node:26-alpine AS base
WORKDIR /app
# Manifests first, so the dependency layer stays cached until a package.json changes.
# The other manifests are needed too: npm checks the lockfile against every workspace.
COPY package.json package-lock.json ./
COPY client/package.json client/
COPY server/package.json server/
COPY database/package.json database/

# Used by docker-compose.yml: writes schema.sql in the database, then exits.
# The database settings (DB_*) come from the environment of the container.
FROM base AS schema
RUN --mount=type=cache,target=/root/.npm npm ci --workspace database
COPY --chown=node:node database database
USER node
WORKDIR /app/database
CMD ["npm", "run", "schema"]
