FROM node:18

WORKDIR /app



COPY package*.json ./

# Install dependencies
RUN npm install

COPY . .

# Build for production
RUN npm run build

EXPOSE 5000
CMD ["pnpm", "preview", "--host", "0.0.0.0", "--port", "5000"]
