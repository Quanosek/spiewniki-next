# Stage 1: Build the application
FROM node:22-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy dependency files
COPY package.json pnpm-lock.yaml ./

# Install PNPM and dependencies
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile

# Copy the rest of the project files
COPY . .

# Build the Next.js application
RUN pnpm build

# Stage 2: Final production image
FROM node:22-alpine

# Set the working directory
WORKDIR /app

# Install PNPM in the final image (for running the application)
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy required files from the build stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Expose the application port
EXPOSE 3000

# Run the application in production mode
CMD ["pnpm", "start"]
