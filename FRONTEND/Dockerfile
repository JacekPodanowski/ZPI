# Multi-stage build for optimized production deployment
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
# Install dependencies (use npm install since package-lock.json doesn't exist)
RUN npm install
COPY . .
# Build for production with optimizations
RUN npm run build

# Production stage - serve with lightweight server
FROM node:22-alpine AS production
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
# Install only production dependencies for preview server
RUN npm install --only=production
EXPOSE 3000
# Use preview mode for optimized production serving
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3000"]

# Development stage (default for local dev)
FROM node:22-alpine AS development
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]