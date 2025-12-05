# Use Node 18 base image
FROM node:18

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy app source
COPY . .

# Copy .env file so app can read MongoDB URI
COPY .env .env

# Expose port
EXPOSE 3000

# Run app
CMD ["node", "app.js"]

