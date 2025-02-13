# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1.2 AS base
RUN mkdir -p /app
WORKDIR /app
COPY . /app
RUN apt-get update
RUN bun install --frozen-lockfile --production
EXPOSE 3000/tcp
# ARG NUMBER_POOL
CMD bun install --frozen-lockfile --production && bun run prepareNumberPool -- --numberPool $NUMBER_POOL && bun run start


