FROM node:slim
LABEL org.opencontainers.image.source=https://github.com/e-libro/e-libro-api

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8081

CMD ["node", "index.js"]

