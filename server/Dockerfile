FROM node:21-alpine3.18

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --silent

COPY . .

EXPOSE 6000

CMD ["npm", "run", "dev"]