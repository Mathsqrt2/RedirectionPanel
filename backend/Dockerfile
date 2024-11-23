FROM node:18-alpine

WORKDIR /app/backend

COPY ./backend/package*.json ./

RUN npm install

COPY ./backend ./

COPY ./backend/wait-for-it.sh /wait-for-it.sh

RUN apk add --no-cache bash

RUN chmod +x /wait-for-it.sh

CMD ["/bin/bash", "/wait-for-it.sh", "mysql:3306", "--", "npm", "run", "start"]
