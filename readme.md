Certainly! Below is an expanded version of your `README.md` file that includes a section on configuring Docker for your project.

### Full `README.md` with Docker Configuration

```markdown
# Node.js App with Redis using Docker and PM2

This project demonstrates how to set up a Node.js application using PM2 for process management and Redis as a caching layer. You can run this project using Docker either with or without Docker Compose.

## Prerequisites

Before starting, ensure that you have the following installed:
- Docker (https://www.docker.com/get-started)
- Docker Compose (https://docs.docker.com/compose/install/) (if using Compose)

## Project Setup

### 1. Clone the Repository

First, clone this repository to your local machine:

```bash
git clone https://github.com/your-repository-name.git
cd your-repository-name
```

### 2. Build and Run with Docker (Without Docker Compose)

To run the application and Redis without Docker Compose, follow these steps:

#### 2.1. Build the Docker Image for the Node.js Application

In your project directory, build the Docker image for the Node.js application:

```bash
docker build -t node-app .
```

#### 2.2. Run the Redis Server Container

Start the Redis container by running:

```bash
docker run --name redis-server -d -p 6379:6379 redis:alpine
```

This command will:
- Run the Redis server in a detached mode (`-d`).
- Expose Redis on port `6379` (the default Redis port).

#### 2.3. Run the Node.js Application Container

Link the Node.js app container to the Redis container:

```bash
docker run --name node-app -d -p 8000:8000 --link redis-server:redis node-app
```

This command will:
- Run your Node.js application in detached mode (`-d`).
- Map port `8000` from the container to port `8000` on your host machine.
- Link the Redis container, allowing the app to connect to Redis via the alias `redis`.

#### 2.4. Access the Application

Once the containers are running, the Node.js app will be available at `http://localhost:8000`. You can interact with the app and Redis.

#### 2.5. Stopping and Removing Containers

To stop the containers:

```bash
docker stop node-app redis-server
```

To remove the containers:

```bash
docker rm node-app redis-server
```

### 3. Build and Run with Docker Compose

To use Docker Compose for easier management, follow these steps:

#### 3.1. Install Dependencies

Make sure you have `docker-compose.yml` and `Dockerfile` files in your project directory.

#### 3.2. Start the Services with Docker Compose

Run the following command to build and start both the Node.js and Redis services:

```bash
docker-compose up --build
```

This will:
- Automatically build the Docker image for your Node.js application.
- Start both the Node.js app and Redis containers.

#### 3.3. Access the Application

Once the containers are running, you can access your Node.js application at `http://localhost:8000` and connect to Redis at `localhost:6379`.

#### 3.4. Stopping and Removing Services

To stop the containers:

```bash
docker-compose down
```

This command stops and removes all containers defined in the `docker-compose.yml` file.

### 4. Docker Configuration

#### 4.1. `Dockerfile`

This file defines how the Node.js application is built and run inside the Docker container. Here is the configuration for the `Dockerfile`:

```dockerfile
# Step 1: Use the official Node.js image
FROM node:18-alpine

# Step 2: Set the working directory inside the container
WORKDIR /app

# Step 3: Install pm2 globally
RUN npm install -g pm2

# Step 4: Copy package.json and yarn.lock (or package-lock.json if you're using npm)
COPY package.json yarn.lock ./

# Step 5: Install dependencies
RUN yarn install --production

# Step 6: Copy the rest of the application code into the container
COPY . .

# Step 7: Expose the application port
EXPOSE 8000

# Step 8: Set the command to run pm2 and start the application
CMD ["pm2-runtime", "index.js"]
```

- **`FROM node:18-alpine`**: Use the official Node.js image based on Alpine Linux for a smaller image.
- **`WORKDIR /app`**: Set `/app` as the working directory inside the container.
- **`RUN npm install -g pm2`**: Install PM2 globally to manage your Node.js application.
- **`COPY`**: Copy necessary project files into the container.
- **`EXPOSE 8000`**: Expose port `8000` for the app to communicate with the host machine.
- **`CMD ["pm2-runtime", "index.js"]`**: Use `pm2-runtime` to run your application, which allows PM2 to manage the Node.js app inside the container.

#### 4.2. `docker-compose.yml`

This file defines the services and how they interact (Node.js app and Redis server). Here’s the configuration for `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    container_name: node-app
    ports:
      - "8000:8000"
    depends_on:
      - redis
    environment:
      - REDIS_HOST=redis
      - REDIS_PORT=6379
    networks:
      - app-network

  redis:
    image: redis:alpine
    container_name: redis-server
    ports:
      - "6379:6379"
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

- **`app` service**: The Node.js application, which is built from the current directory (`build: .`).
- **`redis` service**: The Redis container, which uses the official Redis Alpine image (`redis:alpine`).
- **`depends_on`**: Ensures the `app` service starts only after the `redis` service is up.
- **`REDIS_HOST=redis`**: Sets the environment variable to connect to Redis at the `redis` service (using Docker's internal DNS).
- **`app-network`**: Both services are connected to a custom Docker network (`app-network`) to enable communication.

#### 4.3. `package.json`

Make sure your `package.json` includes the necessary dependencies, such as `ioredis` for Redis connection and `pm2` for process management:

```json
{
  "name": "node-app",
  "version": "1.0.0",
  "scripts": {
    "start": "pm2-runtime index.js"
  },
  "dependencies": {
    "ioredis": "^4.0.0"
  },
  "devDependencies": {
    "pm2": "^5.0.0"
  }
}
```

#### 4.4. Redis Configuration in Node.js (`index.js`)

In your Node.js application, you can connect to Redis as follows:

```javascript
const Redis = require('ioredis');
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost', // Use 'redis' if Docker Compose is used
  port: process.env.REDIS_PORT || 6379
});

// Example usage: Setting a key-value pair
redis.set('key', 'value', 'EX', 10); // Set a key with a 10-second expiration time

// Example usage: Getting a value
redis.get('key', (err, result) => {
  if (err) {
    console.error('Redis error:', err);
  } else {
    console.log('Redis result:', result);
  }
});
```

This configuration uses environment variables (`REDIS_HOST` and `REDIS_PORT`) to configure Redis. When using Docker Compose, these values are automatically set.

### 5. Project Structure

Here’s a quick overview of the project structure:

```plaintext
.
├── Dockerfile           # Dockerfile for building the Node.js app image
├── docker-compose.yml   # Docker Compose file to run app and Redis
├── package.json         # Node.js dependencies and scripts
├── yarn.lock            # Yarn lock file
├── index.js             # Entry point for the Node.js app
└── README.md            # Project README file
```

### 6. Troubleshooting

If you encounter any issues, here are a few things to check:
- Ensure Docker is running and your containers are not stopped by checking with `docker ps`.
- Verify the network connectivity between containers by ensuring the Redis container is running before starting the Node.js container.
- Check the logs of the Node.js app and Redis container with the following commands:

```bash
docker logs -f node-app
docker logs -f redis-server
```

### 7. PM2 Configuration

The Node.js app is managed using **PM2**, which is a process manager that helps manage and monitor your Node.js application. PM2 is installed globally in the Dockerfile, and it's used to run the app with the following command:

```bash
pm2-runtime index.js
```

### 8. License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
```

---

### Summary of the Key Sections Added:

1. **Docker Configuration**: Added detailed instructions on the `