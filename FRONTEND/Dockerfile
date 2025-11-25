# Multi-stage build for optimized production deployment
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
# Install dependencies (use npm install since package-lock.json doesn't exist)
RUN npm install
# Copy all source files including .env.production
COPY . .
# Build for production with optimizations (Vite will automatically use .env.production)
RUN npm run build
# Debug: List contents of dist folder
RUN echo "=== Contents of dist folder ===" && \
    ls -laR dist/ && \
    echo "=== Total files in dist ===" && \
    find dist -type f | wc -l

# Production stage - serve with lightweight static server
FROM node:22-alpine AS production
WORKDIR /app
# Copy dist from builder
COPY --from=builder /app/dist /app/dist
# Debug: Verify dist contents in production stage BEFORE anything else
RUN echo "=== Production stage - after COPY ===" && \
    pwd && \
    ls -la && \
    ls -la /app/ && \
    echo "=== Checking dist folder ===" && \
    ls -la /app/dist/ || echo "DIST FOLDER MISSING!" && \
    echo "=== Checking for index.html ===" && \
    ls -la /app/dist/index.html || echo "index.html NOT FOUND"
# Install serve - a lightweight static file server
RUN npm install -g serve
EXPOSE 3000
# Serve the static files with SPA routing support
CMD ["sh", "-c", "echo 'Starting serve from:' && pwd && ls -la && ls -la dist/ && serve -s dist -l tcp://0.0.0.0:3000 -n"]

# Development stage (default for local dev)
FROM node:22-alpine AS development
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]