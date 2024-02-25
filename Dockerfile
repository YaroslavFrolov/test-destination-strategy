FROM node:18-alpine

WORKDIR /app

COPY package*.json yarn.lock ./

RUN yarn install && yarn cache clean --all

COPY . .

CMD ["yarn", "start:prod"]
