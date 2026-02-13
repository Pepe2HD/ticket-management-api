FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install

COPY . .

ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0

EXPOSE 19000 19001 19002 19006

# Expo dev server com suporte a mobile e web
CMD ["npm", "run", "start", "--", "--lan"]
