FROM node:18

WORKDIR /app

COPY package*.json ./

# Install dependencies
RUN npm install

COPY . .

# Build for production
RUN npm run build

EXPOSE 5000
CMD ["npx", "cross-env", "NODE_ENV=production", "PORT=5000", "react-router-serve", "./build/server/index.js", "--assets-build-directory", "./build/client"]
