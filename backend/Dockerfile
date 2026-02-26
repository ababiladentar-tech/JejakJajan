# Backend Dockerfile
FROM node:18-slim

# install necessary native dependencies for Prisma
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      openssl \
      build-essential \
      ca-certificates && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package.json ./
COPY prisma ./prisma

# Install dependencies
RUN npm install

# Generate Prisma client so runtime has necessary engine files
RUN npx prisma generate

# Copy application code
COPY src ./src

# Expose port
EXPOSE 5000

# Run migrations and start server (client already generated during build)
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
