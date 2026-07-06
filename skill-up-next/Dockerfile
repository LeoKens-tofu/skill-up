# Stage 1: Install dependencies and build the app
FROM node:22-alpine AS builder

WORKDIR /app

# Accept NEXT_PUBLIC_API_URL as a build argument
ARG NEXT_PUBLIC_API_URL

# Make it available to the Next.js build process
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy all source files
COPY . .

# Build the Next.js application
# During this step, Next.js will bake NEXT_PUBLIC_API_URL into the client-side bundle
RUN npm run build

# Stage 2: Production image
FROM node:22-alpine

WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Copy necessary files from the builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

# Expose the default Next.js port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start"]
