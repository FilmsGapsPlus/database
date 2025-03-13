FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ENV PORT=3000 DATA_PATH=/data
VOLUME /data
EXPOSE 3000
CMD ["node", "server.js"]
