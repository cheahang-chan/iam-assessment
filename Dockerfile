# Stage 1 - Build
FROM node:22-alpine AS builder

# Install AWS CLI and jq
# There was a breaking change in the base image used that prevents us from installing via pip
# Instead of activating a virtual env, this is a simpler workaround
# https://github.com/python/cpython/issues/102134
RUN apk add --no-cache jq aws-cli
RUN aws configure set default.region ap-southeast-1

WORKDIR /app

# Install dependencies first — only if package files change
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

# Stage 2 - Runtime
FROM node:22-alpine AS production

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production

# Copy built output and required files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /usr/local/bin/docker-entrypoint.sh /usr/local/bin/

RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENV NODE_ENV=production

EXPOSE 8080
CMD ["yarn", "start"]