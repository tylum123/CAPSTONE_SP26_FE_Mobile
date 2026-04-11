# Worker API Spec — CAPSTONE SP26

Tài liệu mô tả **chính xác** các API và DTO liên quan tới luồng **Worker**, đối soát trực tiếp từ source code Backend (`AgroTemp.API/Controllers`, `AgroTemp.Domain/DTO`, `AgroTemp.Domain/Entities`).

**Cập nhật lần cuối:** 2026-04-11 (đối soát thực tế BE)

---

## 1) Thông tin chung

- **Base URL**: `/api/v1`
- **Auth**: Bearer JWT (`Authorization: Bearer <token>`) cho mọi API có ghi Role.
- **Định dạng JSON**: **camelCase** cho tất cả trường. Ngoại lệ duy nhất: `date_of_birth` (snake_case) trong `WorkerProfileDTO`.
- **Response chuẩn**:

```json
{
  "message": "string",
  "status_code": 200,
  "data": {}
}
```

---

## 2) Sơ đồ quan hệ dữ liệu

```
Farmer đăng ──► JobPost (1)
                    │
                    │ Worker ứng tuyển
                    ▼
              JobApplication (N)         ← mỗi Worker/JobPost có 1 đơn
              status: Pending → Accepted → Rejected / Cancelled
                    │
                    │ Khi Accepted, Worker báo cáo mỗi ngày
                    ▼
              JobDetail (N)              ← 1 record = 1 ngày làm việc
              (tên thực tế trong code: "Daily Report")
              status: InProgress → Reported → Completed
                    │
                    │ Nếu Worker không đồng ý kết quả
                    ▼
              DisputeReport              ← bảng riêng biệt
              status: Pending → UnderReview → Resolved / Rejected
```

---

## 3) Bảng Enum toàn hệ thống (nguồn: Entities C#)

| Enum | statusId | Tên | Dùng trong |
|---|---|---|---|
| `JobPostStatus` | 1 | Draft | `JobPostDTO.statusId` |
|                 | 2 | Published |                   |
|                 | 3 | Closed |                      |
|                 | 4 | InProgress |                  |
|                 | 5 | Completed |                   |
|                 | 6 | Cancelled |                   |
| `ApplicationStatus` | 1 | Pending | `JobApplicationDTO.statusId` |
|                     | 2 | Accepted |                             |
|                     | 3 | Rejected |                             |
|                     | 4 | Cancelled |                            |
| `JobStatus` | 1 | InProgress | `JobDetailResponseDTO.statusId`  |
|             | 2 | Reported |                                    |
|             | 3 | Completed |                                   |
| `DisputeStatus` | 1 | Pending | `DisputeReportDTO.statusId` |
|                 | 2 | UnderReview |                         |
|                 | 3 | Resolved |                            |
|                 | 4 | Rejected |                            |
| `DisputeType` | 1 | JobQuality | `DisputeReportDTO.disputeTypeId` |
|               | 2 | Payment |                                     |
|               | 3 | Other |                                       |
| `JobType` | 1 | PerJob | `JobPostDTO.jobTypeId` |
|           | 2 | Daily |                         |

---

## 4) DTOs chính (nguồn: AgroTemp.Domain/DTO)

### 4.1 WorkerProfileDTO
**Response** của `GET /worker`.

> [!WARNING]
> `Date_of_birth` dùng format đặc biệt có chữ hoa đầu trong response, nhưng `dateOfBirth` camelCase khi gửi request PUT.

```json
{
  "id": "guid",
  "userId": "guid",
  "fullName": "string",
  "Date_of_birth": "1995-05-20",
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
  "updatedAt": "2026-03-03T08:00:00Z",
  "skills": [
    { "id": "guid", "name": "Bón phân", "description": "..." }
  ],
  "genderId": 1,
  "gender": "Male"
}
```

### 4.2 UpdateWorkerProfileRequest
**Body** của `PUT /worker`.

> [!CAUTION]
> BE Worker entity yêu cầu `address` (NOT NULL) nhưng DTO hiện tại **không có trường này** → gây `DbUpdateException` khi tạo profile lần đầu. FE đã gửi `address` (= `primaryLocation`) như workaround. Cần BE bổ sung trường `Address` vào `UpdateWorkerProfileRequest.cs` (`[PENDING #7]`).

```json
{
  "fullName": "Nguyen Van A",
  "dateOfBirth": "1995-05-20",
  "primaryLocation": "Can Tho",
  "address": "Đường 3/2, Xuân Khánh, Ninh Kiều, Cần Thơ",
  "travelRadiusKmPreference": 15.5,
  "experienceLevelId": 2,
  "availabilitySchedule": "Mon-Fri 08:00-17:00",
  "avatarUrl": "https://...",
  "skillIds": ["guid-1", "guid-2"],
  "genderId": 1
}
```

---

### 4.3 JobPostDTO
**Response** của `GET /job/post/{id}`.

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
  "jobTypeId": 2,
  "wageAmount": 500000,
  "requirements": ["string"],
  "privileges": ["string"],
  "jobSkillRequirements": [{ "id": "guid", "name": "Bón phân" }],
  "publishedAt": "2026-03-01T08:00:00Z",
  "createdAt": "2026-03-01T08:00:00Z",
  "updatedAt": "2026-03-01T08:00:00Z",
  "isUrgent": true,
  "statusId": 2
}
```

### 4.4 JobDiscoveryDTO
**Response** của `POST /job/post/search` và `GET /job/post/nearby`. Kế thừa tất cả trường `JobPostDTO` và có thêm:

```json
{
  "...tất cả trường JobPostDTO...",
  "jobTypeName": "Daily",
  "distanceKm": 5.2,
  "farmerAverageRating": 4.8,
  "locationName": "Đắk Lắk",
  "skillsMatchCount": 2,
  "allSkillsMatched": true,
  "availablePositions": 8,
  "matchScore": 85,
  "durationDays": 30,
  "isUpcoming": false,
  "similarJobsCompleted": 3
}
```

---

### 4.5 JobApplicationDTO
**Response** của `POST /job/application` và `GET /job/application/worker`.

> ✅ `jobPost` đã được nhúng sẵn trong response này.

```json
{
  "id": "guid",
  "jobPostId": "guid",
  "jobPost": { "...JobPostDTO đầy đủ..." },
  "worker": { "...WorkerProfileDTO..." },
  "statusId": 1,
  "coverLetter": "string?",
  "appliedAt": "2026-03-10T10:00:00Z",
  "respondedAt": "2026-03-11T10:00:00Z?",
  "responseMessage": "string?",
  "workDates": ["2026-03-24T10:00:00Z"],
  "locationName": "string?"
}
```

**`CreateJobApplicationRequest`** (Body gửi lên khi ứng tuyển):

```json
{
  "jobPostId": "guid",
  "statusId": 1,
  "coverLetter": "string?",
  "appliedAt": "2026-03-10T10:00:00Z?",
  "respondedAt": "2026-03-11T10:00:00Z?",
  "responseMessage": "string?",
  "workDates": ["2026-03-24T10:00:00Z"]
}
```

---

### 4.6 JobDetailResponseDTO (Daily Report)
**Response** của các API `/job/detail/...`.

> [!NOTE]
> ✅ **[PENDING #3 đã fix một phần]** Trường `worker` đã được nhúng vào response. Tuy nhiên `evidenceUrl` và `jobPost` **vẫn chưa có** — chờ BE bổ sung (`[PENDING #1, #2]`).

**Response hiện tại từ BE** (`JobDetailResponseDTO.cs` — đã xác nhận từ source):

```json
{
  "id": "guid",
  "jobApplicationId": "guid",
  "jobPostId": "guid",
  "workerId": "guid",
  "worker": { "...WorkerProfileDTO..." },
  "statusId": 2,
  "workDate": "2026-03-03T00:00:00Z",
  "workerDescription": "Hôm nay tôi đã làm được...",
  "farmerFeedback": "Làm tốt",
  "farmerApprovedPercent": 100,
  "jobPrice": 500000,
  "workerPaymentAmount": 500000,
  "refundAmount": 0,
  "completedAt": "2026-03-03T17:00:00Z",
  "createdAt": "2026-03-03T07:00:00Z",
  "updatedAt": "2026-03-03T17:00:00Z"
}
```

**Response mong muốn sau khi BE bổ sung (`[PENDING #1, #2]`):**

```json
{
  "...tất cả trường hiện tại...",
  "evidenceUrl": "https://cdn.example.com/img1.jpg,https://cdn.example.com/img2.jpg",
  "jobPost": {
    "title": "Hái cà phê Đắk Lắk",
    "contactName": "Nguyễn Văn A",
    "address": "Buôn Ma Thuột, Đắk Lắk",
    "startDate": "2026-03-01",
    "endDate": "2026-03-31"
  }
}
```

**`CreateDailyReportRequest`** (Body gửi lên khi báo cáo):

> [!CAUTION]
> `evidenceUrl` (`ImageUrls`) đang bị comment out ở BE. Trường này FE gửi sẽ bị **bỏ qua hoàn toàn** — ảnh minh chứng không được lưu (`[PENDING #1]`).

> [!IMPORTANT]
> `{id}` trong route `POST /job/detail/report/{id}` là **`jobApplicationId`** (truyền qua route, **KHÔNG phải trong body**). Body chỉ gồm:

```json
{
  "workerDescription": "string"
}
```

---

### 4.7 DisputeReportDTO
**Response** của `POST /disputes` và `GET /disputes/mine`.

```json
{
  "id": "guid",
  "farmerId": "guid?",
  "workerId": "guid?",
  "jobPostId": "guid",
  "disputeTypeId": 1,
  "reason": "string",
  "description": "string?",
  "evidenceUrl": "string?",
  "statusId": 1,
  "adminNote": "string?",
  "resolvedById": "guid?",
  "reporterUserId": "guid?",
  "accusedUserId": "guid?",
  "penaltyTargetId": 0,
  "createdAt": "2026-03-10T10:00:00Z",
  "resolvedAt": "datetime?"
}
```

**`CreateDisputeReportRequest`** (Body gửi khi tạo khiếu nại):

```json
{
  "jobPostId": "guid",
  "disputeTypeId": 1,
  "reason": "string (bắt buộc, tối đa 512 ký tự)",
  "description": "string?",
  "evidenceUrl": "string?",
  "farmerId": "guid?",
  "workerId": "guid?"
}
```

---

### 4.8 NotificationDTO
**Response** của `GET /notification` và `GET /notification/unread`.

> [!NOTE]
> Phân loại `type`: 1: JobAcceptance, 2: Reminder, 3: PaymentConfirmation, 4: NearbyJobOpening.

```json
{
  "id": "guid",
  "userId": "guid",
  "relatedEntityId": "guid?",
  "type": 1,
  "title": "string",
  "message": "string",
  "isRead": false,
  "sentAt": "2026-04-04T10:00:00Z",
  "readAt": "datetime?"
}
```

---

### 4.9 MessageDTO & ConversationDTO
**Response** của `GET /messages` và `GET /messages/conversations`.

**`MessageDTO`** (1 tin nhắn):

```json
{
  "id": "guid",
  "senderId": "guid",
  "receiverId": "guid",
  "content": "string",
  "read": false,
  "createdAt": "2026-04-11T10:00:00Z",
  "sender": { "id": "guid", "name": "string", "avatarUrl": "string?" },
  "receiver": { "id": "guid", "name": "string", "avatarUrl": "string?" }
}
```

**`ConversationDTO`** (cuộc hội thoại gần đây — dùng cho danh sách inbox):

```json
{
  "contact": { "id": "guid", "name": "string", "avatarUrl": "string?" },
  "lastMessage": { "...MessageDTO..." },
  "unreadCount": 3
}
```

### 4.10 WorkerApplicationStatsDTO
**Response** của `GET /job/application/worker/stats`.

```json
{
  "totalApplications": 10,
  "pendingApplications": 2,
  "acceptedApplications": 5,
  "rejectedApplications": 1,
  "cancelledApplications": 2,
  "completedJobs": 4,
  "totalEarnings": 2500000
}
```

---

---

## 5) APIs Công Khai (Public — Không cần Token)

### 5.1 Xác thực (Auth)

| Method | Endpoint | Body / Params | Ghi chú |
|---|---|---|---|
| POST | `/login` | `{ email, password }` | 403 = Email chưa verify |
| POST | `/register` | `{ email, password, phoneNumber, roleId }` | Gửi OTP về email |
| POST | `/verify-email` | `{ email, otp }` | Xác thực OTP |
| POST | `/resend-verification` | `{ email }` | Gửi lại OTP |
| POST | `/forget` | `{ email }` | Gửi OTP reset password |
| POST | `/reset` | `{ email, otp, newPassword }` | Đổi mật khẩu |
| POST | `/google-login` | `{ googleToken, roleId? }` | Đăng nhập Google |

### 5.2 Việc làm & Khám phá

| Method | Endpoint | Params | Response |
|---|---|---|---|
| GET | `/job/category` | — | Danh mục[] |
| GET | `/job/post/{id}` | — | `JobPostDTO` |
| POST | `/job/post/search` | Body: `JobSearchFilterRequest` | `JobDiscoveryDTO[]` (paginated) |
| GET | `/job/post/nearby` | `latitude`, `longitude`, `maxDistanceKm` | `JobDiscoveryDTO[]` |
| GET | `/job/post/filter` | `title`, `category`, `address` | `JobDiscoveryDTO[]` |
| GET | `/job/post/by-date` | `dateFilter` | `JobDiscoveryDTO[]` |
| GET | `/job/post/by-skill` | `skills` (phân cách `,`) | `JobDiscoveryDTO[]` |
| GET | `/job/post/by-wage` | `minWage`, `maxWage` | `JobDiscoveryDTO[]` |
| GET | `/job/post/urgent` | Params vị trí | `JobDiscoveryDTO[]` |
| GET | `/weather/coordinates` | `lat`, `lon` | Thời tiết |
| GET | `/weather/city` | `city` | Thời tiết |

---

## 6) APIs Worker (Yêu cầu Token & Role: Worker)

### 6.1 Hồ sơ Worker

| Method | Endpoint | Body | Response |
|---|---|---|---|
| GET | `/worker` | — | `WorkerProfileDTO` |
| PUT | `/worker` | `UpdateWorkerProfileRequest` | `WorkerProfileDTO` |
| POST | `/worker/upload-avatar` | `multipart/form-data (image)` | URL ảnh |

### 6.2 Ứng tuyển

| Method | Endpoint | Body / Params | Response | Ghi chú |
|---|---|---|---|---|
| POST | `/job/application` | `CreateJobApplicationRequest` | `JobApplicationDTO` | Gửi đơn ứng tuyển |
| GET | `/job/application/worker` | — | `JobApplicationDTO[]` | Đơn của Worker hiện tại |
| GET | `/job/application/worker/stats` | — | `WorkerApplicationStatsDTO` | Thống kê tổng hợp |
| PUT | `/job/application/cancel/{id}` | — | — | Hủy đơn ứng tuyển |

> [!NOTE]
> Dùng `/cancel/{id}` thay vì DELETE đơn thuần để đảm bảo logic nghiệp vụ hủy đúng quy trình.

### 6.3 Báo cáo công việc hằng ngày (JobDetail)

| Method | Endpoint | Params / Body | Response | Ghi chú |
|---|---|---|---|---|
| POST | `/job/detail/report/{id}` | Body: `{ workerDescription }` | `JobDetailResponseDTO` | `{id}` = `jobApplicationId` (route param) |
| GET | `/job/detail/{id}` | — | `JobDetailDTO` | Lấy 1 daily report |
| GET | `/job/detail/worker/{id}` | `?page=1&limit=10` | `PaginatedResponse<JobDetailResponseDTO>` | `{id}` = `workerProfileId` |
| GET | `/job/detail/post/{id}` | `?page=1&limit=10` | `PaginatedResponse<JobDetailResponseDTO>` | `{id}` = `jobPostId` |
| POST | `/job/detail/approve/{id}` | Body: `ApproveJobDetailRequest` | `JobDetailResponseDTO` | Role: Farmer. `{id}` = jobDetailId |
| PUT | `/job/detail/{id}` | Body: `UpdateJobDetailRequest` | `JobDetailDTO` | Cập nhật chi tiết |
| PUT | `/job/detail/update-status/{id}` | `?status=string` | `JobDetailDTO` | Đổi trạng thái |

**`ApproveJobDetailRequest`** (body khi Farmer phê duyệt):

```json
{
  "farmerApprovedPercent": 100,
  "farmerFeedback": "Làm tốt!"
}
```

> [!CAUTION]
> Route `/job/detail` đến từ `ApiEndpointConstants` (không phải tên Controller mặc định). `{id}` trong `POST /job/detail/report/{id}` là **`jobApplicationId`** truyền qua route, **KHÔNG** phải trong body.

### 6.4 Khiếu nại

| Method | Endpoint | Body | Response |
|---|---|---|---|
| POST | `/disputes` | `CreateDisputeReportRequest` | `DisputeReportDTO` |
| GET | `/disputes/mine` | — | `DisputeReportDTO[]` |

### 6.5 Ví & Rút tiền

| Method | Endpoint | Body | Response |
|---|---|---|---|
| GET | `/wallet/me` | — | Thông tin ví & số dư |
| GET | `/wallet-transaction/wallet/{walletId}` | — | Lịch sử giao dịch[] |
| GET | `/withdraw` | — | Danh sách lịch sử rút tiền [] |
| POST | `/withdraw` | Request rút tiền | Kết quả |
| GET | `/withdraw/account-balance` | — | Số dư khả dụng PayOS |

### 6.6 Thông báo

| Method | Endpoint | Body | Response | Ghi chú |
|---|---|---|---|---|
| GET | `/notification` | — | `PaginatedResponse<NotificationDTO>` | Lấy tất cả thông báo |
| GET | `/notification/unread` | — | `NotificationDTO[]` | Lấy thông báo chưa đọc |
| GET | `/notification/tokens` | — | `string[]` | Lấy các device token đang active |
| POST | `/notification/register-token` | `{ Token, DeviceName }` | — | Đăng ký Expo Push Token |
| POST | `/notification/unregister-token` | `{ Token }` | — | Hủy đăng ký token |
| PATCH | `/notification/read` | `{ notificationId: "guid" }` | — | Đánh dấu đã đọc |
| PATCH | `/notification/read-all` | — | — | Đánh dấu đọc tất cả |
| POST | `/logout` | — | — | Đăng xuất (xóa token) |

### 6.7 Nhắn tin (Messages)

| Method | Endpoint | Body / Params | Response | Ghi chú |
|---|---|---|---|---|
| GET | `/messages` | `?userId=guid&page=1&limit=20` | `PaginatedResponse<MessageDTO>` | Lịch sử chat với 1 user cụ thể |
| GET | `/messages/conversations` | — | `ConversationDTO[]` | Danh sách cuộc hội thoại gần đây (inbox) |
| POST | `/messages` | `{ receiverId, content }` | `MessageDTO` | Gửi tin nhắn mới |
| PATCH | `/messages/read` | `{ senderId: "guid" }` | `int` (số tin đã mark) | Đánh dấu toàn bộ tin từ `senderId` là đã đọc |

### 6.8 Đánh giá (Ratings)

| Method | Endpoint | Body | Ghi chú |
|---|---|---|---|
| POST | `/ratings` | `CreateRatingRequest` | `raterId`, `rateeId`, `jobPostId`, `ratingScore`, `reviewText` |
| PUT | `/ratings/{id}` | `UpdateRatingRequest` | Cập nhật số sao/review |
| GET | `/ratings/user/given` | — | Lấy tất cả rating do user hiện tại gửi đi |
| GET | `/ratings/user/{userId}/all` | — | Lấy tất cả rating của một user nhận được |
| GET | `/ratings/user/{userId}/average` | — | Trả về số điểm đánh giá trung bình |

---

## 7) PENDING — Yêu cầu BE bổ sung

> [!CAUTION]
> Các mục dưới đây FE đang cần nhưng BE chưa implement. FE sẽ **không tự workaround** — chờ BE cập nhật.

| # | Vấn đề | File BE cần sửa | Mức độ |
|---|---|---|---|
| 1 | `evidenceUrl` (`ImageUrls`) trong `CreateDailyReportRequest` bị comment out → ảnh minh chứng không lưu được | `CreateDailyReportRequest.cs` | 🔴 P0 |
| 2 | `JobDetailResponseDTO` không có `evidenceUrl` trong response | `JobDetailResponseDTO.cs` | 🔴 P0 |
| 3 | ~~`JobDetailResponseDTO` không nhúng `Worker`~~ **✅ ĐÃ FIX** — trường `Worker` đã xuất hiện trong `JobDetailResponseDTO`. Trường `jobPost` vẫn chưa được nhúng — chờ BE bổ sung. | `JobDetailService.GetById()` — cần thêm include JobPost | 🟡 P1 |
| 4 | `POST /job/post/search` không tính toán `distanceKm` ngay cả khi truyền tọa độ | `JobService.Search()` | 🔴 P0 |
| 5 | Chưa thống nhất tên trường tọa độ (Search dùng `workerLatitude`, Nearby dùng `latitude`) | `JobSearchFilterRequest.cs` | 🟡 P1 |
| 6 | Thêm trường `locationName` hoặc `address` vào `JobDiscoveryDTO` nếu chưa có | `JobDiscoveryDTO.cs` | 🔵 P2 |
| 7 | `UpdateWorkerProfileRequest` **vẫn thiếu** trường `Address` → Worker entity có `[Required] Address` (NOT NULL) → `DbUpdateException` khi tạo mới profile. FE workaround bằng cách gửi đồng thời field `address` | `UpdateWorkerProfileRequest.cs` + `UserService.cs` (thêm `Address = request.Address ?? request.PrimaryLocation`) | 🔴 P0 |

---

## 8) Luồng chức năng Worker (Worker Workflows)

Phần này tóm tắt các bước mà ứng dụng Mobile sẽ tương tác với Backend để hoàn thành quy trình công việc của Worker.

### 8.1 Luồng Đăng ký & Onboarding
1. **Đăng ký (Register) & Xác thực email**:
   - `POST /register`: Điền `email`, `password`, `phoneNumber`, và `roleId = 3` (Worker). BE sẽ gửi mã xác thực tới hộp thư email.
   - `POST /verify-email`: Gửi email và OTP để kích hoạt tài khoản.
   - Hoặc có thể gọi trực tiếp `POST /google-login` với `roleId = 3`.
2. **Đăng nhập**: Gọi `POST /login` lấy JWT Token. Lưu Token và thêm vào Header `Authorization: Bearer <Token>` cho mọi API private tiếp theo.
3. **Tạo Profile Worker**:
   - Mobile có thể kiểm tra trạng thái bằng `GET /worker`, nếu BE trả ra HTTP 404 thì chứng tỏ tài khoản mới đăng ký chưa có profile, chuyển hướng sang UI tạo profile.
   - Gọi `POST /worker/upload-avatar` (dạng form-data) để gửi ảnh chụp lên server lấy đường link avatar.
   - Gọi `PUT /worker` gửi lên `UpdateWorkerProfileRequest` chứa kỹ năng, năm sinh, giới tính... (Lưu ý: BE đang bị lỗi DB khi thiếu `Address` như mô tả ở [PENDING #7], nên FE có thể thử bypass bằng cách gửi kèm keyword này xem BE có bypass qua model JSON serializer không).

### 8.2 Luồng Tìm kiếm & Khám phá Việc Mới
1. **Theo dõi việc xung quanh**: `GET /job/post/nearby` cung cấp `latitude`, `longitude`.
2. **Tìm kiếm filter**: `POST /job/post/search` với các category ID.
3. **Xem chi tiết Job Post**: `GET /job/post/{id}`.

### 8.3 Luồng Ứng tuyển & Báo cáo hàng ngày (Daily Worker Flow)
1. **Gửi đơn Ứng tuyển**: Gọi `POST /job/application` (chèn ID bài đăng, các ngày nhấp chọn, và thư ngỏ).
2. **Quản lý đơn ứng tuyển**: `GET /job/application/worker`. Worker thấy thẻ mình đổi thành *Accepted* (status 2) tức là Farmer đã phê duyệt đơn.
3. **Báo cáo sau giờ làm**:
   - Nếu công việc theo hình thức Daily, Worker sau mỗi ngày đến Farm phải báo cáo đã làm gì.
   - Gọi `POST /job/detail/report/{id}` và đưa vào dòng mô tả (đính kèm hình ảnh chứng thực - đợi fix ở [PENDING #1]).
   - Khi báo cáo thành công, Farmer sẽ nhận thông báo, tiến hành thanh toán hoặc hoàn tiền qua PayOS trung gian.

### 8.4 Luồng Xử lý Khiếu nại (Disputes)
Hỗ trợ giải quyết tranh chấp (vd: Farmer trễ nợ quá hạn):
1. **Tạo Ticket**: Gọi `POST /disputes`, loại (`disputeTypeId=2` ứng với Payment), đính kèm lý do/bằng chứng. Chủ thể lưu ý cần ID của thẻ Job Application hoặc Post.
2. **Theo dõi Admin hỗ trợ**: Gọi `GET /disputes/mine`. Admin chuyển status từ `Pending` (1) qua `UnderReview` (2) rồi đóng ticket `Resolved` (3).

### 8.5 Luồng Quản lý Ví và Rút Tiền (Wallet/Withdrawal)
1. **Kiểm tra số dư thực tế**: `GET /wallet/me` (hiển thị số dư).
2. **Thống kê giao dịch**: Lấy `walletId` từ API trên, gọi vào `GET /wallet-transaction/wallet/{walletId}`.
3. **Lấy số dư khả dụng PayOS**: Gọi `GET /withdraw/account-balance` (Lưu ý chỉ khi đã KYC IP trên cổng PayOS thì BE mới gọi được - rule này áp dụng ở Dev / Production server).
4. **Yêu cầu rút tiền**: Gọi `POST /withdraw`.
5. **Xem lịch sử yêu cầu**: `GET /withdraw` - hiển thị tất cả các lượt withdraw cho tài khoản.

### 8.6 Luồng Thông báo (Notification)
1. **Đăng ký Device Token**: Ngay sau khi Login thành công trên Mobile, cần fetch token (vd `ExpoPushToken`) và gọi `POST /notification/register-token`.
2. **Pull data / Tương tác**: Cứ mỗi phiên mở app, gọi `GET /notification` hoặc `GET /notification/unread`. Khi user chọn xem một push notification, gọi `PATCH /notification/read`. Có thể dùng `PATCH /notification/read-all` để clear badge báo đỏ.
3. **Đăng xuất (Cực kỳ quan trọng)**: Trước khi gọi `POST /logout` để xóa JWT, bắt buộc phải gọi `POST /notification/unregister-token` (truyền lên Device Token) để xoá nó trên hệ thống, nếu không người dùng mới login vào thiết bị cũ sẽ đọc được thông báo của người lúc nãy.

### 8.7 Luồng Nhắn tin (Messages)
1. **Mở hộp thoại**: Khi ấn vào nút Chat ở Profile chủ vườn hay lịch sử Job, app gọi API `GET /messages` truyền lên `userId` (ID của Farmer đó đối với Worker) để lấy lịch sử nhắn tin hai người.
2. **Đánh dấu đã đọc**: UI gọi `PATCH /messages/read` và truyền `senderId` là ID của người đang chat, để đổi cờ `isRead` thành true cho hiển thị đối phương.
3. **Gửi Chat**: Gõ text và submit vào mạng qua `POST /messages` (`CreateMessageRequest`).

### 8.8 Luồng Đánh giá sau việc làm (Rating)
1. Sau khi hệ thống xác nhận Job Completed (đã làm xong & xử lý Payment xong).
2. Worker sẽ rate Farmer (hoặc ngược lại) bằng cách sử dụng `POST /ratings`. Dữ liệu quan trọng nhất là `rateeId` (bên bị đánh giá) và `JobPostId`.
3. Số sao lấy ra sẽ được aggregate và hiển thị ở profile mỗi người (`GET /ratings/user/{userId}/average`).


