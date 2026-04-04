# Worker API Spec — CAPSTONE SP26

Tài liệu mô tả **chính xác** các API và DTO liên quan tới luồng **Worker**, đối soát trực tiếp từ source code Backend (`AgroTemp.API/Controllers`, `AgroTemp.Domain/DTO`, `AgroTemp.Domain/Entities`).

**Cập nhật lần cuối:** 2026-04-03 (đối soát thực tế BE)

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
> `date_of_birth` dùng snake_case trong response, nhưng `dateOfBirth` camelCase khi gửi request PUT.

```json
{
  "id": "guid",
  "userId": "guid",
  "fullName": "string",
  "date_of_birth": "1995-05-20",
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
  ]
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
  "workDates": ["2026-03-24T10:00:00Z"]
}
```

---

### 4.6 JobDetailResponseDTO (Daily Report)
**Response** của các API `/JobDetail/...`.

> [!WARNING]
> `evidenceUrl` và `jobPost` **CHƯA tồn tại** trong BE. FE sẽ KHÔNG tự fetch riêng — chờ BE bổ sung (`[PENDING]`).

**Response hiện tại từ BE** (`JobDetailResponseDTO.cs` — đã xác nhận từ source):

```json
{
  "id": "guid",
  "jobApplicationId": "guid",
  "jobPostId": "guid",
  "workerId": "guid",
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

**Response mong muốn sau khi BE bổ sung (`[PENDING]`):**

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
> `evidenceUrl` đang bị comment out ở BE (`// ImageUrls`). Trường này FE gửi sẽ bị **bỏ qua hoàn toàn** — ảnh minh chứng không được lưu. Cần BE mở comment và thêm vào DTO.

```json
{
  "jobApplicationId": "guid",
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

| Method | Endpoint | Body | Response |
|---|---|---|---|
| POST | `/job/application` | `CreateJobApplicationRequest` | `JobApplicationDTO` |
| GET | `/job/application/worker` | — | `JobApplicationDTO[]` |
| DELETE | `/job/application/cancel/{id}` | — | — |

> [!NOTE]
> Dùng `/cancel/{id}` thay vì DELETE đơn thuần để đảm bảo logic nghiệp vụ hủy đúng quy trình.

### 6.3 Báo cáo công việc hằng ngày (JobDetail)

| Method | Endpoint | Body | Response |
|---|---|---|---|
| POST | `/JobDetail/report-daily` | `CreateDailyReportRequest` | `JobDetailResponseDTO` |
| GET | `/JobDetail/{id}` | — | `JobDetailResponseDTO` |
| GET | `/JobDetail/worker/{workerId}` | — | `JobDetailResponseDTO[]` |

> [!CAUTION]
> Path `/JobDetail` phải viết **PascalCase** — BE dùng `[Route("api/v1/[controller]")]` nên controller tên `JobDetailController` → path tự động là `/JobDetail`.

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
| POST | `/withdraw` | Request rút tiền | Kết quả |
| GET | `/withdraw/account-balance` | — | Số dư khả dụng PayOS |

### 6.6 Thông báo

| Method | Endpoint | Body | Response | Ghi chú |
|---|---|---|---|---|
| GET | `/notification` | — | `PaginatedResponse<NotificationDTO>` | Lấy tất cả thông báo |
| GET | `/notification/unread` | — | `NotificationDTO[]` | Lấy thông báo chưa đọc |
| POST | `/notification/register-token` | `{ Token, DeviceName }` | — | Đăng ký Expo Push Token |
| PATCH | `/notification/read` | `{ notificationId: "guid" }` | — | Đánh dấu đã đọc |
| POST | `/notification/read-all` | — | — | Đánh dấu đọc tất cả |
| POST | `/logout` | — | — | Đăng xuất (xóa token) |

---

## 7) PENDING — Yêu cầu BE bổ sung

> [!CAUTION]
> Các mục dưới đây FE đang cần nhưng BE chưa implement. FE sẽ **không tự workaround** — chờ BE cập nhật.

| # | Vấn đề | File BE cần sửa | Mức độ |
|---|---|---|---|
| 1 | `evidenceUrl` trong `CreateDailyReportRequest` bị comment out → ảnh minh chứng không lưu được | `CreateDailyReportRequest.cs` | 🔴 P0 |
| 2 | `JobDetailResponseDTO` không có `evidenceUrl` trong response | `JobDetailResponseDTO.cs` | 🔴 P0 |
| 3 | `JobDetailResponseDTO` không nhúng `jobPost` → FE không hiển thị tên/địa chỉ job | `JobDetailService.GetById()` — cần thêm `include: jd => jd.Include(x => x.JobPost)` và thêm field vào DTO | 🟡 P1 |
| 4 | `POST /job/post/search` không tính toán `distanceKm` ngay cả khi truyền tọa độ | `JobService.Search()` | 🔴 P0 |
| 5 | Chưa thống nhất tên trường tọa độ (Search dùng `workerLatitude`, Nearby dùng `latitude`) | `JobSearchFilterRequest.cs` | 🟡 P1 |
| 6 | Thêm trường `locationName` hoặc `address` vào `JobDiscoveryDTO` nếu chưa có | `JobDiscoveryDTO.cs` | 🔵 P2 |
| 7 | `UpdateWorkerProfileRequest` thiếu trường `Address` → Worker entity có `[Required] Address` (NOT NULL) nhưng khi tạo mới worker, BE không set `Address` → `DbUpdateException: An error occurred while saving the entity changes` | `UpdateWorkerProfileRequest.cs` + `UserService.cs` dòng 364-380 (thêm `Address = request.Address ?? request.PrimaryLocation`) | 🔴 P0 |
