# The build context is the app/ folder: the lockfile is shared by all the workspaces.
#   docker build -f server/Dockerfile --target dev .
FROM node:26-alpine AS base
WORKDIR /app
# Manifests first, so the dependency layer stays cached until a package.json changes.
# The client manifest is needed too: npm checks the lockfile against every workspace.
COPY package.json package-lock.json ./
COPY client/package.json client/
COPY server/package.json server/
COPY database/package.json database/

# Development (used by docker-compose.yml): all dependencies; server/src is bind-mounted for hot reload
FROM base AS dev
ENV NODE_ENV=development
RUN --mount=type=cache,target=/root/.npm npm ci --workspace server
COPY --chown=node:node server server
USER node
WORKDIR /app/server
EXPOSE 3001
CMD ["npm", "run", "dev"]

# Compilation of the TypeScript sources into server/dist
FROM base AS build
RUN --mount=type=cache,target=/root/.npm npm ci --workspace server
COPY server server
RUN npm run build --workspace server

# Runtime image (used from epic L): production dependencies and compiled code only, no root user
FROM base AS runtime
ENV NODE_ENV=production
RUN --mount=type=cache,target=/root/.npm npm ci --workspace server --omit=dev
COPY --from=build /app/server/dist server/dist
USER node
WORKDIR /app/server
EXPOSE 3001
CMD ["node", "dist/main.js"]
