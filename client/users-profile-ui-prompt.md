# 🧠 Prompt: Xây dựng UI — Module USERS & PROFILE

> **Lưu ý**: Prompt này là phần tiếp theo của module AUTH.
> Giữ nguyên toàn bộ cấu hình chung (BASE_URL, localStorage token, fetch wrapper, Protected Routes) đã thiết lập ở prompt trước.

---

## 🎯 Phạm vi module này

| Module | Ai dùng | Chức năng |
|---|---|---|
| **USERS** | Admin only | CRUD danh sách user, tìm kiếm, phân trang |
| **PROFILE** | Client + Admin | Xem/sửa thông tin cá nhân, đổi mật khẩu, upload avatar |

---

## 📁 Bổ sung cấu trúc thư mục

```
src/
├── api/
│   ├── user.api.ts           # Gọi API /users (Admin)
│   └── profile.api.ts        # Gọi API /profile (Client + Admin)
├── schemas/
│   ├── user.schema.ts        # Zod schema cho CRUD user
│   └── profile.schema.ts     # Zod schema cho update profile & change password
├── types/
│   └── user.type.ts          # TypeScript interfaces: User, Profile, Role...
├── pages/
│   ├── admin/
│   │   ├── UsersPage.tsx         # Danh sách user (table + search + pagination)
│   │   ├── UserCreatePage.tsx    # Tạo user mới
│   │   ├── UserEditPage.tsx      # Chỉnh sửa user
│   │   └── AdminProfilePage.tsx  # Profile của admin
│   └── client/
│       └── ClientProfilePage.tsx # Profile của client
├── components/
│   └── users/
│       ├── UserTable.tsx         # Ant Design Table component
│       ├── UserForm.tsx          # Form dùng chung cho Create + Edit
│       ├── UserDeleteModal.tsx   # Modal xác nhận xoá
│       └── AvatarUpload.tsx      # Component upload avatar (presigned URL)
```

---

## 👤 TypeScript Interfaces

```typescript
// types/user.type.ts

export interface Role {
  id: number
  name: string
  description: string
}

export interface User {
  id: number
  name: string
  email: string
  phoneNumber?: string
  avatar?: string          // URL ảnh avatar
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED'
  role: Role
  createdAt: string
  updatedAt: string
}

export interface Profile extends Omit<User, 'role'> {
  role: Role
  isTotpEnabled: boolean   // Trạng thái 2FA
}

// Pagination wrapper (chuẩn cho toàn hệ thống)
export interface PaginatedResponse<T> {
  data: T[]
  totalItems: number
  page: number
  limit: number
  totalPages: number
}
```

---

## 🌐 API Endpoints — Module USERS (Admin only)

> Tất cả endpoint `/users` đều yêu cầu:
> `Authorization: Bearer {accessToken}` + Role = Admin

---

### 1. `GET /users` — Danh sách user

**Query params** *(tự suy luận)*:
```typescript
{
  page?: number       // mặc định: 1
  limit?: number      // mặc định: 10
  search?: string     // tìm theo name hoặc email
  roleId?: number     // lọc theo role
  status?: 'ACTIVE' | 'INACTIVE' | 'BLOCKED'
}
```

**TanStack Query**:
```typescript
const { data, isLoading } = useQuery({
  queryKey: ['users', { page, limit, search, roleId, status }],
  queryFn: () => userApi.getList({ page, limit, search, roleId, status }),
  placeholderData: keepPreviousData, // giữ data cũ khi chuyển trang
})
```

**UI — `UsersPage.tsx`**:
- Ant Design `Table` với các cột: Avatar, Tên, Email, Số điện thoại, Role (Tag màu), Status (Badge), Ngày tạo, Actions
- Thanh tìm kiếm phía trên (dùng `lodash.debounce` 400ms cho input search để không gọi API liên tục)
- Dropdown lọc theo Role và Status
- Phân trang dùng Ant Design `Pagination` (controlled)
- Nút "Thêm user mới" góc trên bên phải → navigate sang `UserCreatePage`
- Cột Actions: nút Edit (icon) → navigate `UserEditPage`, nút Delete (icon đỏ) → mở `UserDeleteModal`

```typescript
// Debounce search với lodash
import { debounce } from 'lodash'

const handleSearch = debounce((value: string) => {
  setSearch(value)
  setPage(1) // reset về trang 1 khi search
}, 400)
```

---

### 2. `GET /users/:userId` — Chi tiết một user

**TanStack Query**:
```typescript
const { data: user, isLoading } = useQuery({
  queryKey: ['users', userId],
  queryFn: () => userApi.getById(userId),
  enabled: !!userId,
})
```

**UI**: Dùng trong `UserEditPage` để pre-fill form trước khi chỉnh sửa.

---

### 3. `POST /users` — Tạo user mới

**Request body**:
```typescript
{
  name: string
  email: string
  password: string
  phoneNumber?: string
  avatar?: string    // URL sau khi upload xong
  roleId: number
  status?: 'ACTIVE' | 'INACTIVE'
}
```

**Zod schema**:
```typescript
// schemas/user.schema.ts
export const CreateUserSchema = z.object({
  name: z.string().min(2, 'Tên tối thiểu 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
  phoneNumber: z.string().optional(),
  avatar: z.string().url().optional(),
  roleId: z.number({ required_error: 'Vui lòng chọn role' }),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
})

export type CreateUserInput = z.infer<typeof CreateUserSchema>
```

**TanStack Query mutation**:
```typescript
const createMutation = useMutation({
  mutationFn: userApi.create,
  onSuccess: () => {
    message.success('Tạo user thành công')
    queryClient.invalidateQueries({ queryKey: ['users'] })
    navigate('/admin/users')
  },
  onError: () => message.error('Tạo user thất bại'),
})
```

**UI — `UserCreatePage.tsx`**:
- Dùng chung component `UserForm` với prop `mode="create"`
- Ant Design `Form` với các field: Họ tên, Email, Mật khẩu, Số điện thoại, Role (Select fetch từ `GET /roles`), Status (Select), Avatar (component `AvatarUpload`)
- Nút "Lưu" + nút "Huỷ" (quay lại danh sách)

---

### 4. `PUT /users/:userId` — Chỉnh sửa user

**Request body**: Tương tự `POST /users` nhưng không bắt buộc `password`

```typescript
export const UpdateUserSchema = z.object({
  name: z.string().min(2, 'Tên tối thiểu 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6).optional().or(z.literal('')), // tuỳ chọn khi edit
  phoneNumber: z.string().optional(),
  avatar: z.string().url().optional(),
  roleId: z.number({ required_error: 'Vui lòng chọn role' }),
  status: z.enum(['ACTIVE', 'INACTIVE', 'BLOCKED']),
})

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>
```

**TanStack Query mutation**:
```typescript
const updateMutation = useMutation({
  mutationFn: ({ id, data }: { id: number; data: UpdateUserInput }) =>
    userApi.update(id, data),
  onSuccess: () => {
    message.success('Cập nhật user thành công')
    queryClient.invalidateQueries({ queryKey: ['users'] })
    navigate('/admin/users')
  },
})
```

**UI — `UserEditPage.tsx`**:
- Dùng chung component `UserForm` với prop `mode="edit"`
- Pre-fill toàn bộ data từ `GET /users/:userId`
- Field password để trống mặc định, chỉ gửi lên nếu admin có nhập
- Skeleton loading khi đang fetch data user

---

### 5. `DELETE /users/:userId` — Xoá user

**TanStack Query mutation**:
```typescript
const deleteMutation = useMutation({
  mutationFn: userApi.delete,
  onSuccess: () => {
    message.success('Đã xoá user')
    queryClient.invalidateQueries({ queryKey: ['users'] })
  },
})
```

**UI — `UserDeleteModal.tsx`**:
- Ant Design `Modal` confirm với icon cảnh báo
- Hiển thị tên + email của user sắp xoá
- Nút "Xoá" màu đỏ (`danger`) + nút "Huỷ"
- Loading state khi đang gọi API

---

## 🌐 API Endpoints — Module PROFILE (Client + Admin)

> Tất cả endpoint `/profile` đều yêu cầu:
> `Authorization: Bearer {accessToken}`

---

### 6. `GET /profile` — Lấy thông tin cá nhân

**TanStack Query**:
```typescript
const { data: profile, isLoading } = useQuery({
  queryKey: ['profile'],
  queryFn: profileApi.getMe,
  staleTime: 5 * 60 * 1000, // cache 5 phút
})
```

**UI**:
- Hiển thị avatar (tròn, fallback chữ cái đầu tên nếu chưa có ảnh)
- Thông tin: Tên, Email (readonly), Số điện thoại, Role (Badge)
- Badge trạng thái 2FA (Bật/Tắt) với link sang trang cài đặt 2FA
- Skeleton loading khi fetch lần đầu

---

### 7. `PUT /profile` — Cập nhật thông tin cá nhân

**Request body**:
```typescript
{
  name: string
  phoneNumber?: string
  avatar?: string    // URL sau khi upload presigned URL
}
```

**Zod schema**:
```typescript
// schemas/profile.schema.ts
export const UpdateProfileSchema = z.object({
  name: z.string().min(2, 'Tên tối thiểu 2 ký tự'),
  phoneNumber: z.string()
    .regex(/^[0-9]{9,11}$/, 'Số điện thoại không hợp lệ')
    .optional()
    .or(z.literal('')),
  avatar: z.string().url().optional(),
})

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>
```

**TanStack Query mutation**:
```typescript
const updateProfileMutation = useMutation({
  mutationFn: profileApi.update,
  onSuccess: () => {
    message.success('Cập nhật thành công')
    queryClient.invalidateQueries({ queryKey: ['profile'] })
  },
})
```

**UI**:
- Form inline trên trang Profile, không tách trang riêng
- Nút "Chỉnh sửa" → chuyển form sang mode editable
- Nút "Lưu thay đổi" + "Huỷ"
- Avatar có nút camera overlay để trigger upload

---

### 8. `PUT /profile/change-password` — Đổi mật khẩu

**Request body**:
```typescript
{
  currentPassword: string
  newPassword: string
  confirmNewPassword: string  // chỉ validate ở FE, không gửi lên
}
```

**Zod schema**:
```typescript
export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
  newPassword: z.string().min(6, 'Mật khẩu mới tối thiểu 6 ký tự'),
  confirmNewPassword: z.string(),
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmNewPassword'],
}).refine(data => data.currentPassword !== data.newPassword, {
  message: 'Mật khẩu mới phải khác mật khẩu hiện tại',
  path: ['newPassword'],
})

export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>
```

**TanStack Query mutation**:
```typescript
const changePasswordMutation = useMutation({
  mutationFn: ({ currentPassword, newPassword }: Omit<ChangePasswordInput, 'confirmNewPassword'>) =>
    profileApi.changePassword({ currentPassword, newPassword }),
  onSuccess: () => {
    message.success('Đổi mật khẩu thành công')
    form.resetFields()
  },
  onError: () => message.error('Mật khẩu hiện tại không đúng'),
})
```

**UI**: Section riêng trong trang Profile, collapsible hoặc tab riêng "Bảo mật".

---

## 🖼️ Upload Avatar — Presigned URL Flow

> Dùng chung cho cả `UserForm` (Admin tạo/sửa user) và `ProfilePage` (Client/Admin sửa profile)

**Component `AvatarUpload.tsx`**:

```typescript
// Luồng upload 2 bước:
// Bước 1: Gọi POST /media/images/upload/presigned-url → nhận { url, fields }
// Bước 2: PUT/POST trực tiếp lên presigned URL với file binary
// Bước 3: Lưu URL ảnh công khai vào form field `avatar`

const handleUpload = async (file: File) => {
  // 1. Lấy presigned URL
  const { url, fields, publicUrl } = await mediaApi.getPresignedUrl({
    filename: file.name,
    contentType: file.type,
  })

  // 2. Upload file lên storage (S3/R2/GCS...)
  const formData = new FormData()
  Object.entries(fields).forEach(([k, v]) => formData.append(k, v as string))
  formData.append('file', file)
  await fetch(url, { method: 'POST', body: formData })

  // 3. Cập nhật giá trị avatar trong form
  form.setFieldValue('avatar', publicUrl)
}
```

**UI**:
- Ant Design `Upload` component với `listType="picture-circle"`
- Preview avatar realtime sau khi chọn file
- Giới hạn: chỉ nhận `image/jpeg`, `image/png`, `image/webp`, tối đa 2MB
- Validate file trước khi upload (dùng `beforeUpload`)
- Loading spinner trong lúc upload
- Hiển thị lỗi nếu upload thất bại

```typescript
const beforeUpload = (file: File) => {
  const isImage = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isImage) message.error('Chỉ chấp nhận file ảnh JPG/PNG/WEBP')
  if (!isLt2M) message.error('Ảnh phải nhỏ hơn 2MB')
  return false // Ngăn Ant Design tự upload, tự xử lý
}
```

---

## 🎨 UI/UX Chi tiết

### Admin — Trang Users (`/admin/users`)
- Layout: Sidebar + Content area
- Header trang: Tiêu đề "Quản lý người dùng" + nút "Thêm mới" (primary, góc phải)
- Table responsive, có `scroll={{ x: 1000 }}`
- Row hover highlight
- Status dùng Ant Design `Tag`: ACTIVE = xanh, INACTIVE = vàng, BLOCKED = đỏ
- Role dùng `Tag` màu khác nhau
- Empty state khi không có kết quả tìm kiếm

### Admin — Form Create/Edit User
- Layout 2 cột trên desktop (thông tin chính + avatar bên phải)
- Breadcrumb navigation: Người dùng → Thêm mới / Chỉnh sửa
- Nút "Lưu" disabled khi form chưa thay đổi (mode edit)
- Confirm dialog khi rời trang mà chưa lưu (`useBlocker` của React Router v6)

### Client/Admin — Trang Profile
- Layout card, chia 2 section:
  - **Section 1**: Thông tin cá nhân (avatar + form)
  - **Section 2 (Tab "Bảo mật")**: Đổi mật khẩu + trạng thái 2FA
- Avatar: hình tròn kích thước 100px, hover hiện icon camera
- Email hiển thị dạng readonly (không cho sửa)
- Responsive tốt trên mobile

---

## 🧩 API Functions — Mẫu code

```typescript
// api/user.api.ts
export const userApi = {
  getList: (params: GetUsersParams) =>
    fetchWithAuth(`${BASE_URL}/users?${new URLSearchParams(
      // Dùng lodash omitBy để bỏ qua các param undefined
      omitBy(params, isUndefined) as Record<string, string>
    )}`).then(r => r.json()),

  getById: (id: number) =>
    fetchWithAuth(`${BASE_URL}/users/${id}`).then(r => r.json()),

  create: (data: CreateUserInput) =>
    fetchWithAuth(`${BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  update: (id: number, data: UpdateUserInput) =>
    fetchWithAuth(`${BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      // Dùng lodash omit để loại bỏ trường rỗng trước khi gửi
      body: JSON.stringify(omitBy(data, v => v === '' || v === undefined)),
    }).then(r => r.json()),

  delete: (id: number) =>
    fetchWithAuth(`${BASE_URL}/users/${id}`, { method: 'DELETE' }),
}

// api/profile.api.ts
export const profileApi = {
  getMe: () =>
    fetchWithAuth(`${BASE_URL}/profile`).then(r => r.json()),

  update: (data: UpdateProfileInput) =>
    fetchWithAuth(`${BASE_URL}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    fetchWithAuth(`${BASE_URL}/profile/change-password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => r.json()),
}

// api/media.api.ts
export const mediaApi = {
  getPresignedUrl: (data: { filename: string; contentType: string }) =>
    fetchWithAuth(`${BASE_URL}/media/images/upload/presigned-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => r.json()),
}
```

---

## 🔗 Routing bổ sung

```typescript
// Admin routes
<Route path="/admin/users" element={<AdminRoute><UsersPage /></AdminRoute>} />
<Route path="/admin/users/create" element={<AdminRoute><UserCreatePage /></AdminRoute>} />
<Route path="/admin/users/:userId/edit" element={<AdminRoute><UserEditPage /></AdminRoute>} />
<Route path="/admin/profile" element={<AdminRoute><AdminProfilePage /></AdminRoute>} />

// Client routes
<Route path="/profile" element={<ClientRoute><ClientProfilePage /></ClientRoute>} />
```

---

## ✅ Checklist hoàn thành

### Module USERS (Admin)
- [ ] `UsersPage` — Table với search (debounce), filter role/status, phân trang
- [ ] `UserCreatePage` — Form tạo mới với `UserForm` component
- [ ] `UserEditPage` — Pre-fill data + form chỉnh sửa
- [ ] `UserDeleteModal` — Modal xác nhận xoá
- [ ] `UserForm` — Component dùng chung cho Create + Edit
- [ ] Fetch danh sách Role để populate Select dropdown
- [ ] Invalidate cache sau mỗi mutation (create/update/delete)

### Module PROFILE (Client + Admin)
- [ ] `ClientProfilePage` — Xem + sửa thông tin cá nhân
- [ ] `AdminProfilePage` — Tương tự nhưng layout admin
- [ ] Section đổi mật khẩu (tab "Bảo mật")
- [ ] Hiển thị trạng thái 2FA + link tới cài đặt 2FA (từ module AUTH)
- [ ] `AvatarUpload` component — presigned URL flow hoàn chỉnh

### Chung
- [ ] `mediaApi.getPresignedUrl` + upload lên storage
- [ ] TypeScript interfaces đầy đủ cho `User`, `Profile`, `Role`
- [ ] Zod schemas cho tất cả form
- [ ] Skeleton loading khi fetch data
- [ ] Empty state / Error state xử lý đầy đủ
- [ ] Responsive trên mobile (đặc biệt Table dùng `scroll`)
