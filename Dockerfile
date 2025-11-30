FROM node:25-slim

WORKDIR /app

RUN apt update && apt install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev libsodium-dev ffmpeg -y
RUN corepack enable && corepack prepare yarn@stable --activate

COPY package.json yarn.lock ./
RUN yarn install --pure-lockfile

COPY . .

CMD ["yarn", "run", "start"]
