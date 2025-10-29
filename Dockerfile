# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install any needed packages
RUN npm install --verbose

# Copy the rest of the application's code
COPY . .

# This script is designed as a Cloudflare Worker and not a long-running service.
# The following CMD will execute the script once and then the container will exit.
# For scheduled execution, a cron job or an orchestrator like Kubernetes CronJob is recommended.
CMD [ "node", "index.js" ]
