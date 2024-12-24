FROM node:21-alpine3.18

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --silent

COPY . .

EXPOSE 6000

RUN node --max-old-space-size=4096 app.ts
CMD ["npm", "run", "dev"]