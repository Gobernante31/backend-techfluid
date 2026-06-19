FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN corepack enable && pnpm install --frozen-lockfile

FROM deps AS test
COPY . .
RUN pnpm build && pnpm test

FROM node:22-alpine AS runner
WORKDIR /app
COPY package.json ./
COPY src ./src
COPY migrations ./migrations
COPY wrangler.toml ./
RUN corepack enable && pnpm install --prod
EXPOSE 8787
CMD ["pnpm", "exec", "wrangler", "dev", "src/index.ts", "--local", "--host", "0.0.0.0"]
