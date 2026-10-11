# Builds the frontend and serves it with nginx.
# Not needed when Aspire publishes the app (PublishAsStaticWebsite serves it through YARP).
#
#   docker build -f docker/Dockerfile -t my-frontend .
#   docker run -p 8080:8080 -e API_UPSTREAM=http://api:8080 my-frontend

FROM node:24-alpine AS build
WORKDIR /app
ENV HUSKY=0
COPY package.json package-lock.json .npmrc ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:stable-alpine AS runtime
# Requests to /api are proxied to API_UPSTREAM (see nginx.conf.template).
ENV API_UPSTREAM=http://api:8080 \
    NGINX_ENTRYPOINT_LOCAL_RESOLVERS=1
COPY docker/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
