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

## 10) Đề xuất Cải thiện UI (Từ bên Mobile Frontend Developer )

Để hỗ trợ hiển thị UI/UX hoàn chỉnh, đầy đủ thông tin cho người dùng mà không bị che khuất, Frontend có một số yêu cầu thêm vào Payload:

### 10.1 [QUAN TRỌNG] Phân Tách API Check-in / Check-out cho Việc Theo Ngày vs Việc Khoán
**[❌ CHƯA CẬP NHẬT]** DTO của hệ thống `WorkerAttendance` (`CheckInRequest`, `CheckOutRequest`, `ApproveAttendanceRequest`, `WorkerAttendanceDTO`) hiện tại đang bị dùng chung 1 khuôn là đếm thời gian. Điều này gây lỗi logic nghiệp vụ nặng vì **cách trả lương của 2 loại này hoàn toàn khác nhau**. Dưới đây là ghi chú rõ phần nào xài cho loại nào, phần nào bị thiếu cần BE vá lỗi ngay:

#### Loại 1: Công Việc Theo Ngày (`wageTypeId = 1`)
- **Nguyên lý tính lương:** Tiền công = `Tổng số ngày làm` (hoặc `Tổng số giờ` quy đổi ra ngày) * `Đơn giá ngày`.
- **Khâu Check-in:** Worker BẮT BUỘC phải chấm công giờ đến (`CheckInTime`). -> **[✅ BACKEND ĐÃ ĐÁP ỨNG TỐT]**
- **Khâu Check-out:** Worker BẮT BUỘC phải chấm công giờ về (`CheckOutTime`), BE tự lấy giờ về trừ giờ đến ra `TotalHoursWorked` (từ đó FE tự quy ra ngày). -> **[✅ BACKEND ĐÃ ĐÁP ỨNG TỐT]**
- **Khâu Farmer Duyệt (Approve):** Nếu Worker đi làm trễ hoặc trốn về sớm, Farmer có quyền dùng `AdjustedHours` để bóp lại số giờ thực tế. -> **[✅ BACKEND ĐÃ ĐÁP ỨNG TỐT]**
- **💡 Kết luận:** Backend hiện hành là "đo ni đóng giày" cho đúng loại hình Mọi Theo Ngày này. Rất chuẩn!

#### Loại 2: Công Việc Theo Khoán / Khối Lượng (`wageTypeId = 2`)
- **Nguyên lý tính lương:** Tiền công = `Khối lượng hoàn thành (CompletedAmount)` * `Đơn giá khoán`. (Dù bạn làm 1 tiếng hay 10 tiếng thì gặt xong 1 hecta lúa vẫn chỉ được 2 củ).
- **Khâu Check-in:** Vẫn gửi `CheckInTime` để chứng báo có mặt. -> **[✅ DÙNG CHUNG ĐƯỢC]**
- **Khâu Check-out (BÁO CÁO SẢN LƯỢNG):** Khi vác cuốc đi về, hệ thống bật popup hỏi Worker: *"Hôm nay mày thu hoạch được bao nhiêu kg / bao nhiêu mét vuông?"* (Ví dụ: Điền số 50).
  - **[❌ LỖI API]** API `POST /attendance/check-out` hiện tại KHÔNG CÓ chỗ nào để truyền số 50 này lên.
  - **[🛠️ YÊU CẦU BE SỬA]** BE phải nhét thêm trường `decimal? completedAmount` vào body của `CheckOutRequest`.
- **Khâu Farmer Duyệt (Approve):** Farmer tới đếm lại đống cà phê. Worker báo 50Kg nhưng thực tế cân được có 45Kg. Farmer phải sửa lại thành 45.
  - **[❌ LỖI API]** Nếu Farmer truyền số 45 vào `AdjustedHours` hiện tại thì sai bét về ngữ nghĩa (45 giờ làm??).
  - **[🛠️ YÊU CẦU BE SỬA]** BE phải nhét thêm trường `decimal? adjustedAmount` vào `ApproveAttendanceRequest`.
- **Lịch Sử (Get Attendance):**
  - **[🛠️ YÊU CẦU BE SỬA]** Cần trả về `CompletedAmount` trong `WorkerAttendanceDTO` để ghi sổ *"Hôm qua tôi được duyệt 45 Kg"*.

### 10.2 [CẢNH BÁO ĐỎ] Tránh Sập App Vì Lỗi Thiếu Dữ Liệu Liên Kết (Missing Joins)
Hiện tại, một loạt DTO trả về dạng Danh Sách (List) đang mắc lỗi **Lazy Loading / Thiếu Join**, chỉ trả về ID trơn mà không có dữ liệu thật. BE tuyệt đối KHÔNG ĐƯỢC làm lơ phần này vì nó sẽ khiến Frontend không có dữ liệu để vẽ UI hoặc phá hủy hiệu năng App (gọi API 100 lần để tra cứu).

1. **`WorkerProfileDTO`**:`skills` nếu có. -> **[✅ ĐÃ HOÀN THÀNH một phần]** (Đã có `Email` và `PhoneNumber`).

2. **`WorkerAttendanceDTO` (CỰC KỲ NGHIÊM TRỌNG)**: 
   - **Tình trạng:** Hiện DTO này chỉ nhả ra mỗi `JobApplicationId` (1 chuỗi vô hồn). 
   - **Các API đang bị ảnh hưởng trực tiếp:** `GET /attendance/worker/{workerProfileId}` (Lịch sử làm việc của Worker), `GET /attendance/farm/{farmerProfileId}` (Farmer xem chấm công), `GET /attendance/farm/{farmerProfileId}/worker/{workerProfileId}`.
   - **Hậu quả UI:** Màn hình Lịch sử Điểm danh của Worker và thẻ Duyệt Công của Farmer sẽ **trắng bóc thông tin**. Nông dân thấy 10 người điểm danh nhưng không biết thẻ đó là của công việc Gặt lúa hay Bón phân! Worker không biết hôm qua mình điểm danh cho Nông trại nào.
   - **Bắt buộc cho BE:** BẮT BUỘC BE phải Join/Include bảng JobPost để đính kèm vào DTO này các Metadata sống còn sau: `JobTitle` (Tựa việc), `FarmName` (Tên khu vườn/Nông trại), `WageTypeId` (Hệ số lương). FE tuyệt đối KHÔNG gọi thêm 100 API `GetJobDetail` rời rạc cho 100 thẻ điểm danh vì sẽ làm sập máy Client. -> **[❌ CHƯA CẬP NHẬT]**

3. **`JobApplicationDTO` (RẤT NGHIÊM TRỌNG)**: 
   - **Tình trạng:** Hiện chỉ nhả thẻ `WorkerProfileDTO` và `JobPostId`. 
   - **Các API đang bị ảnh hưởng trực tiếp:** `GET /job/application` (Danh sách công việc đã ứng tuyển), `GET /job/application/{id}`.
   - **Hậu quả UI:** Màn hình "Việc làm đang chờ duyệt" của Worker sẽ mù mờ hoàn toàn. Họ apply 10 công việc nhưng mở danh sách lên không thể thấy Tựa việc, không thấy Lương, không thấy Vị trí.
   - **Mệnh lệnh cho BE:** BẮT BUỘC BE phải Join bảng `JobPost` để gán thêm Metadata: `title` (Tựa đề), `location` (Nơi làm), `wageAmount` (Tiền công), `farmName` (Tên nông trại), `wageTypeId`. -> **[❌ CHƯA CẬP NHẬT]**

4. **NotificationDTO**: Thêm cơ chế `actionUrl` / `relatedEntityId` + `type` vào payload của Push. -> **[✅ ĐÃ HOÀN THÀNH]** (Đã có `RelatedEntityId`, `Type`, và `TypeName`).

### 10.3 Thiếu Luồng Ứng Tuyển & Quản Lý Slot Theo Từng Ngày (Apply Job by Date)
**[❌ CHƯA CÓ TRONG API]** Hiện tại `CreateJobApplicationRequest` chỉ nhận mỗi `JobPostId` và `CoverLetter`. Điều này dẫn đến sự cố nghiêm trọng cho dạng **"Việc Làm Theo Ngày"**:
- **Ngữ cảnh:** Nông dân mở JobPost yêu cầu 2 người làm cho 2 ngày: Ngày 3 và Ngày 4.
  - *Worker A* ứng tuyển và được duyệt làm **cả Ngày 3 & 4**.
  - *Worker B* ứng tuyển và được duyệt làm **chỉ Ngày 3**.
  - => Kết quả thực tế: **Ngày 3 đã ĐỦ NGƯỜI (0 slot trống)**, **Ngày 4 CÒN THIẾU 1 NGƯỜI (1 slot trống)**.
- **Sự cố:** Khi *Worker C* vào ứng tuyển sau cùng, hệ thống Backend hiện tại không phân tách số người theo từng ngày cụ thể, nên UI không biết cách hiển thị "Ngày 3 đã đầy, bạn chỉ có thể tick chọn ứng tuyển Ngày 4". 
- **Yêu Cầu Fix Từ Backend:**
  1. Trong API Lấy `JobPostDetail`, Backend cần trả về mảng `AvailableDates` chứa số lượng slot *còn lại* của từng ngày. VD: `{"date": "2026-03-03", "remainingSlots": 0}, {"date": "2026-03-04", "remainingSlots": 1}`. UI sẽ khoá (disable) ô checkbox Ngày 3.
  2. Bổ sung trường `List<string> appliedDates` (hoặc `List<int> timeSlotIds`) vào body của API `POST /api/v1/job/application` để Worker gửi lên danh sách xác định xác định họ đang apply vào những ngày nào còn trống.
  3. Khi Farmer ấn **Duyệt (Approve)** 1 application, Backend phải tự động trừ đi số `remainingSlots` tương ứng cho từng ngày nằm trong application đó. 

---

## 11) Yêu Cầu Backend cho Push Notification Real-time

**[✅ ĐÃ HOÀN THÀNH - SẴN SÀNG TÍCH HỢP]**

Để tính năng thông báo có thể hoạt động ngay tức thời trên app (kể cả khi tắt app), Frontend đã cài đặt thư viện `expo-notifications` lấy **Device Push Token**. Backend cần chuẩn bị:
1. Mỗi khi User đăng nhập thành công vào app, app sẽ gọi API `POST /api/v1/notification/register-token` kèm body `{"token": "ExponentPushToken[xxx]"}`. Backend cần lưu lại chuỗi token này vào DB gắn liền với `userId`. -> **[✅ ĐÃ CÓ API `RegisterDeviceToken`]**
2. Khi có sự kiện (VD: duyệt điểm danh, tin nhắn mới, job được accept...), Backend dựa vào danh sách `Device Token` của User đó trên DB để **gọi POST request qua API của Expo** (`https://exp.host/--/api/v2/push/send`) gửi kèm payload `{ "to": "ExponentPushToken[xxx]", "title": "Tiêu đề", "body": "Nội dung", "data": {...} }`.
3. Expo Server sẽ tự động bắn sang APNs (Apple) và FCM (Android) để hiển thị thông báo popup về máy người dùng realtime.
