# Worker API Spec (Updated)

Tài liệu mô tả các API liên quan trực tiếp tới luồng **Worker** theo implementation hiện tại trong codebase.

Cập nhật lần cuối: **2026-03-05**

## 1) Thông tin chung

- Base URL: `/api/v1`
- Auth: Bearer JWT (`Authorization: Bearer <token>`)
- Response wrapper chuẩn:

```json
{
  "message": "string",
  "status_code": 200,
  "data": {}
}
```

---

## 2) Schema chính

### 2.1 WorkerProfileDTO

```json
{
  "id": "guid",
  "userId": "guid",
  "fullName": "string",
  "ageRange": "string",
  "primaryLocation": "string",
  "travelRadiusKmPreference": 10.5,
  "experienceLevelId": 2,
  "experienceLevel": "string",
  "averageRating": 4.5,
  "availabilitySchedule": "string",
  "totalJobsCompleted": 12,
  "avatarUrl": "string",
  "createdAt": "2026-03-03T08:00:00Z",
  "updatedAt": "2026-03-03T08:00:00Z"
}
```

### 2.2 UpdateWorkerProfileRequest

```json
{
  "fullName": "Nguyen Van A",
  "ageRange": "18-25",
  "primaryLocation": "Can Tho",
  "travelRadiusKmPreference": 15,
  "experienceLevelId": 2,
  "availabilitySchedule": "Mon-Fri 08:00-17:00",
  "avatarUrl": "https://..."
}
```

Validation chính:

- `fullName`: required, max 256
- `ageRange`: required, max 50
- `primaryLocation`: required
- `travelRadiusKmPreference`: optional
- `experienceLevelId`: required, range 1..3
- `availabilitySchedule`: required
- `avatarUrl`: required

### 2.3 WorkerAttendanceDTO

```json
{
  "id": "guid",
  "jobApplicationId": "guid",
  "workDate": "2026-03-03T00:00:00Z",
  "checkInTime": "2026-03-03T01:00:00Z",
  "checkInNotes": "string | null",
  "checkOutTime": "2026-03-03T10:00:00Z | null",
  "checkOutNotes": "string | null",
  "totalHoursWorked": 9.0,
  "isApproved": true,
  "approvedBy": "guid | null",
  "approvedAt": "2026-03-03T10:10:00Z | null",
  "createdAt": "2026-03-03T01:00:00Z",
  "updatedAt": "2026-03-03T10:10:00Z | null"
}
```

### 2.4 CheckInRequest

```json
{
  "jobApplicationId": "guid",
  "checkInTime": "2026-03-03T08:00:00Z",
  "checkInNotes": "Đến sớm"
}
```

Validation chính:

- `jobApplicationId`: required
- `checkInTime`: required
- `checkInNotes`: optional, max 500

### 2.5 CheckOutRequest

```json
{
  "attendanceId": "guid",
  "checkOutTime": "2026-03-03T17:00:00Z",
  "checkOutNotes": "Hoàn thành công việc"
}
```

Validation chính:

- `attendanceId`: required
- `checkOutTime`: required
- `checkOutNotes`: optional, max 500

### 2.6 ApproveAttendanceRequest (Farmer dùng)

```json
{
  "attendanceId": "guid",
  "approvedBy": "guid",
  "adjustedHours": 8.5
}
```

Validation chính:

- `attendanceId`: required
- `approvedBy`: required
- `adjustedHours`: optional

### 2.7 LoginResponse

```json
{
  "token": "jwt-token",
  "expiresAt": "2026-03-04T01:00:00Z",
  "email": "worker@example.com"
}
```

---

## 3) Worker Profile APIs

### 3.1 GET `/worker-profile/{userId}`

Mục đích:

- Lấy profile worker theo `userId`.
- Chỉ worker sở hữu profile đó được truy cập.

Auth/Role:

- `Authorize(Roles = "Worker")`

Path params:

- `userId` (guid, required)

Response:

- `200`: `ApiResponse<WorkerProfileDTO>`
- `403`: `ApiResponse<object>` (userId route không khớp claim `NameIdentifier`)
- `500`: `ApiResponse<object>`

### 3.2 PUT `/worker-profile/{userId}`

Mục đích:

- Tạo profile lần đầu hoặc cập nhật profile hiện có.
- Chỉ worker sở hữu profile đó được cập nhật.

Auth/Role:

- `Authorize(Roles = "Worker")`

Path params:

- `userId` (guid, required)

Request body:

- `UpdateWorkerProfileRequest`

Response:

- `200`: `ApiResponse<WorkerProfileDTO>`
- `400`: `ApiResponse<object>` (ModelState invalid)
- `403`: `ApiResponse<object>` (userId route không khớp claim `NameIdentifier`)
- `500`: `ApiResponse<object>`

---

## 4) Worker Attendance APIs (Worker thao tác)

### 4.1 POST `/attendance/check-in`

Mục đích:

- Worker check-in cho công việc đủ điều kiện.

Auth/Role:

- `Authorize(Roles = "Worker")`

Request body:

- `CheckInRequest`

Response:

- `200`: `ApiResponse<WorkerAttendanceDTO>`
- `400`: `ApiResponse<object>` (ModelState invalid)
- `403`: `ApiResponse<object>` (thiếu/không hợp lệ claim `WorkerProfileId`)
- `500`: `ApiResponse<object>`

### 4.2 PUT `/attendance/check-out`

Mục đích:

- Worker check-out cho bản ghi attendance đã check-in.

Auth/Role:

- `Authorize(Roles = "Worker")`

Request body:

- `CheckOutRequest`

Response:

- `200`: `ApiResponse<WorkerAttendanceDTO>`
- `400`: `ApiResponse<object>` (ModelState invalid)
- `403`: `ApiResponse<object>` (thiếu/không hợp lệ claim `WorkerProfileId`)
- `500`: `ApiResponse<object>`

### 4.3 GET `/attendance/{id}`

Mục đích:

- Lấy chi tiết một bản ghi attendance.

Auth/Role:

- `Authorize(Roles = "Worker,Farmer")`

Path params:

- `id` (guid, required)

Response:

- `200`: `ApiResponse<WorkerAttendanceDTO>`
- `404`: `ApiResponse<object>` (không tìm thấy attendance)
- `500`: `ApiResponse<object>`

### 4.4 GET `/attendance/worker/{workerProfileId}`

Mục đích:

- Lấy lịch sử attendance của worker theo khoảng thời gian.
- Chỉ cho phép worker xem dữ liệu của chính mình.

Auth/Role:

- `Authorize(Roles = "Worker")`

Path params:

- `workerProfileId` (guid, required)

Query params:

- `startDate` (datetime, optional)
- `endDate` (datetime, optional)

Response:

- `200`: `ApiResponse<List<WorkerAttendanceDTO>>`
- `403`: `ApiResponse<object>` (route id không khớp claim `WorkerProfileId`)
- `500`: `ApiResponse<object>`

---

## 5) Attendance APIs liên quan Worker (Farmer thao tác)

### 5.1 PUT `/attendance/approve`

Mục đích:

- Farmer duyệt attendance của worker.

Auth/Role:

- `Authorize(Roles = "Farmer")`

Request body:

- `ApproveAttendanceRequest`

Response:

- `200`: `ApiResponse<WorkerAttendanceDTO>`
- `400`: `ApiResponse<object>` (ModelState invalid)
- `403`: `ApiResponse<object>` (thiếu/không hợp lệ claim `FarmerProfileId`)
- `500`: `ApiResponse<object>`

### 5.2 GET `/attendance/farm/{farmerProfileId}`

Mục đích:

- Farmer xem attendance records trong farm của mình.

Auth/Role:

- `Authorize(Roles = "Farmer")`

Path params:

- `farmerProfileId` (guid, required)

Query params:

- `jobPostId` (guid, optional)
- `startDate` (datetime, optional)
- `endDate` (datetime, optional)

Response:

- `200`: `ApiResponse<List<WorkerAttendanceDTO>>`
- `403`: `ApiResponse<object>` (route id không khớp claim `FarmerProfileId`)
- `500`: `ApiResponse<object>`

### 5.3 GET `/attendance/farm/{farmerProfileId}/worker/{workerProfileId}`

Mục đích:

- Farmer xem attendance của một worker cụ thể trong farm của mình.

Auth/Role:

- `Authorize(Roles = "Farmer")`

Path params:

- `farmerProfileId` (guid, required)
- `workerProfileId` (guid, required)

Query params:

- `startDate` (datetime, optional)
- `endDate` (datetime, optional)

Response:

- `200`: `ApiResponse<List<WorkerAttendanceDTO>>`
- `403`: `ApiResponse<object>` (route id không khớp claim `FarmerProfileId`)
- `404`: `ApiResponse<object>` (không có accepted applications giữa worker và farm)
- `500`: `ApiResponse<object>`

---

## 6) Auth APIs Worker sử dụng

### 6.1 POST `/login`

Mục đích:

- Đăng nhập bằng email hoặc phone number + password.

Request body (`LoginRequest`):

```json
{
  "email": "worker@example.com",
  "password": "123456"
}
```

Hoặc:

```json
{
  "phoneNumber": "0901234567",
  "password": "123456"
}
```

Validation chính:

- `password`: required
- Chỉ được truyền một trong hai: `email` hoặc `phoneNumber`

Response:

- `200`: `ApiResponse<LoginResponse>`
- `401`: `ApiResponse<object>`
- `500`: `ApiResponse<object>`

### 6.2 POST `/register`

Mục đích:

- Tạo tài khoản mới (Worker khi `roleId` tương ứng).

Request body (`RegisterRequest`):

```json
{
  "email": "worker@example.com",
  "password": "123456",
  "phoneNumber": "0901234567",
  "address": "Can Tho",
  "roleId": 3
}
```

Validation chính:

- `email`: required + email format
- `password`: required, min 6, max 100
- `phoneNumber`: required, phone format, max 10
- `address`: required
- `roleId`: required, range 1..3

Response:

- `201`: `ApiResponse<LoginResponse>`
- `400`: `ApiResponse<object>` (dữ liệu đăng ký không hợp lệ hoặc trùng)
- `500`: `ApiResponse<object>`

### 6.3 POST `/google-login`

Mục đích:

- Đăng nhập bằng Google ID token.

Request body (`GoogleLoginRequest`):

```json
{
  "googleToken": "google-id-token",
  "roleId": 3
}
```

Ghi chú:

- `roleId` là **optional**.

Response:

- `200`: `ApiResponse<LoginResponse>`
- `401`: `ApiResponse<object>`
- `500`: `ApiResponse<object>`

### 6.4 POST `/logout`

Mục đích:

- Logout và blacklist token hiện tại.

Auth/Role:

- `Authorize` (mọi user đã đăng nhập)

Request body:

- Không có.

Response:

- `200`: `ApiResponse<object>`
- `400`: `ApiResponse<object>` (token header không hợp lệ)
- `500`: `ApiResponse<object>`

---

## 7) Ghi chú nghiệp vụ quan trọng

- Attendance APIs yêu cầu claim tuỳ biến:
  - `WorkerProfileId` cho luồng worker
  - `FarmerProfileId` cho luồng farmer
- Thiếu hoặc sai các claim trên sẽ trả `403` dù role hợp lệ.
- Rule nghiệp vụ attendance trong service (có thể phát sinh lỗi logic trả về từ tầng service):
  - Check-in chỉ cho `JobApplication` hợp lệ.
  - Không check-in trùng ngày cho cùng job application.
  - Check-out phải sau check-in.
  - Farmer chỉ xem/duyệt attendance thuộc farm của chính mình.
