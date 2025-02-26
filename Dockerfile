FROM oven/bun:1-slim AS dependencies-env
WORKDIR /usr/src/app
COPY . /usr/src/app

FROM dependencies-env AS development-dependencies-env
COPY ./package.json bun.lockb /usr/src/app/
RUN bun install --frozen-lockfile

FROM dependencies-env AS production-dependencies-env
COPY ./package.json bun.lockb /usr/src/app/
RUN bun install --production

FROM dependencies-env AS build-env
COPY ./package.json bun.lockb /usr/src/app/
COPY --from=development-dependencies-env /usr/src/app/node_modules /usr/src/app/node_modules
RUN bun run build

FROM dependencies-env
ENV PORT=3000
ENV HOST=0.0.0.0
ENV NODE_ENV=production

COPY ./package.json bun.lockb /usr/src/app/
COPY --from=production-dependencies-env /usr/src/app/node_modules /usr/src/app/node_modules
COPY --from=build-env /usr/src/app/build /usr/src/app/build

USER bun
EXPOSE 3000/tcp
ENTRYPOINT bun run db:migrate && bun run start