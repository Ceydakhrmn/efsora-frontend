FROM node:22-slim
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps
COPY frontend/ .
ENV VITE_API_URL=https://envanter-yonetimi-backend.onrender.com
RUN npm run build
RUN npm install -g serve
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
