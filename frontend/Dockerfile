#build

FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

RUN npm run build

#server static

FROM alpine:3.19

WORKDIR /dist
COPY --from=build /app/dist ./