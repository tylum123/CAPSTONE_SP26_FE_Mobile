# Worker API Spec (Updated)

Tài liệu mô tả các API liên quan trực tiếp tới luồng **Worker** theo implementation hiện tại trong codebase.

Cập nhật lần cuối: **2026-03-17**

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

### 2.4 CheckInRequest & CheckOutRequest

**CheckInRequest:**
```json
{
  "jobApplicationId": "guid",
  "checkInTime": "2026-03-03T08:00:00Z",
  "checkInNotes": "Đến sớm"
}
```
- `jobApplicationId`: required
- `checkInTime`: required
- `checkInNotes`: optional, max 500

**CheckOutRequest:**
```json
{
  "attendanceId": "guid",
  "checkOutTime": "2026-03-03T17:00:00Z",
  "checkOutNotes": "Hoàn thành công việc"
}
```
- `attendanceId`: required
- `checkOutTime`: required
- `checkOutNotes`: optional, max 500

### 2.5 ApproveAttendanceRequest (Farmer dùng)

```json
{
  "attendanceId": "guid",
  "approvedBy": "guid",
  "adjustedHours": 8.5
}
```

### 2.6 JobApplicationDTO & CreateJobApplicationRequest

**JobApplicationDTO:**
```json
{
  "id": "guid",
  "jobPostId": "guid",
  "workerId": "guid",
  "statusId": 1,
  "coverLetter": "string | null",
  "appliedAt": "2026-03-10T10:00:00Z",
  "respondedAt": "2026-03-12T10:00:00Z",
  "responseMessage": "string | null"
}
```

**CreateJobApplicationRequest:**
```json
{
  "jobPostId": "guid",
  "workerId": "guid",
  "statusId": 1,
  "coverLetter": "Tôi có kinh nghiệm...",
  "appliedAt": "2026-03-10T10:00:00Z",
  "respondedAt": "2026-03-10T10:00:00Z",
  "responseMessage": null
}
```

### 2.7 NotificationDTO

```json
{
  "id": "guid",
  "userId": "guid",
  "relatedEntityId": "guid | null",
  "type": 1,
  "typeName": "Info",
  "title": "New Job Available",
  "message": "A new job matching your profile was posted.",
  "isRead": false,
  "sentAt": "2026-03-15T08:00:00Z",
  "readAt": null
}
```

### 2.8 Auth Responses & Requests

**LoginResponse:**
```json
{
  "token": "jwt-token",
  "expiresAt": "2026-03-04T01:00:00Z",
  "email": "worker@example.com"
}
```

**ForgotPasswordRequest:**
```json
{
  "email": "worker@example.com"
}
```

**ResetPasswordRequest:**
```json
{
  "email": "worker@example.com",
  "otp": "123456",
  "newPassword": "newPassword123"
}
```

---

## 3) Worker Profile APIs

### 3.1 GET `/worker`
- **Mục đích**: Lấy profile worker của user hiện tại qua claim của token.
- **Auth/Role**: `Authorize(Roles = "Worker")`
- **Response**: `200 OK` (WorkerProfileDTO), `404 Not Found`

### 3.2 PUT `/worker`
- **Mục đích**: Tạo profile lần đầu hoặc cập nhật profile hiện có.
- **Auth/Role**: `Authorize(Roles = "Worker")`
- **Body**: `UpdateWorkerProfileRequest`
- **Response**: `200 OK` (WorkerProfileDTO), `400 Bad Request`

### 3.3 POST `/worker/upload-avatar`
- **Mục đích**: Upload avatar cho worker.
- **Auth**: `Authorize(Roles = "Worker")`
- **Body**: `multipart/form-data` chứa `IFormFile image`
- **Response**: `200 OK` (trả về URL của avatar dưới dạng string)

---

## 4) Worker Attendance APIs (Worker thao tác)

### 4.1 POST `/attendance/check-in`
- **Mục đích**: Worker check-in cho công việc.
- **Role**: `Worker`
- **Body**: `CheckInRequest`
- **Response**: `200 OK` (WorkerAttendanceDTO)

### 4.2 PUT `/attendance/check-out`
- **Mục đích**: Worker check-out cho bản ghi attendance đã check-in.
- **Role**: `Worker`
- **Body**: `CheckOutRequest`
- **Response**: `200 OK` (WorkerAttendanceDTO)

### 4.3 GET `/attendance/{id}`
- **Mục đích**: Lấy chi tiết một bản ghi attendance.
- **Role**: `Worker,Farmer`
- **Response**: `200 OK` (WorkerAttendanceDTO)

### 4.4 GET `/attendance/worker/{workerProfileId}`
- **Mục đích**: Lấy lịch sử attendance của worker theo khoảng thời gian. (Worker chỉ xem của mình).
- **Role**: `Worker`
- **Query params**: `startDate`, `endDate`
- **Response**: `200 OK` (List<WorkerAttendanceDTO>)

---

## 5) Attendance APIs liên quan Worker (Farmer thao tác)

### 5.1 PUT `/attendance/approve`
- **Mục đích**: Farmer duyệt attendance của worker.
- **Role**: `Farmer`
- **Body**: `ApproveAttendanceRequest`
- **Response**: `200 OK`

### 5.2 GET `/attendance/farm/{farmerProfileId}`
- **Mục đích**: Farmer xem attendance records trong farm của mình.
- **Role**: `Farmer`
- **Response**: `200 OK` (List<WorkerAttendanceDTO>)

### 5.3 GET `/attendance/farm/{farmerProfileId}/worker/{workerProfileId}`
- **Mục đích**: Farmer xem attendance của một worker cụ thể trong farm của mình.
- **Role**: `Farmer`
- **Response**: `200 OK` (List<WorkerAttendanceDTO>)

---

## 6) Job APIs (Worker thao tác & Tương tác)

### 6.1 GET `/job/post`
- **Mục đích**: Lấy tất cả job posts có sẵn (để worker tìm việc).
- **Response**: `200 OK` (List<JobPostDTO>)

### 6.2 GET `/job/post/{id}`
- **Mục đích**: Xem chi tiết 1 job post.
- **Response**: `200 OK` (JobPostDTO)

### 6.3 POST `/job/application`
- **Mục đích**: Worker nộp đơn ứng tuyển vào một Job Post.
- **Body**: `CreateJobApplicationRequest`
- **Response**: `200 OK` (JobApplicationDTO)

### 6.4 GET `/job/application`
- **Mục đích**: Lấy danh sách applications.
- **Response**: `200 OK` (List<JobApplicationDTO>)

### 6.5 GET `/job/application/{id}`
- **Mục đích**: Xem chi tiết application của mình.
- **Response**: `200 OK` (JobApplicationDTO)

---

## 7) Notification APIs (Worker & Farmer)

Tất cả APIs này đều yêu cầu user đăng nhập (`[Authorize]`).

### 7.1 GET `/notification`
- **Mục đích**: Lấy toàn bộ notifications của user hiện tại.
- **Response**: `200 OK` (List<NotificationDTO>)

### 7.2 GET `/notification/unread`
- **Mục đích**: Lấy các notifications chưa đọc.
- **Response**: `200 OK` (List<NotificationDTO>)

### 7.3 PATCH `/notification/read`
- **Mục đích**: Đánh dấu 1 notification là đã đọc.
- **Body**: `{ "notificationId": "guid" }`
- **Response**: `204 No Content`

### 7.4 PATCH `/notification/read-all`
- **Mục đích**: Đánh dấu tất cả notifications của user là đã đọc.
- **Response**: `204 No Content`

### 7.5 DELETE `/notification/{id}`
- **Mục đích**: Xoá 1 notification.
- **Response**: `204 No Content`

---

## 8) Auth APIs Worker sử dụng

### 8.1 POST `/login`
- Body: `{"email": "...", "password": "..."}` hoặc `phoneNumber`.
- Response: `200 OK` (LoginResponse)

### 8.2 POST `/register`
- Body: `RegisterRequest` (Kèm `roleId = 3` cho Worker).
- Response: `201 Created`

### 8.3 POST `/google-login`
- Body: `{"googleToken": "...", "roleId": 3}` (roleId optional).
- Response: `200 OK` (LoginResponse)

### 8.4 POST `/forget`
- **Mục đích**: Yêu cầu mã OTP để reset mật khẩu.
- Body: `ForgotPasswordRequest`
- Response: `200 OK`

### 8.5 POST `/reset`
- **Mục đích**: Đổi mật khẩu với mã OTP.
- Body: `ResetPasswordRequest`
- Response: `200 OK`

### 8.6 POST `/logout` (Yêu cầu `Authorize`)
- Mục đích: Đăng xuất và blacklist token.
- Response: `200 OK`

---

## 9) Ghi chú nghiệp vụ quan trọng

- Các path API đều tuân thủ `ApiEndpointConstants.cs` (Ví dụ `/api/v1/worker` thay vì `/api/v1/worker-profile`).
- WorkerProfile APIs (GET/PUT) loại bỏ `userId` từ Path Parameter, bảo vệ bằng cách phân giải JWT Token (Claims) để xác thực người dùng.
- Attendance APIs yêu cầu các claim đặc thù như `WorkerProfileId` hoặc `FarmerProfileId`.
- API Application Job có validate Role để đảm bảo đúng phân quyền ứng tuyển.
- Hệ thống Notification được tích hợp cho cả 2 luồng.

---

## 10) Đề xuất Cải thiện UI (Từ bên Mobile Frontend Developer / BA)

Để hỗ trợ hiển thị UI/UX hoàn chỉnh, đầy đủ thông tin cho người dùng mà không bị che khuất, Frontend có một số yêu cầu thêm vào Payload:

### 10.1 Xử Lý Cân Bằng UI Chức Năng Việc Nông Nghiệp & Khoán
- **Lưu ý:** Với công việc Nông nghiệp, chúng ta có **Theo Ngày** và **Theo Khoán**. Thời gian Check-in/Check-out chỉ dành để đo giờ cho Việc Ngày. Với Việc Khoán, người nông dân tính tiền theo Khối Lượng (VD: 1.5 Ha, 100Kg...).
- Do đó, `CheckOutRequest` và `WorkerAttendanceDTO` TẠI BACKEND CẦN BỔ SUNG TRƯỜNG: `completedAmount` (float/decimal). Khi Worker (Khoán) ấn Check-out, App sẽ bật Popup hỏi: *"Hôm nay bạn đã hoàn thành khối lượng bao nhiêu?"*
- Tương tự, `ApproveAttendanceRequest` (Farmer) cần thêm trường `adjustedAmount` để Farmer chốt số lượng trước khi trả lương gốc.

### 10.2 Tránh Gọi API N Lần (Hiệu suất UI)
1. **WorkerProfileDTO**: Cân nhắc thêm `phoneNumber`, `email`, `bio` hoặc `skills` nếu có, để hiển thị đầy đủ hơn trên trang cá nhân của worker mà không bị khuất hoặc bỏ trống mất thẩm mỹ.
2. **WorkerAttendanceDTO**: Bắt buộc thêm metadata của Job (`jobTitle`, `farmName`, `wageTypeId`) rả về cùng trong list lịch sử điểm danh. Frontend cần render thẻ Job có Tên, Nơi làm ngay ở màn hình Lịch Sử mà KHÔNG ĐƯỢC gọi thêm GET JobDetail cho 100 items riêng biệt.
3. **JobApplicationDTO**: Bắt buộc thêm metadata của JobPost (`title`, `location`, `wageAmount`, `farmName`, `wageTypeId`, v.v.) vào response list. Màn ứng tuyển Worker cần hiện thẳng số tiền và Tên việc để họ check lại danh sách công việc mình đang chờ duyệt.
4. **NotificationDTO**: Thêm cơ chế `actionUrl` / `relatedEntityId` + `type` vào payload của Push. Khi người dùng ấn vào Cảnh báo từ màn hình chính, Router sẽ chuyển họ thẳng vào Tab Chi Tiết thay vì ném ra màn Home rỗng tếch.

---

## 11) Yêu Cầu Backend cho Push Notification Real-time

Để tính năng thông báo có thể hoạt động ngay tức thời trên app (kể cả khi tắt app), Frontend đã cài đặt thư viện `expo-notifications` lấy **Device Push Token**. Backend cần chuẩn bị:
1. Mỗi khi User đăng nhập thành công vào app, app sẽ gọi API `POST /api/v1/notification/register-token` kèm body `{"token": "ExponentPushToken[xxx]"}`. Backend cần lưu lại chuỗi token này vào DB gắn liền với `userId`.
2. Khi có sự kiện (VD: duyệt điểm danh, tin nhắn mới, job được accept...), Backend dựa vào danh sách `Device Token` của User đó trên DB để **gọi POST request qua API của Expo** (`https://exp.host/--/api/v2/push/send`) gửi kèm payload `{ "to": "ExponentPushToken[xxx]", "title": "Tiêu đề", "body": "Nội dung", "data": {...} }`.
3. Expo Server sẽ tự động bắn sang APNs (Apple) và FCM (Android) để hiển thị thông báo popup về máy người dùng realtime.
