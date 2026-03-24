# PocketBase Dockerfile for Morphic project
# This Dockerfile provides a custom PocketBase setup with migrations support

FROM alpine:3.19 AS builder

RUN apk add --no-cache wget unzip

ARG POCKETBASE_VERSION=0.26.6

WORKDIR /tmp/pocketbase

RUN wget -q "https://github.com/pocketbase/pocketbase/releases/download/v${POCKETBASE_VERSION}/pocketbase_${POCKETBASE_VERSION}_linux_amd64.zip" && \
    unzip pocketbase_${POCKETBASE_VERSION}_linux_amd64.zip && \
    chmod +x pocketbase && \
    mv pocketbase /usr/local/bin/pocketbase

FROM alpine:3.19

RUN apk add --no-cache bash ca-certificates wget unzip

ARG POCKETBASE_VERSION=0.26.6

RUN wget -q "https://github.com/pocketbase/pocketbase/releases/download/v${POCKETBASE_VERSION}/pocketbase_${POCKETBASE_VERSION}_linux_amd64.zip" && \
    unzip pocketbase_${POCKETBASE_VERSION}_linux_amd64.zip && \
    chmod +x pocketbase && \
    mv pocketbase /usr/local/bin/pocketbase

WORKDIR /pb_data

RUN mkdir -p /pb_data /pb_hooks

EXPOSE 8090

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8090/api/health || exit 1

ENV POCKETBASE_URL=http://localhost:8090

ENTRYPOINT ["pocketbase", "serve", "--http=0.0.0.0:8090", "--dir=/pb_data", "--hooksDir=/pb_hooks"]