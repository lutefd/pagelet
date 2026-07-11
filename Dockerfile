FROM node:22-alpine AS build

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM node:22-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --prod

COPY --from=build /app/build ./build
COPY --from=build /app/content ./content

RUN mkdir -p /app/data && chown -R node:node /app

USER node

EXPOSE 3000
CMD ["node", "build"]
