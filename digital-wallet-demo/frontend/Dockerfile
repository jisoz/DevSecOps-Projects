FROM node:lts-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build



FROM nginxinc/nginx-unprivileged:alpine

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 8080
# FROM nginx:alpine
#testpipline
# COPY --from=build /app/build /usr/share/nginx/html



# COPY  nginx.conf /etc/nginx/nginx.conf

# EXPOSE 8080
# USER nginx 

CMD ["nginx", "-g", "daemon off;"]

