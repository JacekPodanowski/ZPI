# Multi-stage build for optimized production deployment
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
# Install dependencies (use npm install since package-lock.json doesn't exist)
RUN npm install
COPY . .
# Build for production with optimizations
RUN npm run build

# Production stage - serve with lightweight static server
FROM node:22-alpine AS production
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/serve.json ./serve.json
# Install serve - a lightweight static file server
RUN npm install -g serve
EXPOSE 3000
# Serve the static files with proper SPA routing support and config
CMD ["serve", "dist", "-l", "3000", "-c", "serve.json"]

# Development stage (default for local dev)
FROM node:22-alpine AS development
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]