FROM node:18-alpine

RUN apk add --no-cache sqlite

WORKDIR /backend/

COPY package.json ./
RUN npm install
COPY /src ./src
COPY tsconfig.json ./tsconfig.json
COPY ./init.sql ./
COPY init-db.sh ./
COPY /videos /resources/videos
EXPOSE 3000
# CMD tail -f /dev/null
CMD ["sh", "-c", "./init-db.sh && npx ts-node src/index.ts"]
