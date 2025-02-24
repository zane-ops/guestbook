FROM oven/bun:1-slim AS dependencies-env
COPY . /app

FROM dependencies-env AS development-dependencies-env
COPY ./package.json bun.lockb /app/
WORKDIR /app
RUN bun install --frozen-lockfile

FROM dependencies-env AS production-dependencies-env
COPY ./package.json bun.lockb /app/
WORKDIR /app
RUN bun install --production

FROM dependencies-env AS build-env
COPY ./package.json bun.lockb /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
RUN bun run build

FROM dependencies-env
ENV PORT=3000
ENV HOST=0.0.0.0
ENV NODE_ENV=production

COPY ./package.json bun.lockb /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
WORKDIR /app
CMD ["bun", "run", "start"]