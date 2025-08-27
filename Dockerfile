# Usar imagem oficial do Node.js (versão LTS)
FROM node:18

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json (se existir)
COPY package.json .
COPY package-lock.json* .


# Copiar o restante do código
COPY . .

# Expor a porta 3000
EXPOSE 3000

# Comando para iniciar o servidor
CMD ["node", "server.js"]