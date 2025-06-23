FROM node:22-alpine

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

ENV NODE_ENV=production

# Copy in your entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 8080
CMD ["yarn", "start"]