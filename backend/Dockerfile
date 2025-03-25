# Используем официальный образ Node.js
FROM node:18

# Устанавливаем рабочую директорию внутри контейнера
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем весь проект в контейнер
COPY src src
COPY nodemon.json nodemon.json
COPY tsconfig.json tsconfig.json

# Открываем порт для сервера
EXPOSE 5000

# Запускаем сервер
CMD ["npm", "run", "dev"]
