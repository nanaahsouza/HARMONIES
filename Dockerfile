FROM node:24-bookworm-slim AS build
WORKDIR /app
RUN npm install --global pnpm@11.25.0
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm test && pnpm build

FROM node:24-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production PORT=3001 DATABASE_PATH=/var/data/harmonies.sqlite
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/src/engine ./src/engine
COPY --from=build /app/src/server ./src/server
COPY --from=build /app/src/shared ./src/shared
EXPOSE 3001
CMD ["node", "src/server/main.ts"]
EXPOSE 3001
CMD ["node", "src/server/main.ts"]
