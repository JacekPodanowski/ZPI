# Multi-stage build for optimized production deployment
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
# Install dependencies (use npm install since package-lock.json doesn't exist)
RUN npm install
COPY . .
# Build for production with optimizations
RUN npm run build
# Debug: List contents of dist folder
RUN echo "=== Contents of dist folder ===" && ls -la dist/

# Production stage - serve with lightweight static server
FROM node:22-alpine AS production
WORKDIR /app
COPY --from=builder /app/dist ./dist
# Debug: Verify dist contents in production stage
RUN echo "=== Production stage - dist contents ===" && \
    ls -la dist/ && \
    echo "=== Checking for index.html ===" && \
    ls -la dist/index.html || echo "index.html NOT FOUND"
# Install serve - a lightweight static file server
RUN npm install -g serve
EXPOSE 3000
# Serve the static files with SPA routing support
# -s = single page app mode (all routes -> index.html)
# -l = listen on port 3000
# -n = disable auto-port switching
CMD ["sh", "-c", "echo 'Starting serve...' && ls -la dist/ && serve -s dist -l tcp://0.0.0.0:3000 -n"]

# Development stage (default for local dev)
FROM node:22-alpine AS development
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]