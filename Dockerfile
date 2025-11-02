# Stage 1: Base image with Bun and necessary tools
FROM oven/bun:1.2.19-alpine AS base

WORKDIR /app

RUN apk add --no-cache \
    openssl \
    postgresql-client \
    curl \
    nodejs

# Stage 2: Install dependencies
FROM base AS dependencies

WORKDIR /app

COPY package.json bun.lock ./

# Copy package.json files for workspace packages 
COPY packages/core/package.json ./packages/core/
COPY packages/view/package.json ./packages/view/
COPY www/package.json ./www/

# Install all dependencies 
RUN bun install --frozen-lockfile

# Stage 3: Build the view package
FROM dependencies AS build-view

WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules
COPY packages/view ./packages/view

RUN bun run --cwd packages/view build

# Stage 4: Build the core package
FROM build-view AS build-core

WORKDIR /app

COPY scripts ./scripts

COPY --from=build-view /app/node_modules ./node_modules
COPY packages/core ./packages/core

RUN bun run --cwd packages/core build && bun run scripts/post-build.ts

# Stage 5: Production image
FROM oven/bun:1.2.19-alpine AS production

WORKDIR /app

# Install only essential runtime dependencies
RUN apk add --no-cache openssl

COPY package.json ./
COPY packages/core/package.json ./packages/core/
COPY www/package.json ./www/

# Install only production dependencies
RUN bun install --production --frozen-lockfile

# Copy built artifacts from core package
COPY --from=build-core /app/packages/core/dist ./packages/core/dist
COPY --from=build-core /app/packages/core/view-build ./packages/core/view-build

# Make the main entry point executable
RUN chmod +x ./packages/core/dist/index.js

# Create global symlink for core package
RUN ln -s /app/packages/core/dist/index.js /usr/local/bin/hviz

# Clean up build cache and temporary files
RUN rm -rf /tmp/* /root/.bun/install/cache

# Set environment variable for production
ENV NODE_ENV=production \
    PORT=3333

# Expose necessary ports
EXPOSE 3333

ENTRYPOINT ["hviz"]
CMD [ "--help" ]