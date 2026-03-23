# PocketBase Dockerfile for Morphic project
# This Dockerfile provides a custom PocketBase setup with migrations support

FROM alpine:3.19 AS builder

RUN apk add --no-cache wget unzip

ARG POCKETBASE_VERSION=0.26.8

WORKDIR /tmp/pocketbase

RUN wget -q "https://github.com/pocketbase/pocketbase/releases/download/v${POCKETBASE_VERSION}/pocketbase_${POCKETBASE_VERSION}_linux_amd64.zip" && \
    unzip pocketbase_${POCKETBASE_VERSION}_linux_amd64.zip && \
    chmod +x pocketbase && \
    mv pocketbase /usr/local/bin/pocketbase

FROM alpine:3.19

RUN apk add --no-cache bash ca-certificates

WORKDIR /pb_data

COPY --from=builder /usr/local/bin/pocketbase /usr/local/bin/pocketbase

RUN mkdir -p /pb_data /pb_hooks /pb_migrations

COPY pocketbase/migrations /pb_migrations
COPY pocketbase-hooks /pb_hooks

RUN if [ -d "/pb_migrations" ] && [ "$(ls -A /pb_migrations 2>/dev/null)" ]; then \
        pocketbase migrate --dir /pb_migrations; \
    fi

EXPOSE 8090

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8090/api/health || exit 1

ENV POCKETBASE_URL=http://localhost:8090

ENTRYPOINT ["pocketbase", "serve", "--http=0.0.0.0:8090", "--dir=/pb_data", "--hooksDir=/pb_hooks"]