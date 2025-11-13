FROM node:18
WORKDIR /app

# Copy only lock + manifest first for caching
COPY package.json pnpm-lock.yaml ./
RUN npm i -g pnpm && pnpm install

# Copy full source code
COPY . .

FROM node:18
WORKDIR /app

# Copy node_modules and source from previous stage
COPY --from=development-dependencies-env /app/node_modules ./node_modules
COPY --from=development-dependencies-env /app ./

# Run the build
RUN pnpm build

FROM node:18
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm i -g pnpm && pnpm install --prod --frozen-lockfile


FROM node:18
WORKDIR /app

# Copy production node_modules
COPY --from=production-dependencies-env /app/node_modules ./node_modules

# Copy built files from build-env
COPY --from=build-env /app/build ./build

# Copy package.json for runtime context
COPY package.json ./

# Expose default Vite preview port
EXPOSE 3000

# Start command (for Vite preview)
CMD ["pnpm", "preview", "--host"]
