FROM node:22.0.0

WORKDIR /drip-ecommerce

COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm install

COPY . .

EXPOSE 4000

CMD [ "node", "app.js" ]