# syntax=docker/dockerfile:1
FROM node:20-alpine AS build
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY public/ public/
COPY src/ src/
COPY server.js ./
# CRA inlines REACT_APP_* at build time: this is the API base URL baked into the bundle.
ARG REACT_APP_REST_DEV_URL=http://localhost:9000/api/v1
ENV REACT_APP_REST_DEV_URL=$REACT_APP_REST_DEV_URL
RUN pnpm build

FROM node:20-alpine AS runtime
RUN corepack enable
WORKDIR /app
ENV NODE_ENV=production
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile
COPY --from=build /app/server.js ./
COPY --from=build /app/build ./build
EXPOSE 3000
CMD ["node", "server.js"]