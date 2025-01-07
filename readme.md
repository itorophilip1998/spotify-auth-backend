You can definitely run both your Node.js app and Redis without using Docker Compose. However, there are some considerations and trade-offs when doing so. Here’s an explanation of why you might choose to use just a Docker image for your Node.js application and Redis, along with the steps to do so:

### Why You Might Choose Docker Compose vs. Docker Image Alone:

1. **Isolation and Dependency Management**:
   - **Docker Compose** allows you to easily manage multi-container applications (e.g., one for your Node.js app and another for Redis). It handles the networking between containers and their dependencies. This makes it simpler to manage the two containers together.
   - If you **don’t use Docker Compose**, you would need to manually create and link containers, which can be more complex to handle when scaling or running multiple services.

2. **Network Configuration**:
   - **Docker Compose** automatically sets up a network between the services (like Redis and your Node.js app), and you don’t have to worry about the IP addresses of the containers. 
   - Without Compose, you need to manage the networking yourself using `docker network create` and manually configure the IPs of each container.

3. **Scaling**:
   - **Docker Compose** provides an easy way to scale services (for example, running multiple instances of your app). You can scale containers with a single command, e.g., `docker-compose up --scale app=3`.
   - Without Compose, scaling is possible, but it requires extra configuration and is typically more cumbersome.

### Running Node.js and Redis Without Docker Compose:

If you decide to run both the Node.js app and Redis without Docker Compose, you can do it with two separate `docker run` commands. Here’s how to do it:

### 1. **Run Redis Container**:
   You can start a Redis container by running the following command:

   ```bash
   docker run --name redis-server -d -p 6379:6379 redis:alpine
   ```

   - `--name redis-server`: Assigns a name to the Redis container (optional, but helpful for easier reference).
   - `-d`: Runs the container in detached mode (in the background).
   - `-p 6379:6379`: Exposes port `6379` from the container to port `6379` on the host.
   - `redis:alpine`: Uses the official Redis image based on Alpine Linux for a lightweight image.

### 2. **Run Node.js App with PM2**:
   Once Redis is up and running, you can now start your Node.js app in a separate container. You’ll also need to modify your `Dockerfile` slightly to include PM2.

   **Dockerfile** (updated):

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

   Build the image:

   ```bash
   docker build -t node-app .
   ```

   Now you can run the Node.js app container:

   ```bash
   docker run --name node-app -d -p 8000:8000 --link redis-server:redis node-app
   ```

   - `--link redis-server:redis`: This allows the Node.js app container to communicate with the Redis container by linking the Redis container to the app container under the alias `redis`.
   - `-d`: Runs the container in detached mode.
   - `-p 8000:8000`: Exposes port `8000` from the Node.js container to port `8000` on the host.

### 3. **Accessing Redis from Node.js**:
   In your Node.js app, you should configure the Redis client to use the hostname `redis` (since you linked the Redis container as `redis`).

   Here’s how to modify your code:

   ```javascript
   const Redis = require('ioredis');
   const redis = new Redis({
     host: 'redis', // This should match the alias used in the --link flag
     port: 6379
   });

   // Example usage
   redis.set('key', 'value', 'EX', 10); // Set a key with an expiration of 10 seconds
   ```

### 4. **Viewing Logs**:
   To view logs from the Node.js container:

   ```bash
   docker logs -f node-app
   ```

   Similarly, to view logs from the Redis container:

   ```bash
   docker logs -f redis-server
   ```

### 5. **Stopping and Removing Containers**:
   If you want to stop the containers, run:

   ```bash
   docker stop node-app redis-server
   ```

   To remove the containers:

   ```bash
   docker rm node-app redis-server
   ```

### Key Considerations Without Docker Compose:

- **Linking Containers**: Without Docker Compose, you manually link containers using the `--link` flag or Docker networks. This can become cumbersome with multiple containers.
- **Environment Variables**: You may need to pass environment variables explicitly when running the containers if needed.
- **Networking**: Docker Compose automatically handles container networking. Without it, you would need to set up custom Docker networks.

### Conclusion:

While using just Docker commands is fine for simple use cases, **Docker Compose** provides a more efficient, scalable, and maintainable solution for multi-container applications. However, if you prefer to manage containers individually or have only a simple setup, using Docker commands without Compose is completely viable, especially for smaller or isolated applications.