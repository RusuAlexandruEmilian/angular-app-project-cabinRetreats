# Stage1: Build the angular app
FROM node:alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build --configuration=production

# Stage2: Serve angular app with nginx
FROM nginx:alpine

COPY --from=build /app/dist/cabinRetreats-angular-client /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]


