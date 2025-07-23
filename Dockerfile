# Multi-stage build cho NestJS
FROM node:18-alpine AS builder

# Thiết lập thư mục làm việc
WORKDIR /app

# Sao chép package.json và package-lock.json
COPY package*.json ./

# Cài đặt tất cả dependencies (bao gồm devDependencies để build)
RUN npm ci

# Sao chép source code
COPY . .

# Build ứng dụng
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Thiết lập thư mục làm việc
WORKDIR /app

# Sao chép package.json và package-lock.json
COPY package*.json ./

# Cài đặt chỉ production dependencies
RUN npm ci --omit=dev && npm cache clean --force

# Sao chép built application từ builder stage
COPY --from=builder /app/dist ./dist

# Thiết lập biến môi trường
ENV MONGODB_URI=mongodb+srv://tranhung:123TTHpro@csdlqltime.uk8ji20.mongodb.net/qltime?retryWrites=true&w=majority
ENV JWT_SECRET=your_jwt_secret_key
ENV JWT_EXPIRES=1d
ENV NODE_ENV=production
ENV PORT=3001
ENV GEMINI_API_KEY=
ENV EMAIL_USER=tranhunggit@gmail.com
ENV EMAIL_PASSWORD="bgai gzsr jggg fbzl"
ENV FRONTEND_URL=https://qltime.vercel.app

# Expose port
EXPOSE 3001

# Tạo user non-root để chạy ứng dụng
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Chuyển ownership của thư mục app cho user nestjs
RUN chown -R nestjs:nodejs /app
USER nestjs

# Khởi động ứng dụng
CMD ["npm", "run", "start:prod"]
