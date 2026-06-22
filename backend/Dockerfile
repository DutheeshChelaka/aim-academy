FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache ffmpeg
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
EXPOSE 4040
CMD ["npm", "run", "start:dev"]
