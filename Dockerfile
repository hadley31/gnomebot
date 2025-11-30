FROM oven/bun:latest

WORKDIR /app

RUN apt update && apt install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev libsodium-dev ffmpeg -y

COPY bun.lock .
COPY package.json .

RUN bun install --frozen-lockfile

COPY src ./src

USER bun

CMD ["bun", "run", "start"]
