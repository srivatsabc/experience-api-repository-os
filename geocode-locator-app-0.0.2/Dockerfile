FROM node:8.11.1
WORKDIR /app
COPY . /app/
RUN npm cache clean --force && npm install
CMD node --max-old-space-size=1024 app.js
EXPOSE 8074

# This is the default user for running docker container in OpenShift
USER 1001
