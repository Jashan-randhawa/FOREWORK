FROM node:20-alpine

WORKDIR /app

COPY Backend/package*.json ./Backend/
RUN cd Backend && npm install

COPY Backend ./Backend

COPY start.sh ./start.sh
RUN chmod +x ./start.sh

EXPOSE 5011

CMD ["sh", "start.sh"]
