# Stage 1: Install dependencies
FROM node:20-alpine AS dependencies
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files for caching
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (including dev dependencies for build)
RUN pnpm install --frozen-lockfile

# Stage 2: Build the application
FROM node:20-alpine AS build
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy dependencies from previous stage
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/package.json ./package.json

# Copy source code
COPY . .

# Build the application
RUN pnpm build

# Stage 3: Production dependencies
FROM node:20-alpine AS production-dependencies
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Stage 4: Production image
FROM node:20-alpine
WORKDIR /app

# Install pnpm (needed for the start command)
RUN npm install -g pnpm

# Copy production dependencies
COPY --from=production-dependencies /app/node_modules ./node_modules

# Copy built application
COPY --from=build /app/build ./build

# Copy package.json for runtime
COPY package.json ./

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose the port the app runs on
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application using react-router-serve
CMD ["pnpm", "start"]
