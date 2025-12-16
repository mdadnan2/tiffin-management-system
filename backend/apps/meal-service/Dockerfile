FROM node:18-alpine AS builder

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
COPY tsconfig.json ./
COPY nest-cli.json ./
COPY prisma ./prisma/

RUN npm ci
RUN npx prisma generate

COPY apps/meal-service ./apps/meal-service
COPY libs ./libs

RUN npm run build:meal

FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --only=production
RUN npx prisma generate

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3003

CMD ["node", "dist/apps/meal-service/main"]
