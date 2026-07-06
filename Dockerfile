# Stage 1: Build Frontend React App
FROM node:22-alpine AS build-frontend
WORKDIR /app/webapp
COPY webapp/package*.json ./
RUN npm install
COPY webapp/ .
RUN npm run build

# Stage 2: Build Backend Express Server
FROM node:22-alpine AS build-backend
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server/ .
RUN npm run build

# Stage 3: Production Runtime Environment
FROM node:22-alpine
WORKDIR /app

# Copy compiled server code and node dependencies
COPY --from=build-backend /app/server/dist ./server/dist
COPY --from=build-backend /app/server/package*.json ./server/
COPY --from=build-backend /app/server/node_modules ./server/node_modules

# Copy compiled static frontend output
COPY --from=build-frontend /app/webapp/dist ./webapp/dist

# Create storage directory for SQLite database mount
RUN mkdir -p /data

EXPOSE 8080
ENV PORT=8080
ENV NODE_ENV=production

# Run database configuration seeding and start server
CMD ["node", "server/dist/index.js"]
