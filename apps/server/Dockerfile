FROM node:20-alpine AS alpine
RUN apk update
RUN apk add --no-cache libc6-compat
 
FROM alpine  AS base
RUN npm install pnpm turbo --global
RUN pnpm config set store-dir ~/.pnpm-store

# Prune projects
FROM base AS pruner

WORKDIR /app
COPY . .
RUN turbo prune --scope=server --docker


# Build the project
FROM base AS builder

WORKDIR /app

# Copy lockfile and package.json's of isolated subworkspace
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=pruner /app/out/json/ .

# First install the dependencies (as they change less often)
RUN --mount=type=cache,id=s/ca0f5667-1224-4b53-82ac-563a04225cf6-/root/.gradle,target=~/.pnpm-store pnpm install --frozen-lockfile

# Copy source code of isolated subworkspace
COPY --from=pruner /app/out/full/ .

RUN turbo build --filter=server
RUN --mount=type=cache,id=s/ca0f5667-1224-4b53-82ac-563a04225cf6-/root/.gradle,target=~/.pnpm-store pnpm prune --prod --no-optional

WORKDIR /app/apps/server

ARG PORT=9000
ENV PORT=${PORT}

ARG COOKIE_SECRET
ENV COOKIE_SECRET=${COOKIE_SECRET}

ARG DATABASE_TYPE
ENV DATABASE_TYPE=${DATABASE_TYPE}

ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

ARG JWT_SECRET
ENV JWT_SECRET=${JWT_SECRET}

ARG PGDATABASE
ENV PGDATABASE=${PGDATABASE}

ARG PGHOST
ENV PGHOST=${PGHOST}

ARG PGPASSWORD
ENV PGPASSWORD=${PGPASSWORD}

ARG PGPORT
ENV PGPORT=${PGPORT}

ARG PGUSER
ENV PGUSER=${PGUSER}

ARG REDISHOST
ENV REDISHOST=${REDISHOST}

ARG REDISPASSWORD
ENV REDISPASSWORD=${REDISPASSWORD}

ARG REDISPORT
ENV REDISPORT=${REDISPORT}

ARG REDISUSER
ENV REDISUSER=${REDISUSER}

ARG REDIS_URL
ENV REDIS_URL=${REDIS_URL}

EXPOSE ${PORT}

ENTRYPOINT ["pnpm", "run", "batata"]






