# syntax=docker/dockerfile:1
FROM node:20-alpine AS build
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY index.html vite.config.js vitest.config.js tsconfig.json ./
COPY public/ public/
COPY src/ src/
COPY server.js ./
# Vite inlines VITE_* at build time: this is the API base URL baked into the bundle.
ARG VITE_API_URL=http://localhost:9000/api/v1
ENV VITE_API_URL=$VITE_API_URL
RUN pnpm build

FROM node:20-alpine AS runtime
RUN corepack enable
WORKDIR /app
ENV NODE_ENV=production
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile
COPY --from=build /app/server.js ./
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["node", "server.js"]