# The build context is the app/ folder: the lockfile is shared by all the workspaces.
#   docker build -f client/Dockerfile --target dev .
FROM node:26-alpine AS base
WORKDIR /app
# Manifests first, so the dependency layer stays cached until a package.json changes.
# The server manifest is needed too: npm checks the lockfile against every workspace.
COPY package.json package-lock.json ./
COPY client/package.json client/
COPY server/package.json server/
COPY database/package.json database/

# Development (used by docker-compose.yml): client/src is bind-mounted for hot reload.
# API_URL is read when `next dev` starts, so docker-compose.yml passes it as an environment variable.
FROM base AS dev
ENV NODE_ENV=development
RUN --mount=type=cache,target=/root/.npm npm ci --workspace client
COPY --chown=node:node client client
# Next.js writes .next and next-env.d.ts in this folder
RUN chown node:node /app/client
USER node
WORKDIR /app/client
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Static export: the site is written in /app/client/out (Nginx serves it from epic L).
# API_URL is copied into the browser code at build time, so it is a build argument.
FROM base AS build
ARG API_URL
ENV API_URL=$API_URL
RUN --mount=type=cache,target=/root/.npm npm ci --workspace client
COPY client client
RUN npm run build --workspace client
