FROM node:20-alpine

# Work from root
WORKDIR /frontend

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build production files
RUN npm run build

# Expose the Vite port
EXPOSE 5173

# Run the app
CMD ["npm", "run", "preview", "--", "--host", "--port", "5173"]