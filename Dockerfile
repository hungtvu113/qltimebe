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
RUN npm ci --only=production && npm cache clean --force

# Sao chép built application từ builder stage
COPY --from=builder /app/dist ./dist

# Sao chép các files cần thiết khác
COPY --from=builder /app/node_modules ./node_modules

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
