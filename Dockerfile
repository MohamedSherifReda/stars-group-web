FROM node:20-alpine AS development-dependencies-env
WORKDIR /app

# Copy only lock + manifest first for caching
COPY package.json pnpm-lock.yaml ./
RUN npm i -g pnpm && pnpm install

# Copy full source code
COPY . .

FROM node:20-alpine AS build-env
WORKDIR /app

# Copy node_modules and source from previous stage
COPY --from=development-dependencies-env /app/node_modules ./node_modules
COPY --from=development-dependencies-env /app ./

# Run the build
RUN pnpm build

FROM node:20-alpine AS production-dependencies-env
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm i -g pnpm && pnpm install --prod --frozen-lockfile


FROM node:20-alpine
WORKDIR /app

# Copy production node_modules
COPY --from=production-dependencies-env /app/node_modules ./node_modules

# Copy built files from build-env
COPY --from=build-env /app/dist ./dist

# Copy package.json for runtime context
COPY package.json ./

# Expose default Vite preview port
EXPOSE 4173

# Start command (for Vite preview)
CMD ["pnpm", "preview", "--host"]
