# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1.1.33 AS base
RUN mkdir -p /app
WORKDIR /app
COPY . /app
RUN apt-get update
RUN bun install --frozen-lockfile --production
EXPOSE 3000/tcp
ARG NUMBER_POOL
RUN bun run prepareNumberPool -- --numberPool $NUMBER_POOL
CMD bun run start


