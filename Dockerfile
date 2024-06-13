# Imagen base de Node.js
FROM node:lts-alpine

# Establecer el directorio de trabajo
WORKDIR /src/app/nestjs

# Copiar los archivos package.json y package-lock.json
COPY package*.json ./

# Instalar las dependencias
RUN npm install

# Copiar el resto de los archivos del proyecto
COPY . .

# Comando para iniciar la aplicación en modo desarrollo
CMD ["npm", "run", "start:dev"]
