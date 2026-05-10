FROM node:24-alpine

WORKDIR /app

ENV HUSKY=0
ENV CI=true

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN corepack enable && corepack prepare pnpm@latest --activate

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
