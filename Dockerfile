FROM node:20-alpine 

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# RUN npm run build

# # Stage 2: Serve the application
# FROM node:20-alpine

# WORKDIR /app
# COPY --from=builder /app .

# RUN touch .env
# Expose port 3000 for development server
EXPOSE 3000

# Start the development server
CMD ["npm", "start"]