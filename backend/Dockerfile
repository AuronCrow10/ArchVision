FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

# ---- Runtime ----
FROM node:20-alpine

RUN apk add --no-cache dumb-init

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app .

RUN mkdir -p /app/uploads && chown -R node:node /app

USER node

EXPOSE 4000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/index.js"]
