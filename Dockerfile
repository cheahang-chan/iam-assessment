FROM node:22-alpine

WORKDIR /app

# Install dependencies first — only if package files change
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

EXPOSE 3000
CMD ["yarn", "start"]