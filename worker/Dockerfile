FROM node:22-alpine

RUN apk add --no-cache vips-dev fftools

WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev

COPY index.ts ./
COPY tsconfig.json ./

RUN npm install -D typescript tsx && npx tsc

CMD ["node", "dist/index.js"]
