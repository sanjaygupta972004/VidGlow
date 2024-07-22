FROM node:lts-alpine

WORKDIR /src

COPY package.json package-lock.json ./
RUN npm install

COPY . .

CMD ["npm", "start"]

ENV MONGODB_URL=mongodb+srv://sanjaygupta07054:CHAIAURCODE2026@cluster4.ehhjzcn.mongodb.net
ENV CORS_ORIGIN=*
ENV NODE_ENV=development

ENV ACCESS_TOKEN_SECRET=11092d7a-ee9f-4e6e-a724-db6c8b8777f0
ENV ACCESS_TOKEN_EXPIRY = 1d
ENV REFRESH_TOKEN_SECRET=4261b971-1df7-4648-b2aa-e233be210276
ENV REFRESH_TOKEN_EXPIRY = 10d
ENV CLOUDINARY_CLOUD_NAME=chaiaurvideoapp 
ENV CLOUDINARY_API_KEY=296784939161891
ENV CLOUDINARY_API_SECRET=replace_with_strong_secret 

EXPOSE 5000

CMD ["npm", "run", "dev"] 
