FROM node:18 AS build

ENV CI=true

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install

COPY . .
RUN yarn test && yarn run build --prod

FROM nginx:stable

COPY --from=build /app/build /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]