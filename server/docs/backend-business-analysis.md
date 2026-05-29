# Tài liệu đặc tả Web UI — E-commerce Backend

---

## 1. Tổng quan hệ thống

**Framework/Ngôn ngữ:** NestJS 11 (TypeScript), Prisma 7 (ORM), PostgreSQL
**Runtime phụ trợ:** BullMQ (Redis queue), Socket.io WebSockets, AWS S3, Resend (email), nestjs-zod (validation)

**Vai trò chính:** Backend cho sàn thương mại điện tử kiểu marketplace — hỗ trợ đa người bán (Seller), khách hàng (Client), và quản trị viên (Admin). Xử lý toàn bộ luồng từ đăng ký tài khoản → duyệt sản phẩm → giỏ hàng → đặt hàng → thanh toán (qua cổng SePay webhook).

**Các module/domain chính:**

| Domain | Mô tả |
|--------|-------|
| `auth` | Đăng ký, đăng nhập, OTP, refresh token, Google OAuth, 2FA |
| `users` / `profile` | Quản lý người dùng (admin) và hồ sơ cá nhân |
| `roles` / `permissions` | RBAC — phân quyền theo HTTP method + path |
| `products` / `manage-product` | Catalog sản phẩm (public + seller quản lý) |
| `categories` | Danh mục sản phẩm, hỗ trợ đa cấp |
| `brands` | Thương hiệu sản phẩm |
| `cart` | Giỏ hàng |
| `orders` | Đặt hàng, hủy đơn |
| `payment` | Webhook nhận kết quả thanh toán từ SePay |
| `languages` | Danh sách ngôn ngữ hỗ trợ đa ngôn ngữ |
| `media` | Upload ảnh (S3 + presigned URL + local static) |
| `websockets` | Chat real-time + thông báo thanh toán |

---

## 2. Danh sách nghiệp vụ

### 2.1 Đăng ký tài khoản

- **Mô tả:** Khách hàng tự đăng ký tài khoản với email + password, cần OTP xác thực email trước
- **Actor:** Khách vãng lai (unauthenticated)
- **Entrypoint:** `POST /auth/otp` → `POST /auth/register`
- **Input:** `email, password, confirmPassword, name, phoneNumber, code (OTP)`
- **Output:** Thông tin user (không có password, totpSecret)
- **Validation:** Email chưa tồn tại, password khớp confirmPassword, OTP hợp lệ và chưa hết hạn, type = `REGISTER`
- **File:** `src/routes/auth/auth.controller.ts`, `auth.service.ts`, `auth.model.ts`

### 2.2 Đăng nhập (Email + Password)

- **Mô tả:** Đăng nhập, nhận access token + refresh token. Hỗ trợ 2FA (TOTP hoặc email OTP)
- **Actor:** Mọi user đã đăng ký
- **Entrypoint:** `POST /auth/login`
- **Input:** `email, password, totpCode? (6 chữ số), code? (OTP email khi 2FA kiểu email)`
- **Output:** `{ accessToken, refreshToken }`
- **Validation:** Tài khoản active, password đúng, nếu có 2FA thì phải pass thêm bước xác thực
- **File:** `src/routes/auth/`

### 2.3 Google OAuth

- **Mô tả:** Đăng nhập/đăng ký qua Google. Redirect về client kèm tokens
- **Actor:** Khách vãng lai
- **Entrypoint:** `GET /auth/google-link` → redirect Google → `GET /auth/google/callback`
- **Output:** Redirect URL về client chứa tokens
- **File:** `src/routes/auth/auth.controller.ts`

### 2.4 Refresh Token

- **Mô tả:** Làm mới access token bằng refresh token còn hiệu lực
- **Actor:** User đã đăng nhập
- **Entrypoint:** `POST /auth/refresh-token`
- **Input:** `{ refreshToken }`
- **Output:** `{ accessToken, refreshToken }` mới
- **File:** `src/routes/auth/`

### 2.5 Đăng xuất

- **Mô tả:** Vô hiệu hóa refresh token, xóa device session
- **Entrypoint:** `POST /auth/logout`
- **Input:** `{ refreshToken }`
- **Output:** Message thành công

### 2.6 Quên mật khẩu

- **Mô tả:** Đặt lại mật khẩu qua OTP email
- **Entrypoint:** `POST /auth/otp` (type=`FORGOT_PASSWORD`) → `POST /auth/forgot-password`
- **Input:** `email, code, newPassword, confirmNewPassword`
- **Validation:** OTP hợp lệ, password mới khớp confirm

### 2.7 Bật/Tắt 2FA (TOTP)

- **Mô tả:** Setup 2FA TOTP (Google Authenticator), hoặc vô hiệu hóa
- **Actor:** User đã đăng nhập
- **Entrypoint:** `POST /auth/2fa/setup` → client scan QR → confirm TOTP code
- **Disable:** `POST /auth/2fa/disable` với `totpCode` hoặc `code` (email OTP, type=`DISABLE_2FA`)
- **Output setup:** `{ secret, uri }` (URI dùng generate QR code)

### 2.8 Xem/cập nhật hồ sơ cá nhân

- **Actor:** User đã đăng nhập
- **Entrypoint:** `GET /profile`, `PUT /profile`
- **Input PUT:** `name?, phoneNumber?, avatar?`
- **Output GET:** User với role + permissions

### 2.9 Đổi mật khẩu

- **Entrypoint:** `PUT /profile/change-password`
- **Input:** `password (cũ), newPassword, confirmNewPassword`

### 2.10 Quản lý người dùng (Admin)

- **Actor:** Admin
- **Entrypoint:** `GET/POST/PUT/DELETE /users` và `/users/:userId`
- **Input tạo:** `email, name, phoneNumber, avatar, password, roleId, status`
- **Validation:** Status là `ACTIVE | INACTIVE | BLOCKED`, roleId tồn tại

### 2.11 Quản lý phân quyền — Roles

- **Mô tả:** CRUD role, gán danh sách permissionIds vào role
- **Actor:** Admin
- **Entrypoint:** `GET/POST/PUT/DELETE /roles`, `/roles/:roleId`
- **Input tạo:** `name, description, isActive`
- **Input update:** `name, description, isActive, permissionIds[]`
- **Output chi tiết:** Role + mảng permissions

### 2.12 Quản lý phân quyền — Permissions

- **Mô tả:** CRUD permission (mỗi permission = 1 HTTP method + 1 path + tên module)
- **Actor:** Admin
- **Entrypoint:** `GET/POST/PUT/DELETE /permissions`
- **Input:** `name, path, method (GET|POST|...), module`

### 2.13 Duyệt sản phẩm (Public)

- **Actor:** Khách vãng lai / Client
- **Entrypoint:** `GET /products`, `GET /products/:productId`
- **Query:** `page, limit, name, brandIds[], categories[], minPrice, maxPrice, createdById, orderBy (asc/desc), sortBy (price|createdAt|sale)`
- **Output danh sách:** Sản phẩm với translations, phân trang
- **Output chi tiết:** Product + translations + SKUs + categories + brand

### 2.14 Quản lý sản phẩm (Seller/Admin)

- **Actor:** Seller, Admin
- **Entrypoint:** `GET/POST/PUT/DELETE /manage-product/products`
- **Input tạo:** `publishedAt, name (object đa ngôn ngữ), basePrice, virtualPrice, brandId, images[], categories[] (categoryIds), variants (cấu trúc variant/option JSON), skus[]`
- **SKU:** `{ value, price, stock, image }` — value là tổ hợp option (e.g., "Red-M")
- **Output:** Product chi tiết đầy đủ

### 2.15 Quản lý danh mục

- **Actor:** Admin
- **Entrypoint:** `GET/POST/PUT/DELETE /categories`, `/categories/:categoryId`
- **Input:** `name (đa ngôn ngữ), logo, parentCategoryId?` (hỗ trợ cây danh mục)
- **Query GET:** `parentCategoryId?` — lọc theo danh mục cha

### 2.16 Quản lý thương hiệu

- **Actor:** Admin
- **Entrypoint:** `GET/POST/PUT/DELETE /brands`
- **Input:** `name (đa ngôn ngữ), logo`

### 2.17 Quản lý ngôn ngữ

- **Actor:** Admin
- **Entrypoint:** `GET/POST/PUT/DELETE /languages`
- **Input tạo:** `id (≤10 chars, e.g., "vi", "en"), name`

### 2.18 Giỏ hàng

- **Actor:** Client đã đăng nhập
- **Entrypoint:** `GET /cart`, `POST /cart`, `PUT /cart/:cartItemId`, `POST /cart/delete`
- **Output GET:** Gom nhóm theo shop `[{shop, cartItems:[{id, sku:{...product}}]}]`
- **Input thêm:** `skuId, quantity`
- **Input xóa:** `{ cartItemIds: number[] }` (xóa nhiều item cùng lúc)

### 2.19 Đặt hàng

- **Actor:** Client
- **Entrypoint:** `POST /orders`
- **Input:** Array các order theo shop `[{shopId, receiver:{name, phone, address}, cartItemIds[]}]` — 1 request có thể tạo nhiều đơn từ nhiều shop
- **Lifecycle:** `PENDING_PAYMENT → PENDING_PICKUP → PENDING_DELIVERY → DELIVERED | RETURNED | CANCELLED`
- **Output:** Array orders mới tạo

### 2.20 Xem danh sách đơn hàng

- **Entrypoint:** `GET /orders`
- **Query:** `page, limit, status?`
- **Output:** Đơn hàng với items (ProductSKUSnapshot — snapshot thông tin sản phẩm tại thời điểm mua)

### 2.21 Hủy đơn hàng

- **Entrypoint:** `POST /orders/:orderId` (suy luận từ controller — không phải `DELETE`)
- **Validation:** Chỉ được hủy khi status cho phép (thường `PENDING_PAYMENT` hoặc `PENDING_PICKUP`)

### 2.22 Thanh toán (Webhook SePay)

- **Actor:** Payment gateway (SePay), không phải end-user UI
- **Entrypoint:** `POST /payment/receiver`
- **Auth:** `PAYMENT_API_KEY` header
- **Xử lý:** Match `content` của transaction với order code (prefix `DH`), cập nhật trạng thái Payment + Order
- **Queue:** Job `CANCEL_PAYMENT` được enqueue khi tạo order, bị remove nếu thanh toán thành công trong thời hạn

### 2.23 Upload media

- **Entrypoint:** `POST /media/images/upload` (multipart, tối đa 100 ảnh × 5MB)
- **Entrypoint:** `POST /media/images/upload/presigned-url` (≤1MB, lấy URL để upload thẳng lên S3)
- **Auth:** Upload multipart cần auth; presigned URL là `@IsPublic`
- **Output:** `[{ url }]`

### 2.24 Chat real-time

- **Actor:** User đã đăng nhập (WebSocket)
- **Gateway:** `/chat` namespace — event `send-message`, emit `receive-message`

### 2.25 Thông báo thanh toán real-time

- **Gateway:** `/payment` namespace — event `send-money`, emit `receive-money`

---

## 3. Bản đồ API

| Method | Path | Mục đích | Auth | Role gợi ý | Request | Response chính | File |
|--------|------|----------|------|-----------|---------|----------------|------|
| POST | /auth/otp | Gửi OTP email | Public | All | `{email, type}` | Message | auth.controller |
| POST | /auth/register | Đăng ký | Public | All | `{email,password,confirmPassword,name,phoneNumber,code}` | UserDTO | auth.controller |
| POST | /auth/login | Đăng nhập | Public | All | `{email,password,totpCode?,code?}` | `{accessToken,refreshToken}` | auth.controller |
| POST | /auth/refresh-token | Refresh token | Public | All | `{refreshToken}` | `{accessToken,refreshToken}` | auth.controller |
| POST | /auth/logout | Đăng xuất | Bearer | All | `{refreshToken}` | Message | auth.controller |
| GET | /auth/google-link | Lấy URL Google OAuth | Public | All | — | `{url}` | auth.controller |
| GET | /auth/google/callback | Callback Google OAuth | Public | All | `?code&state` | Redirect + tokens | auth.controller |
| POST | /auth/forgot-password | Đặt lại mật khẩu | Public | All | `{email,code,newPassword,confirmNewPassword}` | Message | auth.controller |
| POST | /auth/2fa/setup | Bật 2FA | Bearer | All | `{}` | `{secret,uri}` | auth.controller |
| POST | /auth/2fa/disable | Tắt 2FA | Bearer | All | `{totpCode?/code?}` | Message | auth.controller |
| GET | /profile | Xem hồ sơ | Bearer | All | — | User+Role+Perms | user.controller |
| PUT | /profile | Cập nhật hồ sơ | Bearer | All | `{name?,phoneNumber?,avatar?}` | UserDTO | user.controller |
| PUT | /profile/change-password | Đổi mật khẩu | Bearer | All | `{password,newPassword,confirmNewPassword}` | Message | user.controller |
| GET | /users | Danh sách user | Bearer | Admin | `?page&limit` | Paginated Users | user.controller |
| GET | /users/:id | Chi tiết user | Bearer | Admin | — | UserProfile | user.controller |
| POST | /users | Tạo user | Bearer | Admin | `{email,name,phone,avatar,password,roleId,status}` | UserDTO | user.controller |
| PUT | /users/:id | Cập nhật user | Bearer | Admin | same | UserDTO | user.controller |
| DELETE | /users/:id | Xóa user | Bearer | Admin | — | Message | user.controller |
| GET | /roles | Danh sách role | Bearer | Admin | `?page&limit` | Paginated Roles | role.controller |
| GET | /roles/:id | Chi tiết role | Bearer | Admin | — | Role+Permissions | role.controller |
| POST | /roles | Tạo role | Bearer | Admin | `{name,description,isActive}` | RoleDTO | role.controller |
| PUT | /roles/:id | Cập nhật role | Bearer | Admin | `{...+permissionIds[]}` | Role+Permissions | role.controller |
| DELETE | /roles/:id | Xóa role | Bearer | Admin | — | Message | role.controller |
| GET | /permissions | Danh sách permission | Bearer | Admin | `?page&limit` | Paginated Perms | permission.controller |
| GET | /permissions/:id | Chi tiết permission | Bearer | Admin | — | PermDTO | permission.controller |
| POST | /permissions | Tạo permission | Bearer | Admin | `{name,path,method,module}` | PermDTO | permission.controller |
| PUT | /permissions/:id | Cập nhật | Bearer | Admin | same | PermDTO | permission.controller |
| DELETE | /permissions/:id | Xóa | Bearer | Admin | — | Message | permission.controller |
| GET | /products | Danh sách sản phẩm | Public | All | `?page,limit,name,brandIds,categories,minPrice,maxPrice,sortBy,orderBy` | Paginated Products | product.controller |
| GET | /products/:id | Chi tiết sản phẩm | Public | All | — | Product+SKUs+Trans | product.controller |
| GET | /manage-product/products | DS sản phẩm (quản lý) | Bearer | Seller/Admin | same + `?isPublic` | Paginated Products | manage-product.controller |
| GET | /manage-product/products/:id | Chi tiết (quản lý) | Bearer | Seller/Admin | — | Product detail | manage-product.controller |
| POST | /manage-product/products | Tạo sản phẩm | Bearer | Seller/Admin | `{publishedAt,name,basePrice,virtualPrice,brandId,images,categories,variants,skus}` | ProductDetail | manage-product.controller |
| PUT | /manage-product/products/:id | Cập nhật sản phẩm | Bearer | Seller/Admin | same | ProductDTO | manage-product.controller |
| DELETE | /manage-product/products/:id | Xóa sản phẩm | Bearer | Seller/Admin | — | Message | manage-product.controller |
| GET | /categories | Danh sách danh mục | Public | All | `?parentCategoryId` | `{data[],totalItems}` | category.controller |
| GET | /categories/:id | Chi tiết danh mục | Public | All | — | Category+Trans | category.controller |
| POST | /categories | Tạo danh mục | Bearer | Admin | `{name,logo,parentCategoryId?}` | Category | category.controller |
| PUT | /categories/:id | Cập nhật | Bearer | Admin | same | Category | category.controller |
| DELETE | /categories/:id | Xóa | Bearer | Admin | — | Message | category.controller |
| GET | /brands | Danh sách brand | Public | All | `?page&limit` | Paginated Brands | brand.controller |
| GET | /brands/:id | Chi tiết brand | Public | All | — | Brand+Trans | brand.controller |
| POST | /brands | Tạo brand | Bearer | Admin | `{name,logo}` | Brand | brand.controller |
| PUT | /brands/:id | Cập nhật | Bearer | Admin | same | Brand | brand.controller |
| DELETE | /brands/:id | Xóa | Bearer | Admin | — | Message | brand.controller |
| GET | /cart | Xem giỏ hàng | Bearer | Client | `?page&limit` | `[{shop,cartItems}]` | cart.controller |
| POST | /cart | Thêm vào giỏ | Bearer | Client | `{skuId,quantity}` | CartItemDTO | cart.controller |
| PUT | /cart/:itemId | Cập nhật item giỏ | Bearer | Client | `{skuId,quantity}` | CartItemDTO | cart.controller |
| POST | /cart/delete | Xóa items giỏ | Bearer | Client | `{cartItemIds:[]}` | Message | cart.controller |
| GET | /orders | Danh sách đơn hàng | Bearer | Client | `?page,limit,status` | Paginated Orders | order.controller |
| POST | /orders | Tạo đơn hàng | Bearer | Client | `[{shopId,receiver,cartItemIds}]` | Orders[] | order.controller |
| GET | /orders/:id | Chi tiết đơn | Bearer | Client | — | Order+Items | order.controller |
| POST | /orders/:id | Hủy đơn (suy luận) | Bearer | Client | — | CancelOrderRes | order.controller |
| POST | /payment/receiver | Webhook thanh toán | PaymentAPIKey | System | SePay payload | Message | payment.controller |
| GET | /languages | Danh sách ngôn ngữ | Bearer | Admin | — | Languages[] | language.controller |
| GET | /languages/:id | Chi tiết ngôn ngữ | Bearer | Admin | — | Language | language.controller |
| POST | /languages | Tạo ngôn ngữ | Bearer | Admin | `{id,name}` | Language | language.controller |
| PUT | /languages/:id | Cập nhật | Bearer | Admin | `{name}` | Language | language.controller |
| DELETE | /languages/:id | Xóa | Bearer | Admin | — | Message | language.controller |
| POST | /media/images/upload | Upload ảnh (multipart) | Bearer | All | FormData `files[]` | `[{url}]` | media.controller |
| POST | /media/images/upload/presigned-url | Presigned URL | Public | All | `{filename,filesize}` | `{presignedUrl,url}` | media.controller |
| GET | /media/static/:filename | Serve file | Public | All | — | File stream | media.controller |

---

## 4. Mô hình dữ liệu

### User

| Field | Type | Ghi chú |
|-------|------|---------|
| id | Int | PK |
| email | String | Unique |
| name | String | |
| phoneNumber | String | Unique, nullable |
| password | String | bcrypt |
| avatar | String | nullable |
| totpSecret | String | nullable, 2FA |
| status | UserStatus | ACTIVE/INACTIVE/BLOCKED |
| roleId | Int | FK → Role |
| deletedAt | DateTime | Soft delete |

**Quan hệ:** User → Role (n:1), User → RefreshToken (1:n), User → CartItem (1:n), User → Order (1:n seller + buyer), User → Review (1:n), User → Message (1:n)

### Role

| Field | Type | Ghi chú |
|-------|------|---------|
| id | Int | PK |
| name | String | Unique: ADMIN/CLIENT/SELLER |
| description | String | |
| isActive | Boolean | |

**Quan hệ:** Role → Permission (n:n qua RolePermission)

### Permission

| Field | Type | Ghi chú |
|-------|------|---------|
| id | Int | PK |
| name | String | Tên thân thiện |
| path | String | HTTP path, e.g., `/users` |
| method | HTTPMethod | GET/POST/PUT/DELETE/PATCH/OPTIONS/HEAD |
| module | String | Tên module |

### Product

| Field | Type | Ghi chú |
|-------|------|---------|
| id | Int | PK |
| publishedAt | DateTime | nullable |
| name | String | Tên nội bộ |
| basePrice | Int | Giá gốc |
| virtualPrice | Int | Giá "fake" (gạch giá) |
| brandId | Int | FK → Brand |
| images | String[] | Mảng URL ảnh |
| variants | Json | `[{value, options:[]}]` |
| createdById | Int | FK → User (seller) |

**Quan hệ:** Product → SKU (1:n), Product → Category (n:n), Product → ProductTranslation (1:n), Product → Brand (n:1)

### SKU

| Field | Type | Ghi chú |
|-------|------|---------|
| id | Int | PK |
| value | String | Tổ hợp option, e.g., "Red-M" |
| price | Int | Giá bán |
| stock | Int | Tồn kho |
| image | String | nullable |
| productId | Int | FK → Product |

### Category

| Field | Type | Ghi chú |
|-------|------|---------|
| id | Int | PK |
| name | String | |
| logo | String | nullable |
| parentCategoryId | Int | nullable — self-referencing |

**Quan hệ:** Category → Category (self: parentCategory/children), Category → CategoryTranslation (1:n), Category → Product (n:n)

### Brand

| Field | Type | Ghi chú |
|-------|------|---------|
| id | Int | PK |
| name | String | |
| logo | String | nullable |

**Quan hệ:** Brand → BrandTranslation (1:n), Brand → Product (1:n)

### CartItem

| Field | Type | Ghi chú |
|-------|------|---------|
| id | Int | PK |
| userId | Int | FK → User |
| skuId | Int | FK → SKU |
| quantity | Int | |

### Order

| Field | Type | Ghi chú |
|-------|------|---------|
| id | Int | PK |
| userId | Int | Người mua |
| shopId | Int | Người bán |
| status | OrderStatus | |
| receiver | Json | `{name, phone, address}` |
| paymentId | Int | FK → Payment |

**OrderStatus:** `PENDING_PAYMENT → PENDING_PICKUP → PENDING_DELIVERY → DELIVERED` hoặc `RETURNED / CANCELLED`

**Quan hệ:** Order → ProductSKUSnapshot (1:n snapshot thông tin SKU tại lúc mua), Order → Payment (n:1)

### Payment

| Field | Type | Ghi chú |
|-------|------|---------|
| id | Int | PK |
| status | PaymentStatus | PENDING/SUCCESS/FAILED |
| amount | Int | |

**Quan hệ:** Payment → PaymentTransaction (1:n log raw)

### Review + ReviewMedia

| Field | Type | Ghi chú |
|-------|------|---------|
| id | Int | PK |
| content | String | |
| rating | Int | |
| productId | Int | FK → Product |
| userId | Int | FK → User |
| orderId | Int | FK → Order |

**ReviewMedia:** `{id, url, type: IMAGE|VIDEO, reviewId}`

### Message

| Field | Type | Ghi chú |
|-------|------|---------|
| id | Int | PK |
| fromUserId | Int | |
| toUserId | Int | |
| content | String | |

### Language

| Field | Type | Ghi chú |
|-------|------|---------|
| id | String | PK, e.g., "vi", "en" |
| name | String | |

**Enum đáng chú ý:**

| Enum | Giá trị |
|------|---------|
| UserStatus | ACTIVE, INACTIVE, BLOCKED |
| OrderStatus | PENDING_PAYMENT, PENDING_PICKUP, PENDING_DELIVERY, DELIVERED, RETURNED, CANCELLED |
| PaymentStatus | PENDING, SUCCESS, FAILED |
| VerificationCodeType | REGISTER, FORGOT_PASSWORD, LOGIN, DISABLE_2FA |
| MediaType | IMAGE, VIDEO |
| HTTPMethod | GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD |

**File định nghĩa:** `prisma/schema.prisma`, từng `*.model.ts` trong `src/routes/<domain>/`

---

## 5. Gợi ý Web UI cần build

### Nhóm màn hình — Authentication (`/auth/*`)

| Route | Mục đích | Component chính | Form |
|-------|----------|----------------|------|
| `/login` | Đăng nhập | LoginForm | email, password, totpCode (conditional) |
| `/register` | Đăng ký | RegisterForm | email, name, phone, password, OTP input |
| `/forgot-password` | Quên MK | ForgotPasswordFlow | email → OTP → new password |
| `/auth/2fa-setup` | Bật 2FA | QrCodeDisplay + TotpVerify | QR hiển thị, input verify code |
| `/auth/google/callback` | OAuth redirect | TokenStorage → redirect | Không có UI riêng |

### Nhóm màn hình — Hồ sơ & Cài đặt (`/profile/*`)

| Route | Component |
|-------|-----------|
| `/profile` | ProfileCard, EditProfileForm |
| `/profile/change-password` | ChangePasswordForm |
| `/profile/2fa` | TwoFactorSettings |

### Nhóm màn hình — Catalog (Public)

| Route | Component | Notes |
|-------|-----------|-------|
| `/` hoặc `/products` | ProductGrid, Filters, Sort | filter brand/category/price/sort |
| `/products/:id` | ProductDetail, SKUSelector, ImageGallery, AddToCart | chọn variant → SKU → giá + stock |
| `/categories` | CategoryTree / CategoryGrid | tree danh mục |
| `/brands` | BrandList | |

### Nhóm màn hình — Giỏ hàng & Đặt hàng

| Route | Component |
|-------|-----------|
| `/cart` | CartGroupedByShop, CartItemRow, QuantityInput, DeleteSelected |
| `/checkout` | ReceiverForm × n shops, OrderSummary, PaymentInfo |
| `/orders` | OrderList, StatusFilter, Pagination |
| `/orders/:id` | OrderDetail, ProductSKUSnapshotList, OrderStatusBadge, CancelButton |

### Nhóm màn hình — Admin

| Route | Component |
|-------|-----------|
| `/admin/users` | UserTable, CreateUserModal, EditUserDrawer, StatusBadge |
| `/admin/roles` | RoleTable, RolePermissionEditor (permissionIds multiselect) |
| `/admin/permissions` | PermissionTable, CreatePermissionForm |
| `/admin/categories` | CategoryTreeView, CreateCategoryForm |
| `/admin/brands` | BrandTable, CreateBrandForm |
| `/admin/languages` | LanguageTable |
| `/admin/products` | ProductTable, Filter by seller/status |

### Nhóm màn hình — Seller

| Route | Component |
|-------|-----------|
| `/seller/products` | ProductTable + isPublic filter |
| `/seller/products/new` | ProductForm: metadata + VariantBuilder + SKUTable + ImageUpload |
| `/seller/products/:id/edit` | same form |
| `/seller/orders` | OrderList with seller-side status management |

### Component dùng chung quan trọng

- **PaginationBar** — `page, limit, totalPages`
- **ImageUpload** — kéo thả, gọi `/media/images/upload` hoặc presigned URL
- **VariantBuilder** — UI dạng attribute-option (Color: [Red, Blue]; Size: [S, M, L]) → auto generate SKU combinations
- **LanguageSwitcher** — `?lang=vi|en` query param
- **StatusBadge** — OrderStatus, PaymentStatus, UserStatus
- **OTPInput** — 6 ô số, auto-focus

### States cần xử lý ở mọi màn hình

- Loading skeleton
- Empty state (no data)
- Error state (API error message từ `{message, path}`)
- 401 Unauthorized → redirect login
- 403 Forbidden → permission denied screen
- 422 Validation error → inline field error từ `path`

---

## 6. Luồng người dùng

### Flow 1: Đăng ký

```
1. Nhập email → POST /auth/otp (type=REGISTER) → nhận OTP qua email
2. Nhập đầy đủ form + OTP → POST /auth/register
3. Redirect → /login
```

### Flow 2: Đăng nhập (có 2FA)

```
1. Nhập email + password → POST /auth/login
2. Nếu response có lỗi 2FA required → hiện thêm input totpCode / code
3. Submit lại → nhận {accessToken, refreshToken} → lưu token
4. Redirect về trang trước hoặc /
```

### Flow 3: Mua hàng end-to-end

```
1. Browse /products (filter/sort) → GET /products
2. Click sản phẩm → GET /products/:id
3. Chọn variant → select SKU → POST /cart {skuId, quantity}
4. Vào /cart → xem giỏ (grouped by shop)
5. Check chọn items → /checkout
6. Nhập địa chỉ nhận hàng (per shop) → POST /orders
7. Nhận thông tin thanh toán (QR/chuyển khoản SePay)
8. Hệ thống webhook nhận xác nhận → Order → PENDING_PICKUP
9. Xem trạng thái tại /orders/:id
```

### Flow 4: Tạo sản phẩm (Seller)

```
1. /seller/products/new
2. Nhập thông tin cơ bản (tên đa ngôn ngữ, giá, brand, danh mục)
3. Build variants: thêm attribute (Color) → thêm options (Red, Blue)
4. Thêm attribute thứ 2 (Size → S, M, L) → auto-generate 6 SKU rows
5. Điền price/stock/image cho từng SKU
6. Upload ảnh sản phẩm → POST /media/images/upload
7. Submit → POST /manage-product/products
```

### Flow 5: Admin quản lý phân quyền

```
1. /admin/permissions → tạo permission {name, path, method, module}
2. /admin/roles → tạo role → edit role → gán permissionIds
3. /admin/users → assign roleId cho user
```

### Flow 6: Quên mật khẩu

```
1. /forgot-password → nhập email → POST /auth/otp (type=FORGOT_PASSWORD)
2. Nhận OTP → nhập OTP + mật khẩu mới → POST /auth/forgot-password
3. Redirect /login
```

### Flow 7: Chat real-time

```
1. Connect WebSocket /chat namespace (token qua handshake)
2. Emit send-message {toUserId, content}
3. Listen receive-message → hiển thị tin nhắn
```

---

## 7. Khoảng trống cần xác nhận

| # | Vấn đề | Mức độ ảnh hưởng |
|---|--------|-----------------|
| 1 | **Review/Rating:** Model `Review` có trong schema Prisma nhưng **không có controller/endpoint** trong `src/routes/`. Chưa rõ có kế hoạch implement hay bỏ qua (suy luận: dead schema). | Cao — nếu có tính năng đánh giá sản phẩm trên UI cần clarify |
| 2 | **Hủy đơn hàng:** `POST /orders/:orderId` — method POST cho cancel khá bất thường. Cần xác nhận endpoint thực sự và điều kiện hủy (status nào được phép hủy?) | Cao |
| 3 | **Cập nhật trạng thái đơn hàng (Seller/Admin):** Không thấy endpoint `PUT /orders/:id` cho seller/admin chuyển status (PENDING_PICKUP → PENDING_DELIVERY → DELIVERED). Cần clarify flow này. | Cao |
| 4 | **Seller dashboard:** Seller có thể xem đơn hàng của shop mình không? Không thấy endpoint lọc theo `shopId` của current user. | Cao |
| 5 | **Thanh toán:** SePay webhook là cổng DUY NHẤT. Không có UI thanh toán tích hợp (embed). UI chỉ hiển thị thông tin chuyển khoản, không có redirect payment page. | Trung bình |
| 6 | **Thông báo real-time:** WebSocket `/payment` emit gì về client sau khi thanh toán thành công? Payload cụ thể chưa rõ. | Trung bình |
| 7 | **Soft delete:** Mọi model đều có `deletedAt`. Các `DELETE` endpoint có thực sự soft-delete hay hard-delete? Ảnh hưởng đến UI (có cần filter "đã xóa" không?) | Thấp |
| 8 | **Đa ngôn ngữ products/categories/brands:** UI cần form nhập theo từng languageId. Cần biết danh sách language hiện có và language nào là default. | Trung bình |
| 9 | **SKU value format:** "Red-M" — backend tự gen hay client tự ghép? Cần spec rõ VariantBuilder logic. | Trung bình |
| 10 | **Chat:** `/chat` WebSocket — scope là user-to-user hay seller-to-buyer? Cần biết để thiết kế inbox UI. | Trung bình |
| 11 | **Role ADMIN/CLIENT/SELLER:** Ba role này được hardcode. Seller có thể tự đăng ký hay Admin mới tạo được? | Cao |
| 12 | **Order receiver:** Một request `POST /orders` tạo nhiều đơn (mỗi shop 1 đơn). Mỗi đơn có receiver riêng — UI cần form địa chỉ per-shop hay một địa chỉ dùng cho tất cả? | Trung bình |

---

## 8. Đề xuất thứ tự build UI

### Phase 1 — MVP Core (Foundation)

| Thứ tự | Màn hình | Phụ thuộc | Ghi chú |
|--------|----------|-----------|---------|
| 1 | Auth: Login + Register + OTP + Forgot Password | `/auth/*` APIs | Unblock mọi màn hình sau |
| 2 | Token management (interceptor refresh) | `/auth/refresh-token` | Critical cho mọi API call |
| 3 | Catalog: Product listing + Filter + Sort | `/products` public | Không cần auth |
| 4 | Product Detail + SKU Selector | `/products/:id` | Không cần auth |
| 5 | Giỏ hàng (`/cart`) | Auth + SKU | Cần auth |
| 6 | Checkout + Tạo đơn | `/orders` POST | Cần cart working |
| 7 | Order list + Order detail | `/orders` GET | Cần orders |
| 8 | Hồ sơ cá nhân | `/profile` | Auth |

### Phase 2 — Admin Panel

| Thứ tự | Màn hình | Phụ thuộc |
|--------|----------|-----------|
| 9 | Permission CRUD | Auth + Admin role |
| 10 | Role CRUD + gán permission | Permissions phải có sẵn |
| 11 | User CRUD + gán role | Roles phải có sẵn |
| 12 | Language management | Độc lập |
| 13 | Brand management | Độc lập |
| 14 | Category management (tree) | Độc lập |
| 15 | Product management (Admin view) | Brands + Categories |

### Phase 3 — Seller Flow

| Thứ tự | Màn hình | Phụ thuộc | Rủi ro |
|--------|----------|-----------|--------|
| 16 | Seller product list | Seller role | Clarify role assignment trước |
| 17 | Product form + VariantBuilder | Media upload | Logic SKU generation phức tạp |
| 18 | Media upload component | `/media/upload` | Cần test S3 config |
| 19 | Seller order management | Clarify seller order endpoints trước | **Endpoint chưa rõ** |

### Phase 4 — Advanced Features

| Thứ tự | Màn hình | Ghi chú |
|--------|----------|---------|
| 20 | 2FA setup/disable | Cần QR code library |
| 21 | Chat inbox | Clarify scope WebSocket |
| 22 | Payment notification (real-time) | WebSocket `/payment` |
| 23 | Review & Rating | **Cần backend implement trước** |
| 24 | Đa ngôn ngữ UI | Clarify default language + form nhập |

### Rủi ro kỹ thuật cần xử lý sớm

1. **Token refresh race condition** — nhiều request đồng thời khi token hết hạn → cần queue/interceptor đúng cách
2. **VariantBuilder → SKU auto-generate** — logic tổ hợp cartesian phức tạp, test kỹ trước khi implement
3. **WebSocket auth** — token truyền qua handshake, cần wrapper cho reconnect logic
4. **File upload UX** — presigned URL (S3 direct) vs multipart route — chọn một chiến lược nhất quán
5. **Permission system** — UI navigation phải ẩn/hiện menu theo role; cần `GET /profile` để lấy permissions ngay sau login

---

*Tài liệu được tổng hợp từ phân tích code tại `src/routes/`, `prisma/schema.prisma`, `src/shared/`, và `src/websockets/`. Các mục đánh dấu "suy luận" hoặc "chưa rõ" cần xác nhận với backend team trước khi build UI.*
