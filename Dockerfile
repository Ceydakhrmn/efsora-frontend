FROM node:20-slim
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
ENV VITE_API_URL=https://envanter-yonetimi-backend.onrender.com
ENV NODE_OPTIONS=--max-old-space-size=4096
RUN npm run build
RUN npm install -g serve
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
