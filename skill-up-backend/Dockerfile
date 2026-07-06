# Stage 1: Build the TypeScript code
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files and install all dependencies (including devDependencies for TS build)
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the TypeScript project to /app/dist
RUN npm run build

# Stage 2: Production environment
FROM node:22-alpine

WORKDIR /app

# Accept COOKIE_DOMAIN as a build argument
ARG COOKIE_DOMAIN
ENV COOKIE_DOMAIN=$COOKIE_DOMAIN

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy compiled files from builder stage
COPY --from=builder /app/dist ./dist

# Expose backend port
EXPOSE 4000

# Start the application
CMD ["npm", "run", "start"]
