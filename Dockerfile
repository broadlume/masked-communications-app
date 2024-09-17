# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:latest AS base

RUN mkdir -p /app
WORKDIR /app
COPY . /app
RUN apt-get update
RUN bun install
EXPOSE 3000/tcp
ARG NUMBER_POOL=development
RUN bun run prepareNumberPool -- --numberPool $NUMBER_POOL
CMD bun run start


