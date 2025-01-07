# Stage 1: Build stage
FROM node:18 as builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the application code
COPY . .

# Build the application (if required)
# RUN npm run build  # Uncomment this if your app requires a build step

# Stage 2: Production stage
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy only the necessary files from the build stage
COPY --from=builder /app .

# Install only production dependencies
RUN npm install --production

# Expose the application port
EXPOSE 8000

# Start the application
CMD ["node", "index.js"]
