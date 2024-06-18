# Imagen base de Node.js
FROM node:lts

# Establecer el directorio de trabajo
WORKDIR /src/app/nestjs

# Copiar los archivos package.json y package-lock.json
COPY package*.json ./

# Instalar las dependencias (dentro del contenedor)
RUN npm install

# Copiar el resto de los archivos del proyecto
COPY . .

# Construir la aplicación si es necesario (opcional)
# RUN npm run build

# Exponer el puerto en el que la aplicación se ejecuta
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["npm", "run", "start:dev"]