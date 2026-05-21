# E-commerce Project

Đây là dự án E-commerce với cấu trúc thư mục bao gồm hai phần chính: Client và Server.

## Cấu trúc thư mục

- `/server`: Chứa mã nguồn backend hiện tại.
  - **Framework**: NestJS
  - **ORM**: Prisma
  - **Cơ sở dữ liệu**: PostgreSQL
  - **Các công nghệ nổi bật khác**: AWS S3, React Email, Resend, JWT (Bcrypt, Otpauth), Zod
- `/client`: Thư mục dành riêng để phát triển phần giao diện (Frontend - FE) sau này.

## Khởi chạy dự án

### Server (Backend)

Di chuyển vào thư mục server:
```bash
cd server
```

Cài đặt các thư viện phụ thuộc:
```bash
npm install
```

Thiết lập biến môi trường và chạy dự án trong môi trường phát triển:
```bash
npm run dev
```

*(Các script khác có thể xem trong file `server/package.json` như `build`, `test`, `lint`, v.v.)*

### Client (Frontend)

*(Sẽ cập nhật hướng dẫn sau khi mã nguồn Frontend được khởi tạo trong thư mục `client`)*
