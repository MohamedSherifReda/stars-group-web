# Legacy entry point: identical to Dockerfile.pnpm (pnpm only, frozen lockfile, overrides in
# pnpm-workspace.yaml). Prefer `docker compose build`, which uses Dockerfile.pnpm.
FROM node:20-alpine AS deps
WORKDIR /app
RUN npm i -g pnpm@10
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY . .
ARG VITE_BASE_URL
ARG VITE_TINY_API_KEY
ENV VITE_BASE_URL=$VITE_BASE_URL \
    VITE_TINY_API_KEY=$VITE_TINY_API_KEY
RUN pnpm build

FROM node:20-alpine AS prod
WORKDIR /app
RUN npm i -g pnpm@10
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --prod --frozen-lockfile
COPY --from=build /app/build /app/build
EXPOSE 5000
CMD ["pnpm", "start"]
