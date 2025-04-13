# Use official Node.js runtime as base image
FROM node:18-alpine

# Set working directory in container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Expose port the app runs on
EXPOSE 3001

# Environment variable for production
ENV NODE_ENV=production

# Command to run the application
CMD ["npm", "start"] 