# base image 
FROM node:22-alpine AS builder

# Environment variables
ENV MONGODB_URL="mongodb+srv://sanjaygupta07054:codeWithVidglow@cluster1000.3ef7l.mongodb.net"
ENV CORS_ORIGIN="*"
ENV NODE_ENV="development"
ENV PORT="3000"

ENV ACCESS_TOKEN_SECRET="11092d7a-ee9f-4e6e-a724-db6c8b8777f0"
ENV ACCESS_TOKEN_EXPIRY="1d"
ENV REFRESH_TOKEN_SECRET="4261b971-1df7-4648-b2aa-e233be210276"
ENV REFRESH_TOKEN_EXPIRY="10d"
ENV CLOUDINARY_CLOUD_NAME="chaiaurvideoapp"
ENV CLOUDINARY_API_KEY="296784939161891"
ENV CLOUDINARY_API_SECRET="5zczm8ORuXMJtQ-1SrIaqlZ_U-o"

# Set working directory
WORKDIR /app

COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Final runtime image
FROM builder AS runtime

# working directory of final image 
WORKDIR /app

# Copy necessary files from the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app ./


EXPOSE 3000

CMD ["npm", "run", "start"]
