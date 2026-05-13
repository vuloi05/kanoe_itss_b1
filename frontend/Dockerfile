FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Turbopack lacks native bindings for Alpine (musl libc); fall back to Webpack
RUN npx next build --webpack

EXPOSE 3000

CMD ["npm", "start"]