FROM mcr.microsoft.com/playwright:v1.52.0-noble

# Set working directory
WORKDIR /usr/src/app

# Install dependencies
COPY package.json package-lock.json* ./
# RUN npm install --omit=dev
RUN npm install

# Copy source code
COPY . .

# Expose port (adjust if needed)
EXPOSE 3099

# Start the server
CMD ["npm", "start"]
