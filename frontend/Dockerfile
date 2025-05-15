# Базовый образ Node.js
FROM node:18

# Устанавливаем рабочую директорию внутри контейнера
WORKDIR /app

# Копируем package.json и package-lock.json / pnpm-lock.yaml / yarn.lock
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install --legacy-peer-deps

# Копируем все остальные файлы фронтенда
COPY . .

# Открываем порт, который использует Vite
EXPOSE 5173

# Запускаем Vite dev-сервер
CMD ["npm", "run", "dev", "--", "--host"]
