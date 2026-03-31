# Worker API Spec (Updated)

Tài liệu mô tả các API liên quan trực tiếp tới luồng **Worker** theo implementation hiện tại trong codebase.

Cập nhật lần cuối: **2026-03-31**

## 1) Thông trình chung

- Base URL: `/api/v1`
- Auth: Bearer JWT (`Authorization: Bearer <token>`)
- Response wrapper chuẩn:

```json
{
  "message": "string",
  "statusCode": 200,
  "data": {}
}
```
*(Lưu ý: Backend dùng `statusCode` thay vì `status_code`)*

---

## 2) Schema chính

### 2.1 WorkerProfileDTO

```json
{
  "id": "guid",
  "userId": "guid",
  "fullName": "string",
  "dateOfBirth": "1995-05-20T00:00:00Z",
  "primaryLocation": "string",
  "travelRadiusKmPreference": 10.5,
  "experienceLevelId": 2,
  "experienceLevel": "string",
  "averageRating": 4.5,
  "availabilitySchedule": "string",
  "totalJobsCompleted": 12,
  "avatarUrl": "string",
  "email": "worker@example.com",
  "phoneNumber": "0123456789",
  "createdAt": "2026-03-03T08:00:00Z",
  "updatedAt": "2026-03-03T08:00:00Z"
}
```

### 2.2 UpdateWorkerProfileRequest

```json
{
  "fullName": "Nguyen Van A",
  "dateOfBirth": "1995-05-20T00:00:00Z",
  "primaryLocation": "Can Tho",
  "travelRadiusKmPreference": 15.5,
  "experienceLevelId": 2,
  "availabilitySchedule": "Mon-Fri 08:00-17:00",
  "avatarUrl": "https://..."
}
```

Validation chính:
- `fullName`: required, max 256
- `dateOfBirth`: required, ISO Date string
- `primaryLocation`: required
- `travelRadiusKmPreference`: optional (double)
- `experienceLevelId`: required, range 1..3
- `availabilitySchedule`: required
- `avatarUrl`: required

### 2.3 JobDetailDTO (Daily Report)

```json
{
  "id": "guid",
  "jobApplicationId": "guid",
  "jobPostId": "guid",
  "workerId": "guid",
  "statusId": 1, 
  "workDate": "2026-03-03T00:00:00Z",
  "workerDescription": "Hôm nay tôi đã làm được 50kg...",
  "farmerFeedback": "Làm tốt",
  "farmerApprovedPercent": 100,
  "jobPrice": 500000,
  "workerPaymentAmount": 500000,
  "refundAmount": 0,
  "completedAt": "2026-03-03T18:00:00Z",
  "createdAt": "2026-03-03T17:00:00Z",
  "updatedAt": "2026-03-03T18:00:00Z"
}
```

### 2.4 CreateDailyReportRequest

```json
{
  "jobApplicationId": "guid",
  "workerDescription": "Hôm nay tôi đã làm được 50kg..."
}
```

### 2.5 ApproveJobDetailRequest (Farmer dùng)

```json
{
  "farmerApprovedPercent": 90,
  "farmerFeedback": "Ghi chú từ farmer..."
}
```

### 2.6 DisputeReportDTO (Appeal)

```json
{
  "id": "guid",
  "farmerId": "guid | null",
  "workerId": "guid | null",
  "jobPostId": "guid",
  "disputeTypeId": 1,
  "reason": "string",
  "description": "string | null",
  "evidenceUrl": "string | null",
  "statusId": 1,
  "adminNote": "string | null",
  "resolvedById": "guid | null",
  "createdAt": "2026-03-17T08:00:00Z",
  "resolvedAt": "2026-03-18T08:00:00Z | null"
}
```

### 2.7 CreateDisputeReportRequest

```json
{
  "jobPostId": "guid",
  "disputeTypeId": 1,
  "reason": "Lý do khiếu nại",
  "description": "Mô tả chi tiết",
  "evidenceUrl": "https://..."
}
```

### 2.8 JobPostDTO

```json
{
  "id": "guid",
  "farmerProfileId": "guid",
  "contactName": "string",
  "farmId": "guid",
  "jobCategoryId": "guid",
  "title": "string",
  "description": "string",
  "address": "string",
  "startDate": "yyyy-MM-dd",
  "endDate": "yyyy-MM-dd",
  "selectedDays": ["yyyy-MM-dd"],
  "startTime": "HH:mm:ss",
  "endTime": "HH:mm:ss",
  "workersNeeded": 10,
  "workersAccepted": 2,
  "jobTypeId": 1,
  "wageAmount": 500000,
  "requirements": ["string"],
  "privileges": ["string"],
  "jobSkillRequirements": [
    { "id": "guid", "name": "Bón phân" }
  ],
  "publishedAt": "ISO Date",
  "isUrgent": true,
  "statusId": 2
}
```

### 2.8.a JobDiscoveryDTO (Dùng cho Tìm kiếm/Nearby)

```json
{
  "id": "guid",
  "farmerProfileId": "guid",
  "contactName": "string",
  "jobSkillRequirements": [
    { "id": "guid", "name": "string" }
  ],
  "farmId": "guid",
  "jobCategoryId": "guid",
  "title": "string",
  "description": "string",
  "address": "string",
  "startDate": "yyyy-MM-dd",
  "endDate": "yyyy-MM-dd",
  "selectedDays": ["yyyy-MM-dd"],
  "startTime": "HH:mm:ss",
  "endTime": "HH:mm:ss",
  "workersNeeded": 10,
  "workersAccepted": 2,
  "jobTypeId": 1,
  "jobTypeName": "Daily",
  "wageAmount": 500000,
  "requirements": ["string"],
  "privileges": ["string"],
  "publishedAt": "ISO Date",
  "isUrgent": true,
  "statusId": 2,
  "distanceKm": 5.2,
  "farmerAverageRating": 4.8,
  "locationName": "string",
  "skillsMatchCount": 2,
  "allSkillsMatched": true,
  "availablePositions": 8,
  "durationDays": 5,
  "isUpcoming": true,
  "matchScore": 85,
  "similarJobsCompleted": 5
}
```

### 2.9 JobApplicationDTO & CreateJobApplicationRequest

**JobApplicationDTO:**
```json
{
  "id": "guid",
  "jobPostId": "guid",
  "jobPost": { ... }, // Object JobPost được nhúng kèm 
  "worker": { ... },  // Object WorkerProfileDTO
  "statusId": 1,
  "coverLetter": "string | null",
  "appliedAt": "2026-03-10T10:00:00Z",
  "respondedAt": "2026-03-12T10:00:00Z",
  "responseMessage": "string | null",
  "locationName": "string | null",
  "workDates": ["2026-03-24T00:00:00Z", "2026-03-25T00:00:00Z"]
}
```

**CreateJobApplicationRequest:**
```json
{
  "jobPostId": "guid",
  "statusId": 1,
  "coverLetter": "Tôi có kinh nghiệm...",
  "appliedAt": "2026-03-10T10:00:00Z",
  "respondedAt": "2026-03-10T10:00:00Z",
  "responseMessage": null,
  "workDates": ["2026-03-24T00:00:00Z", "2026-03-25T00:00:00Z"]
}
```

### 2.10 NotificationDTO

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

### 2.11 JobSearchFilterRequest

```json
{
  "workerLatitude": 10.5,
  "workerLongitude": 106.5,
  "maxDistanceKm": 20,
  "minWageAmount": 100000,
  "maxWageAmount": 1000000,
  "jobTypeId": 2,
  "jobCategoryId": "guid",
  "searchKeyword": "hái cà phê",
  "requiredSkills": ["skill1", "skill2"],
  "dateFilter": "today | tomorrow | weekend | upcoming",
  "startDateFrom": "ISO Date",
  "startDateTo": "ISO Date",
  "durationType": "Daily | PerJob | LongTerm",
  "paymentMethod": "string",
  "onlyUrgent": true,
  "minWorkerRating": 4.0,
  "pageNumber": 1,
  "pageSize": 10,
  "sortBy": "distance | wage | date"
}
```

### 2.12 PaginatedResponse

```json
{
  "jobs": [ { ...JobPostDTO... } ],
  "totalCount": 100,
  "pageNumber": 1,
  "pageSize": 10,
  "totalPages": 10,
  "hasPreviousPage": false,
  "hasNextPage": true,
  "message": "string"
}
```

### 2.13 Auth Responses & Requests

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

### 2.14 WalletDTO

```json
{
  "id": "guid",
  "userId": "guid",
  "balance": 1500000.0,
  "lockedBalance": 500000.0,
  "isActive": true
}
```

### 2.15 WithdrawalResponse

```json
{
  "id": "guid",
  "payoutId": "string",
  "amount": 200000.0,
  "status": "string",
  "approvalState": "string",
  "bankName": "string",
  "accountHolderName": "string",
  "bankAccountNumber": "string",
  "referenceCode": "string",
  "description": "string",
  "createdAt": "ISO Date",
  "processedAt": "ISO Date"
}
```

### 2.16 WithdrawalAccountBalanceResponse

```json
{
  "balance": 1500000,
  "availableBalance": 1000000,
  "currency": "VND"
}
```

### 2.17 SkillResponse

```json
{
  "id": "guid",
  "name": "string",
  "description": "string",
  "categoryId": 1,
  "isActive": true
}
```

### 2.18 RatingDTO

```json
{
  "id": "guid",
  "raterId": "guid",
  "rateeId": "guid",
  "jobPostId": "guid",
  "ratingScore": 5,
  "reviewText": "string",
  "typeId": 1,
  "createdAt": "ISO Date"
}
```

### 2.19 WeatherDTO

```json
{
  "city": "string",
  "country": "string",
  "latitude": 10.5,
  "longitude": 106.5,
  "temperature": 32.5,
  "feelsLike": 35.0,
  "tempMin": 30.0,
  "tempMax": 34.0,
  "humidity": 80,
  "windSpeed": 5.5,
  "description": "string",
  "icon": "01d",
  "iconUrl": "https://openweathermap.org/img/wn/01d@2x.png",
  "sunrise": "ISO Date",
  "sunset": "ISO Date",
  "fetchedAt": "ISO Date"
}
```

### 2.20 WalletTransactionDTO

```json
{
  "id": "guid",
  "walletId": "guid",
  "amount": 500000.0,
  "type": 3,
  "description": "string",
  "createdAt": "ISO Date"
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

## 4) Job Daily Report APIs (Worker thao tác)

Luồng mới: Worker không cần Check-in/Check-out. Worker tự tạo Báo Cáo Công Việc thông qua `JobDetail`.

### 4.1 POST `/JobDetail/report-daily`
- **Mục đích**: Worker tạo report hằng ngày.
- **Role**: `Worker`
- **Body**: `CreateDailyReportRequest`
- **Response**: `200 OK` (JobDetailDTO)

### 4.2 GET `/JobDetail/{id}`
- **Mục đích**: Lấy chi tiết một bản ghi report.
- **Role**: `Worker,Farmer`
- **Response**: `200 OK` (JobDetailDTO)

### 4.3 GET `/JobDetail/worker/{workerId}`
- **Mục đích**: Lấy lịch sử report của worker.
- **Role**: `Worker`
- **Response**: `200 OK` (List<JobDetailDTO>)

### 4.4 POST `/disputes`
- **Mục đích**: Worker/Farmer khiếu nại (Appeal) nếu không chấp nhận mức phần trăm (%) đánh giá hoặc có vấn đề khác.
- **Role**: `Worker, Farmer`
- **Body**: `CreateDisputeReportRequest`
- **Response**: `201 Created` (DisputeReportDTO)

### 4.5 GET `/disputes/mine`
- **Mục đích**: Worker xem danh sách khiếu nại của chính mình.
- **Role**: `Worker`
- **Response**: `200 OK` (List<DisputeReportDTO>)

---

## 5) Report APIs liên quan Worker (Farmer thao tác)

### 5.1 POST `/JobDetail/{id}/approve`
- **Mục đích**: Farmer chấm phần trăm (%) công và duyệt report của worker.
- **Role**: `Farmer`
- **Body**: `ApproveJobDetailRequest`
- **Response**: `200 OK` (JobDetailDTO)

### 5.2 GET `/JobDetail/job-post/{jobPostId}`
- **Mục đích**: Farmer xem toàn bộ daily reports (JobDetail) của một Job Post.
- **Role**: `Farmer`
- **Response**: `200 OK` (List<JobDetailDTO>)

---

## 6) Job APIs (Worker thao tác & Tương tác)

### 6.1 GET `/job/post`
- **Mục đích**: Lấy tất cả job posts có sẵn (để worker tìm việc).
- **Response**: `200 OK` (List<JobPostDTO>)

### 6.2 GET `/job/post/{id}`
- **Mục đích**: Xem chi tiết 1 job post.
- **Response**: `200 OK` (JobPostDTO)

### 6.3 GET `/job/post/nearby`
- **Mục đích**: Lấy các việc làm gần vị trí hiện tại của user.
- **Params**: `latitude`, `longitude`, `maxDistanceKm` (default 20).
- **Response**: `200 OK` (List<JobDiscoveryDTO>)

### 6.4 POST `/job/post/search`
- **Mục đích**: Tìm kiếm việc nâng cao với filter.
- **Body**: `JobSearchFilterRequest`
- **Response**: `200 OK` (PaginatedResponse<JobDiscoveryDTO>)

### 6.5 GET `/job/post/filter`
- **Mục đích**: Filter việc theo các tiêu chí record đơn giản.
- **Params**: `title`, `category`, `address`, `skill`.
- **Response**: `200 OK` (List<JobPostDTO>)

### 6.6 POST `/job/application`
- **Mục đích**: Worker nộp đơn ứng tuyển vào một Job Post.
- **Body**: `CreateJobApplicationRequest`
- **Response**: `200 OK` (JobApplicationDTO)

### 6.7 GET `/job/application`
- **Mục đích**: Lấy danh sách applications.
- **Response**: `200 OK` (List<JobApplicationDTO>)

### 6.8 GET `/job/application/{id}`
- **Mục đích**: Xem chi tiết application của mình.
- **Response**: `200 OK` (JobApplicationDTO)

### 6.9 DELETE `/job/application/{id}`
- **Mục đích**: Hủy (thu hồi) đơn ứng tuyển đã nộp.
- **Cơ chế**: API này sẽ xóa vật lý record Application khỏi hệ thống (không dùng cờ status kiểu Cancelled). Worker hoàn toàn có thể tự hủy đơn đã nộp bằng cách gọi API này.
- **UI Note**: Frontend nên ràng buộc điều kiện nội bộ (ví dụ: chỉ hiện nút "Hủy đơn" khi trạng thái đơn là *Chờ Duyệt - Pending*) vì backend hiện tại sẽ xóa đơn bất chấp trạng thái nào nếu gọi API.
- **Response**: `200 OK` (Xóa thành công), `404 Not Found`

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

### 7.6 POST `/notification/register-token`
- **Mục đích**: Đăng ký Device Token cho Push Notification.
- **Body**: `{ "token": "string", "deviceName": "string" }`
- **Response**: `200 OK`

### 7.7 POST `/notification/unregister-token`
- **Mục đích**: Huỷ đăng ký Device Token.
- **Body**: `{ "token": "string" }`
- **Response**: `200 OK`

---

## 8) Auth APIs Worker sử dụng

### 8.1 POST `/login`
- Body: `{"email": "...", "password": "..."}`
- Response: `200 OK` (LoginResponse)

### 8.2 POST `/register`
- Body: `RegisterRequest` (Kèm `roleId = 3` cho Worker).
- Response: `201 Created`

### 8.3 POST `/google-login`
- Body: `{"googleToken": "...", "roleId": 3}`
- Response: `200 OK` (LoginResponse)

### 8.4 POST `/forget`
- **Mục đích**: Yêu cầu mã OTP (hoặc link) để reset mật khẩu.
- Body: `ForgotPasswordRequest`
- Response: `200 OK`

### 8.5 POST `/reset`
- **Mục đích**: Đổi mật khẩu với mã OTP.
- Body: `ResetPasswordRequest`
- Response: `200 OK`

### 8.6 POST `/logout` (Yêu cầu `Authorize`)
- Mục đích: Đăng xuất.
- Response: `200 OK`

---

## 9) Ghi chú nghiệp vụ quan trọng

- Các path API đều tuân thủ `ApiEndpointConstants.cs` (Ví dụ `/api/v1/worker` thay vì `/api/v1/worker-profile`).
- WorkerProfile APIs (GET/PUT) loại bỏ `userId` từ Path Parameter, bảo vệ bằng cách phân giải JWT Token (Claims) để xác thực người dùng.
- Luồng báo cáo công việc đã được chuyển từ `WorkerAttendance` sang `JobDetail`.
- **[Deprecated]** `WorkerAttendance` (Check-in/Check-out) hiện tại không còn được dùng trong Worker Mobile Workflow, dẫu các API `/api/v1/attendance/...` vẫn tồn tại ở backend để hỗ trợ DB cũ. Khuyến cáo app gọi qua hệ thống `/api/v1/JobDetail/report-daily` để ghi nhận ngày công.
- Hệ thống Khiếu nại (Dispute/Appeal) đã được tách thành module riêng.
- Các DTO danh sách (Application) đã được nhúng kèm Object liên quan để tối ưu UI.
- API Application Job có validate Role để đảm bảo đúng phân quyền ứng tuyển.
- Hệ thống Notification được tích hợp cho cả 2 luồng.

---

## 10) Trạng thái Cải thiện UI & Backend Sync

### 10.1 Xử Lý UI Chức Năng Việc Nông Nghiệp (Theo Ngày) & Khoán
- **[✅ ĐÃ HOÀN THÀNH]** Đã chuyển sang luồng `JobDetail`. Worker gửi `report-daily`, Farmer `approve` kèm `%` và `feedback`.

### 10.2 Tránh Sập App Vì Lỗi Thiếu Dữ Liệu Tích Hợp
Hiện tại, một loạt API trả về dạng Danh Sách (List) chỉ nhả ra các cục ID trơn (Ví dụ: `JobApplicationId`, `JobPostId`) mà không hề nhúng thêm dữ liệu chi tiết của ngọn ngành.

- **Đề xuất từ Frontend:** Yêu cầu Backend hãy **nhúng (embed) thẳng Object `JobPostDTO`** vào bên trong các DTO dạng List dưới đây (nói cách khác là Join bảng để bưng data ra luôn).
- **Mục đích xử lý:** Giúp Frontend có sẵn `Title` (Tên việc), `Location` (Vị trí), `WageAmount` (Lương), `FarmName` (Tên Nông Trại)... để vẽ liền giao diện thẻ (Card) danh sách. Tránh việc Frontend phải gọi thủ công hàng chục API `GetJobDetail` rời rạc khác nhau gây đứng máy Client (lỗi N+1 Query).

1. **`WorkerProfileDTO`**: Đã bổ sung `Email` và `PhoneNumber`. -> **[✅ ĐÃ HOÀN THÀNH]**

2. **`JobApplicationDTO` (Lịch Sử Ứng Tuyển)**: 
   - **Tình trạng:** Đã được nhúng kèm object `JobPost` và `LocationName`.
   - **Hậu quả UI:** Màn hình "Việc chờ duyệt" của Worker đã có đủ Tựa việc và Lương để hiển thị giao diện danh sách mà không cần lo lỗi N+1 Query.
   - **Yêu cầu BE:** BẮT BUỘC bổ sung/nhúng Object `JobPost` (hoặc các trường Metadata) vào DTO này. -> **[✅ ĐÃ CẬP NHẬT]**

3. **`JobDetailDTO` (thay thế Attendance)**: Đã được tích hợp vào codebase. -> **[✅ ĐÃ HOÀN THÀNH]**

### 10.3 Thiếu Cơ Chế Chọn Ngày Khi Ứng Tuyển
- **[✅ ĐÃ HOÀN THÀNH]** `JobApplicationDTO` và `CreateJobApplicationRequest` đã hỗ trợ mảng `workDates`.

---

## 11) Yêu Cầu Backend cho Push Notification Real-time

**[✅ ĐÃ HOÀN THÀNH - SẴN SÀNG TÍCH HỢP]**

Để tính năng thông báo có thể hoạt động ngay tức thời trên app (kể cả khi tắt app), Frontend đã cài đặt thư viện `expo-notifications` lấy **Device Push Token**. Backend cần chuẩn bị:
1. Mỗi khi User đăng nhập thành công vào app, app sẽ gọi API `POST /api/v1/notification/register-token` kèm body `{"token": "ExponentPushToken[xxx]"}`. Backend cần lưu lại chuỗi token này vào DB gắn liền với `userId`. -> **[✅ ĐÃ CÓ API `RegisterDeviceToken`]**
2. Khi có sự kiện (VD: duyệt điểm danh, tin nhắn mới, job được accept...), Backend dựa vào danh sách `Device Token` của User đó trên DB để **gọi POST request qua API của Expo** (`https://exp.host/--/api/v2/push/send`) gửi kèm payload `{ "to": "ExponentPushToken[xxx]", "title": "Tiêu đề", "body": "Nội dung", "data": {...} }`.
3. Expo Server sẽ tự động bắn sang APNs (Apple) và FCM (Android) để hiển thị thông báo popup về máy người dùng realtime.

---

## 12) Bảng Bổ Sung: Từ Điển Enum (Dành Cho Frontend Mapping)
Dựa theo cấu trúc Database hiện hành của Backend (`AgroTemp.Domain.Entities`), dưới đây là bảng Enum để Frontend tạo file định nghĩa hằng số (constants) và map UI cho chính xác:

### 12.1 JobType (Loại Công Việc)
*Xuất hiện ở `JobPost.JobTypeId`*
- `1` = Khoán Trọn Gói (PerJob)
- `2` = Theo Công nhật (Daily)

### 12.2 JobPostStatus (Trạng Thái Việc Làm)
*Xuất hiện ở `JobPost.StatusId`*
- `1` = Nháp (Draft)
- `2` = Đang Mở Tuyển (Published)
- `3` = Đã Đóng Đơn (Closed)
- `4` = Đang Tiến Hành (InProgress)
- `5` = Đã Hoàn Thành (Completed)
- `6` = Bị Hủy (Cancelled)

### 12.3 JobDetailStatus (Trạng Thái Báo Cáo Công Việc)
*Xuất hiện ở `JobDetail.StatusId`*
- `1` = Đang tiến hành (InProgress)
- `2` = Đã báo cáo (Reported)
- `3` = Đã hoàn thành (Completed)

### 12.4 ApplicationStatus (Trạng Thái Đơn Ứng Tuyển)
*Xuất hiện ở `JobApplication.StatusId`*
- `1` = Chờ Duyệt (Pending)
- `2` = Đã Được Nhận (Accepted)
- `3` = Bị Từ Chối (Rejected)
- `4` = Worker Tự Hủy Đơn (Cancelled)

### 12.5 ExperienceLevel (Cấp Độ Kinh Nghiệm Worker)
*Xuất hiện ở `WorkerProfile.ExperienceLevel`*
- `1` = Mới Định Hướng (Beginner)
- `2` = Đã Có Kinh Nghiệm (Intermediate)
- `3` = Thợ Lành Nghề (Experienced)

### 12.6 DisputeStatus
- `1` = Pending
- `2` = UnderReview
- `3` = Resolved
- `4` = Rejected

### 12.7 WalletTransactionType
- `1` = Nạp tiền (Deposit)
- `2` = Rút tiền (Withdraw)
- `3` = Thanh toán lương (JobPayment)
- `4` = Hoàn tiền (Refund)
- `5` = Tạm khóa (JobLock)

---

## 13) Wallet & Withdraw APIs

### 13.1 GET `/wallet/me`
- **Mục đích**: Lấy thông tin ví của user hiện tại.
- **Response**: `200 OK` (WalletDTO)

### 13.2 GET `/wallet-transaction/wallet/{walletId}`
- **Mục đích**: Lấy lịch sử giao dịch của ví.
- **Response**: `200 OK` (List<WalletTransactionDTO>)

### 13.3 POST `/withdraw`
- **Mục đích**: Tạo yêu cầu rút tiền.
- **Body**: `CreateWithdrawalRequest`
- **Response**: `201 Created` (WithdrawalResponse)

### 13.4 GET `/withdraw/account-balance`
- **Mục đích**: Kiểm tra số dư khả dụng để rút.
- **Response**: `200 OK` (WithdrawalAccountBalanceResponse)

---

## 14) Skills APIs

### 14.1 GET `/skills`
- **Mục đích**: Lấy danh sách toàn bộ kỹ năng có sẵn trong hệ thống.
- **Response**: `200 OK` (List<SkillResponse>)

---

## 15) Weather APIs

### 15.1 GET `/weather/me`
- **Mục đích**: Lấy thông tin thời tiết tại vị trí của worker (dựa trên địa chỉ profile).
- **Response**: `200 OK` (WeatherDTO)
