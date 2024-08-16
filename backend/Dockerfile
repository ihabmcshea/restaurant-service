# Use Node.js image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json, yarn.lock, and tsconfig.json
COPY package.json yarn.lock tsconfig.json ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Install Nest CLI globally
RUN yarn global add @nestjs/cli

# Copy all application files
COPY . .

# Expose the port your app runs on
EXPOSE 4000

RUN chmod 644 tsconfig.json

# Start the application in development mode with live reloading
CMD ["yarn", "run", "start:dev"]
