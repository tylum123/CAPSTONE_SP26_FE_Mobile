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

### 2.3 JobDailyReportDTO **[💡 DỰ KIẾN - CHƯA CÓ TRONG BE]**

```json
{
  "id": "guid",
  "jobApplicationId": "guid",
  "reportDate": "2026-03-03T00:00:00Z",
  "description": "Hôm nay tôi đã làm được 50kg...",
  "imageUrls": ["https://img1...", "https://img2..."],
  "statusId": 1, // VD: 1: Chờ duyệt, 2: Đã duyệt, 3: Đang Appeal Admin
  "evaluationPercentage": 100, // Số phần trăm % công nhận bởi Farmer
  "farmerFeedback": "Làm tốt",
  "evaluatedAt": "2026-03-03T18:00:00Z | null",
  "createdAt": "2026-03-03T17:00:00Z"
}
```

### 2.4 CreateDailyReportRequest **[💡 DỰ KIẾN - CHƯA CÓ TRONG BE]**

```json
{
  "jobApplicationId": "guid",
  "reportDate": "2026-03-03T00:00:00Z",
  "description": "Hôm nay tôi đã làm được 50kg...",
  "imageUrls": ["https://img1...", "https://img2..."]
}
```
- `jobApplicationId`: required
- `reportDate`: required
- `description`: required, max 1000
- `imageUrls`: optional array

### 2.5 EvaluateReportRequest (Farmer dùng) **[💡 DỰ KIẾN - CHƯA CÓ TRONG BE]**

```json
{
  "reportId": "guid",
  "evaluationPercentage": 90,
  "farmerFeedback": "Ghi chú từ farmer..."
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
  "responseMessage": "string | null",
  "jobPost": { ... }, // Object JobPost được nhúng kèm 
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

## 4) Job Daily Report APIs (Worker thao tác)

Luồng mới: Worker không cần Check-in/Check-out. Worker tự tạo Báo Cáo Công Việc vào cuối mỗi ngày làm việc.

### 4.1 POST `/report`
- **Mục đích**: Worker tạo report hằng ngày.
- **Role**: `Worker`
- **Body**: `CreateDailyReportRequest`
- **Response**: `200 OK` (JobDailyReportDTO)

### 4.2 GET `/report/{id}`
- **Mục đích**: Lấy chi tiết một bản ghi report.
- **Role**: `Worker,Farmer`
- **Response**: `200 OK` (JobDailyReportDTO)

### 4.3 GET `/report/worker/{workerProfileId}`
- **Mục đích**: Lấy lịch sử report của worker theo khoảng thời gian.
- **Role**: `Worker`
- **Query params**: `startDate`, `endDate`
- **Response**: `200 OK` (List<JobDailyReportDTO>)

### 4.4 POST `/report/{id}/appeal`
- **Mục đích**: Worker khiếu nại lên Admin nếu không chấp nhận mức phần trăm (%) mà Farmer đánh giá.
- **Role**: `Worker`
- **Body**: `{ "reason": "string" }`
- **Response**: `200 OK`

---

## 5) Report APIs liên quan Worker (Farmer thao tác)

### 5.1 PUT `/report/evaluate`
- **Mục đích**: Farmer chấm phần trăm (%) công và duyệt report của worker.
- **Role**: `Farmer`
- **Body**: `EvaluateReportRequest`
- **Response**: `200 OK`

### 5.2 GET `/report/farm/{farmerProfileId}`
- **Mục đích**: Farmer xem toàn bộ daily reports trong farm của mình.
- **Role**: `Farmer`
- **Response**: `200 OK` (List<JobDailyReportDTO>)

### 5.3 GET `/report/farm/{farmerProfileId}/worker/{workerProfileId}`
- **Mục đích**: Farmer xem các reports của một worker cụ thể trong farm.
- **Role**: `Farmer`
- **Response**: `200 OK` (List<JobDailyReportDTO>)

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

## 10) Đề xuất Cải thiện UI (Từ bên Mobile Frontend Developer )

Để hỗ trợ hiển thị UI/UX hoàn chỉnh, đầy đủ thông tin cho người dùng mà không bị che khuất, Frontend có một số yêu cầu thêm vào Payload:

### 10.1 Xử Lý UI Chức Năng Việc Nông Nghiệp (Theo Ngày) & Khoán
**[🔄 ĐÃ THAY ĐỔI LUỒNG MỚI]** Backend BE và Mobile FE thống nhất BỎ hoàn toàn logic Check-in/Check-out. Thay vào đó, mỗi ngày làm việc Worker MẶC ĐỊNH phải gửi 1 `JobDailyReport` (kèm ảnh và mô tả tiến độ).

#### Loại 1: Ngày (`wageTypeId = 1`)
- **Worker thao tác:** Hằng ngày gửi 1 `JobDailyReport` có ảnh và mô tả công việc đã làm.
- **Farmer thao tác:** Đánh giá Report của ngày hôm đó và chốt % lương (VD: Nghỉ nửa buổi thì chốt 50%).
- **Quyết toán:** Lương ngày đó = `Lương cơ bản * % Đánh giá của Farmer` trên Report.
- **Giải quyết tranh chấp:** Nếu Worker không đồng ý với % của Farmer, có quyền ấn nút Appeal gửi Ticket lên Admin xử lý.

#### Loại 2: Khoán (`wageTypeId = 2`)
- **Worker thao tác:** Hằng ngày VẪN PHẢI gửi `JobDailyReport` (bao gồm mô tả + ảnh) để luồng dữ liệu tiến độ được liền mạch, để Farmer ở xa vẫn nắm được Worker đang làm tới đâu.
- **Farmer thao tác:** Đánh giá tổng kết và chốt % lương VÀO LÚC CUỐI KHOÁN (hoặc dựa trên Report cuối cùng).
- **Quyết toán:** Bằng `Tổng tiền khoán * % Đánh giá của Farmer`. **Lưu ý:** Nếu sau 7 ngày kết thúc việc mà Farmer không thèm đánh giá thanh toán, hệ thống tự động quy định là 100%.
- **Giải quyết tranh chấp:** Tương tự, Worker có thể Appeal Admin nếu % của Farmer không đúng hợp đồng.

### 10.2 [CẢNH BÁO ĐỎ] Tránh Sập App Vì Lỗi Thiếu Dữ Liệu Tích Hợp
Hiện tại, một loạt API trả về dạng Danh Sách (List) chỉ nhả ra các cục ID trơn (Ví dụ: `JobApplicationId`, `JobPostId`) mà không hề nhúng thêm dữ liệu chi tiết của ngọn ngành.

- **Đề xuất từ Frontend:** Yêu cầu Backend hãy **nhúng (embed) thẳng Object `JobPostDTO`** vào bên trong các DTO dạng List dưới đây (nói cách khác là Join bảng để bưng data ra luôn).
- **Mục đích xử lý:** Giúp Frontend có sẵn `Title` (Tên việc), `Location` (Vị trí), `WageAmount` (Lương), `FarmName` (Tên Nông Trại)... để vẽ liền giao diện thẻ (Card) danh sách. Tránh việc Frontend phải gọi thủ công hàng chục API `GetJobDetail` rời rạc khác nhau gây đứng máy Client (lỗi N+1 Query).

1. **`WorkerProfileDTO`**:`skills` thêm vào nếu có và cho người dùng list ra các skills có sẵn để tích hợp cho người dùng chọn. -> **[✅ ĐÃ HOÀN THÀNH một phần]** (Đã có `Email` và `PhoneNumber`).

2. **`WorkerAttendanceDTO` (Lịch Sử Điểm Danh Cũ)**: (cái này có thể không cần dùng)
   - **Tình trạng:** Khối lượng việc lấy lịch sử làm việc hiện tại chỉ nhả mỗi ID cộc lốc (`JobApplicationId`). 
   - **Hậu quả UI:** Màn hình Lịch sử làm việc của Worker và bảng Chấm công của Farmer sẽ trắng bốc, không rõ thẻ điểm danh này thuộc công việc nào.
   - **Yêu cầu BE:** Nếu BE chưa đập bỏ hệ thống cũ ngay lúc này, thì BẮT BUỘC bổ sung/nhúng Object `JobPost` vào DTO này để App tạm thời hiển thị được. -> **[❌ CHƯA CẬP NHẬT]**

3. **`JobApplicationDTO` (Lịch Sử Ứng Tuyển)**: 
   - **Tình trạng:** Đã được nhúng kèm object `JobPost` và `LocationName`.
   - **Hậu quả UI:** Màn hình "Việc chờ duyệt" của Worker đã có đủ Tựa việc và Lương để hiển thị giao diện danh sách mà không cần lo lỗi N+1 Query.
   - **Yêu cầu BE:** BẮT BUỘC bổ sung/nhúng Object `JobPost` (hoặc các trường Metadata) vào DTO này. -> **[✅ ĐÃ CẬP NHẬT]**

> **💡 ĐỀ XUẤT RIÊNG CHO SPRINT TIẾP THEO (JobDailyReportDTO):** 
> DTO `JobDailyReportDTO` (để thay thế Điểm danh cũ) hiện tại **chưa có trong Codebase**. Backend khi bắt tay vào code DTO và API này, xin hãy nhớ **TÍCH HỢP SẴN (`Embed / Join`) bảng `JobPost`** (Title, FarmName, WageAmount) ngay từ đầu để tránh lặp lại lỗi N+1 Query nêu trên nhé!

4. **NotificationDTO**: Thêm cơ chế `actionUrl` / `relatedEntityId` + `type` vào payload của Push. -> **[✅ ĐÃ HOÀN THÀNH]** (Đã có `RelatedEntityId`, `Type`, và `TypeName`).

### 10.3 Thiếu Cơ Chế Chọn Ngày Khi Ứng Tuyển (Phân Biệt Khoán/Ngày)
**[✅ ĐÃ CÓ TRONG API]** Hiện tại `CreateJobApplicationRequest` và schema ứng tuyển đã hỗ trợ phân tách ngày làm việc:
- **Đối với Việc Khoán:** có thể 1 Worker nhận trọn gói nguyên 1 lô việc từ ngày A đến ngày B, không cần phân tách rạch ròi. -> *(Mảng `workDates` có thể để trống hoặc set null tuỳ backend thiết kế)*.
- **Đối với Việc Làm Theo Ngày:** Đã có trường `workDates` dạng List/Array DateTime để FE ném xuống mảng những mùng (ngày) thợ chọn đi làm.
- **Yêu Cầu Tới BE:** Cần bổ sung thêm trường mảng danh sách ngày vào API Ứng Tuyển, để Frontend có thể gửi lên chính xác những ngày mà Worker rảnh và đã tick chọn muốn đi làm, làm sao để Frontend biết ở mùng nào đã nhận đủ số người để tránh Frontend gửi thêm request vào ngày đã nhận đủ. -> **[✅ ĐÃ CẬP NHẬT - Đã thêm WorkDates]**

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
- `1` = Theo Công nhật (Daily)
- `2` = Theo Khoán / Từng Lô (PerPlot)
- `3` = Khoán Trọn Gói (PerJob)

### 12.2 JobPostStatus (Trạng Thái Việc Làm)
*Xuất hiện ở `JobPost.StatusId`*
- `1` = Nháp (Draft)
- `2` = Đang Mở Tuyển (Published)
- `3` = Đã Đóng Đơn (Closed)
- `4` = Đang Tiến Hành (InProgress)
- `5` = Đã Hoàn Thành (Completed)
- `6` = Bị Hủy (Cancelled)

### 12.3 ApplicationStatus (Trạng Thái Đơn Ứng Tuyển)
*Xuất hiện ở `JobApplication.ApplicationStatus` / `statusId`*
- `1` = Chờ Duyệt (Pending)
- `2` = Đã Được Nhận (Accepted)
- `3` = Bị Từ Chối (Rejected)
- `4` = Worker Tự Hủy Đơn (Cancelled)

### 12.4 ExperienceLevel (Cấp Độ Kinh Nghiệm Worker)
*Xuất hiện ở `WorkerProfile.ExperienceLevel`*
- `1` = Mới Định Hướng (Beginner)
- `2` = Đã Có Kinh Nghiệm (Intermediate)
- `3` = Thợ Lành Nghề (Experienced)

### 12.5 NotificationType (Loại Thông Báo Push)
*Dành cho module Notification*
- `1` = JobAcceptance (Được nhận việc)
- `2` = Reminder (Nhắc nhở lịch làm / báo cáo)
- `3` = PaymentConfirmation (Xác nhận trả lương / tiền)
- `4` = NearbyJobOpening (Có việc mới gần nhà)
