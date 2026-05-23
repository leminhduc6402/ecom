# 🧠 Prompt: Xây dựng AUTH UI (Admin + Client)

## 🎯 Mục tiêu

Xây dựng toàn bộ giao diện Authentication cho hệ thống gồm **hai luồng riêng biệt**:
- **Client App**: Giao diện người dùng cuối (đăng ký, đăng nhập, quên mật khẩu...)
- **Admin Dashboard**: Giao diện quản trị nội bộ (đăng nhập admin, bảo mật 2FA...)

---

## 🛠️ Tech Stack

| Thư viện | Mục đích |
|---|---|
| ReactJS + TypeScript | Framework & type safety |
| TailwindCSS | Styling utility-first |
| Ant Design (antd) | UI components (Form, Input, Button, Modal...) |
| Zod | Schema validation |
| TanStack Query (`@tanstack/react-query`) | Server state, mutations, caching |
| React Router v6 | Routing & navigation (nếu chưa có, dùng cái này) |
| lodash | Utility functions (debounce, pick, omit...) |

---

## ⚙️ Cấu hình chung

```typescript
// Tất cả API call đều gọi đến:
const BASE_URL = 'http://localhost:3000'

// Token sau khi login được lưu vào localStorage:
localStorage.setItem('accessToken', token)
localStorage.setItem('refreshToken', token)

// Mỗi request cần header:
Authorization: `Bearer ${accessToken}`
```

---

## 📁 Cấu trúc thư mục gợi ý

```
src/
├── api/
│   └── auth.api.ts          # Tất cả các hàm gọi API auth
├── hooks/
│   └── useAuth.ts           # Custom hook cho auth state
├── schemas/
│   └── auth.schema.ts       # Zod schemas cho tất cả form
├── pages/
│   ├── client/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── ForgotPasswordPage.tsx
│   │   └── OtpVerifyPage.tsx
│   └── admin/
│       ├── AdminLoginPage.tsx
│       └── TwoFactorSetupPage.tsx
├── components/
│   └── auth/
│       ├── LoginForm.tsx
│       ├── RegisterForm.tsx
│       ├── OtpInput.tsx
│       └── TwoFactorForm.tsx
└── router/
    ├── ClientRouter.tsx
    └── AdminRouter.tsx
```

---

## 🌐 API Endpoints — Module AUTH

Dưới đây là toàn bộ các endpoint cần tích hợp:

### 1. `POST /auth/register`
**Mô tả**: Đăng ký tài khoản mới (Client).

**Request body** *(tự suy luận các trường hợp lý)*:
```typescript
{
  name: string        // Họ tên
  email: string       // Email hợp lệ
  password: string    // Tối thiểu 6 ký tự
  confirmPassword: string
}
```

**Zod schema**:
```typescript
const RegisterSchema = z.object({
  name: z.string().min(2, 'Tên tối thiểu 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
})
```

**UI**: Form đăng ký với Ant Design `Form` + `Input` + `Button`. Sau khi register thành công → redirect sang trang OTP verify.

---

### 2. `POST /auth/otp`
**Mô tả**: Xác minh OTP (gửi qua email sau khi đăng ký hoặc quên mật khẩu).

**Request body**:
```typescript
{
  email: string
  otp: string   // 6 chữ số
  type: 'REGISTER' | 'FORGOT_PASSWORD'
}
```

**Zod schema**:
```typescript
const OtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, 'OTP phải là 6 chữ số'),
  type: z.enum(['REGISTER', 'FORGOT_PASSWORD']),
})
```

**UI**: 6 ô input tách biệt (OTP input group), tự động focus sang ô tiếp theo khi nhập. Có nút "Gửi lại OTP" với countdown 60 giây (dùng `lodash` debounce cho nút resend).

---

### 3. `POST /auth/login`
**Mô tả**: Đăng nhập (dùng cho cả Client và Admin — phân biệt bằng role trả về).

**Request body**:
```typescript
{
  email: string
  password: string
  totpCode?: string  // Bắt buộc nếu user đã bật 2FA
}
```

**Response** *(lưu vào localStorage)*:
```typescript
{
  accessToken: string
  refreshToken: string
  user: {
    id: number
    name: string
    email: string
    role: { name: 'Admin' | 'Client' | ... }
  }
}
```

**Zod schema**:
```typescript
const LoginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
  totpCode: z.string().optional(),
})
```

**TanStack Query mutation**:
```typescript
const loginMutation = useMutation({
  mutationFn: (data: LoginInput) =>
    fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(res => res.json()),
  onSuccess: (data) => {
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    // Redirect theo role
    if (data.user.role.name === 'Admin') navigate('/admin/dashboard')
    else navigate('/')
  },
})
```

**UI (Client)**: Form login đơn giản, có link "Quên mật khẩu" và nút "Đăng nhập với Google".
**UI (Admin)**: Form login minimalist, dark/neutral tone, không có Google login.

---

### 4. `POST /auth/refresh-token`
**Mô tả**: Làm mới `accessToken` bằng `refreshToken` khi token hết hạn.

**Request body**:
```typescript
{
  refreshToken: string
}
```

**Cách dùng**: Tạo một **Axios interceptor** hoặc **fetch wrapper** để tự động gọi endpoint này khi API trả về `401 Unauthorized`, rồi retry request gốc.

```typescript
// Ví dụ pattern:
async function fetchWithAuth(url: string, options: RequestInit) {
  const accessToken = localStorage.getItem('accessToken')
  const res = await fetch(url, {
    ...options,
    headers: { ...options.headers, Authorization: `Bearer ${accessToken}` },
  })
  if (res.status === 401) {
    const refreshToken = localStorage.getItem('refreshToken')
    const refreshRes = await fetch(`${BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }).then(r => r.json())
    localStorage.setItem('accessToken', refreshRes.accessToken)
    // Retry request gốc
    return fetch(url, {
      ...options,
      headers: { Authorization: `Bearer ${refreshRes.accessToken}` },
    })
  }
  return res
}
```

---

### 5. `POST /auth/logout`
**Mô tả**: Đăng xuất, xóa token khỏi localStorage.

**Request body**:
```typescript
{
  refreshToken: string
}
```

**UI**: Nút Logout ở header/sidebar. Sau logout → xóa `localStorage` → redirect về trang login.

---

### 6. `GET /auth/google-link`
**Mô tả**: Lấy URL để redirect người dùng sang Google OAuth.

**Cách dùng**:
```typescript
// Gọi API lấy link rồi redirect browser:
const { data } = await fetch(`${BASE_URL}/auth/google-link`).then(r => r.json())
window.location.href = data.url
```

**UI**: Nút "Đăng nhập với Google" (chỉ trên Client app), dùng Ant Design `Button` với Google icon.

---

### 7. `GET /auth/google/callback`
**Mô tả**: Backend xử lý callback từ Google OAuth, trả về token. Frontend chỉ cần handle redirect URL này.

**Cách dùng**: Tạo một route `/auth/google/callback` ở frontend, lấy token từ query params rồi lưu vào localStorage.

```typescript
// Trong component GoogleCallbackPage:
const [searchParams] = useSearchParams()
const accessToken = searchParams.get('accessToken')
const refreshToken = searchParams.get('refreshToken')
if (accessToken) {
  localStorage.setItem('accessToken', accessToken)
  localStorage.setItem('refreshToken', refreshToken ?? '')
  navigate('/')
}
```

---

### 8. `POST /auth/forgot-password`
**Mô tả**: Gửi OTP về email để đặt lại mật khẩu.

**Request body**:
```typescript
{
  email: string
}
```

**Zod schema**:
```typescript
const ForgotPasswordSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
})
```

**Flow UI**:
1. Nhập email → gọi API → hiển thị thông báo "OTP đã được gửi"
2. Redirect sang trang OTP verify (type = `FORGOT_PASSWORD`)
3. Sau OTP verify thành công → hiển thị form đặt mật khẩu mới

---

### 9. `POST /auth/2fa/setup`
**Mô tả**: Thiết lập xác thực 2 yếu tố (TOTP — Google Authenticator).

**Headers**: Cần `Authorization: Bearer {accessToken}`

**Response**:
```typescript
{
  secret: string      // Secret key thủ công
  uri: string         // otpauth:// URI để generate QR code
}
```

**UI**:
- Hiển thị QR code (dùng thư viện `qrcode.react`)
- Hiển thị secret key để nhập thủ công
- Ô nhập mã TOTP 6 số để xác nhận đã setup thành công
- Chỉ hiển thị trong phần **Profile Settings** sau khi đã login

---

### 10. `POST /auth/2fa/disable`
**Mô tả**: Tắt xác thực 2 yếu tố.

**Headers**: Cần `Authorization: Bearer {accessToken}`

**Request body**:
```typescript
{
  totpCode: string   // Mã TOTP hiện tại để xác nhận
  password: string   // Mật khẩu hiện tại để xác nhận
}
```

**UI**: Nút "Tắt 2FA" trong Profile Settings, khi click mở Modal xác nhận yêu cầu nhập mã TOTP + mật khẩu.

---

## 🔐 Protected Routes

```typescript
// Tạo 2 loại wrapper:

// 1. ClientRoute: Chỉ cho phép user đã login
<ClientRoute> → redirect về /login nếu chưa có token

// 2. AdminRoute: Chỉ cho phép admin
<AdminRoute> → redirect về /admin/login nếu không có token hoặc role !== 'Admin'
```

---

## 🎨 UI/UX Yêu cầu

### Client App
- Giao diện sáng, thân thiện, responsive (mobile-first)
- Logo/brand ở đầu trang
- Form căn giữa màn hình với card shadow
- Hiển thị lỗi inline dưới từng field (dùng Ant Design Form error)
- Loading spinner khi đang gọi API (dùng `isPending` từ TanStack Query)
- Toast notification khi thành công/thất bại (dùng Ant Design `message`)

### Admin Dashboard
- Giao diện neutral/dark, professional
- Sidebar layout sau khi login
- Trang login full-screen với form ở giữa

---

## 🧩 Pattern Code chuẩn cần áp dụng

### 1. API function (auth.api.ts)
```typescript
export const authApi = {
  login: (body: LoginInput) =>
    fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(res => {
      if (!res.ok) throw res
      return res.json()
    }),

  register: (body: RegisterInput) => ...,
  logout: (refreshToken: string) => ...,
  // ... các hàm khác
}
```

### 2. TanStack Query mutation trong component
```typescript
const mutation = useMutation({
  mutationFn: authApi.login,
  onSuccess: (data) => { /* handle success */ },
  onError: (err) => { /* handle error */ },
})
```

### 3. Zod + Ant Design Form
```typescript
// Dùng react-hook-form HOẶC Ant Design Form built-in
// Validate bằng Zod resolver (nếu dùng react-hook-form)
// Hoặc dùng Ant Design Form rules kết hợp Zod .safeParse() thủ công
```

### 4. lodash usage
```typescript
import { debounce, omit, pick } from 'lodash'

// Debounce nút resend OTP:
const handleResend = debounce(() => {
  mutation.mutate({ email, type: 'REGISTER' })
}, 1000)

// Loại bỏ confirmPassword trước khi gửi API:
const payload = omit(formData, ['confirmPassword'])
```

---

## ✅ Checklist hoàn thành

- [ ] Trang Register (Client) + Zod validation
- [ ] Trang OTP Verify (Client) — dùng sau Register & ForgotPassword
- [ ] Trang Login (Client) + Google OAuth button
- [ ] Trang Forgot Password (Client)
- [ ] Google OAuth callback handler
- [ ] Trang Login (Admin)
- [ ] Token lưu localStorage + auto refresh khi 401
- [ ] Protected routes (Client + Admin)
- [ ] 2FA Setup UI (trong Profile Settings)
- [ ] 2FA Disable UI (trong Profile Settings)
- [ ] Logout
- [ ] Loading states + Error handling toàn bộ form
