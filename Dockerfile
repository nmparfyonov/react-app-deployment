FROM nginx:stable

COPY build /usr/share/nginx/html/app

CMD ["nginx", "-g", "daemon off;"]