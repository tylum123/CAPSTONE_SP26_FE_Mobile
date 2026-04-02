# Worker API Spec (Updated)

Tài liệu mô tả các API liên quan trực tiếp tới luồng **Worker** theo implementation hiện tại trong codebase Backend (C#/.NET).

Cập nhật lần cuối: **2026-04-02**

---

## 1) Thông tin chung

- **Base URL**: `/api/v1`
- **Auth**: Bearer JWT (`Authorization: Bearer <token>`) cho các API yêu cầu định danh.
- **Public APIs**: Các API liệt kê tại mục 3 không yêu cầu Token.
- **Định dạng JSON**: Sử dụng **camelCase** cho tất cả các trường.
- **Response chuẩn**:

```json
{
  "message": "string",
  "statusCode": 200,
  "data": {}
}
```

---

## 2) Schema chính (Data Transfer Objects)

### 2.1 WorkerProfileDTO
Thông tin hồ sơ đầy đủ của Worker.

```json
{
  "id": "guid",
  "userId": "guid",
  "fullName": "string",
  "dateOfBirth": "1995-05-20",
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

### 2.2 UpdateWorkerProfileRequest
Sử dụng khi cập nhật hoặc tạo mới profile.

```json
{
  "fullName": "Nguyen Van A",
  "dateOfBirth": "1995-05-20",
  "primaryLocation": "Can Tho",
  "travelRadiusKmPreference": 15.5,
  "experienceLevelId": 2,
  "availabilitySchedule": "Mon-Fri 08:00-17:00",
  "avatarUrl": "https://...",
  "skillIds": ["guid-1", "guid-2"]
}
```

### 2.3 JobPostDTO
Chi tiết bài đăng tuyển dụng.

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
  "jobSkillRequirements": [
    { "id": "guid", "name": "Bón phân" }
  ],
  "publishedAt": "ISO Date",
  "isUrgent": true,
  "statusId": 2
}
```

### 2.4 JobDiscoveryDTO
Dùng cho màn hình tìm kiếm, danh sách việc làm gần đây (có thêm khoảng cách).

```json
{
  "id": "guid",
  "title": "string",
  "address": "string",
  "wageAmount": 500000,
  "jobTypeName": "Daily",
  "distanceKm": 5.2,
  "farmerAverageRating": 4.8,
  "availablePositions": 8,
  "isUrgent": true,
  "matchScore": 85,
  "skillsMatchCount": 2,
  "allSkillsMatched": true
  // ... (Kế thừa các trường từ JobPostDTO)
}
```

### 2.5 JobApplicationDTO
Thông tin đơn ứng tuyển (đã nhúng kèm JobPost).

```json
{
  "id": "guid",
  "jobPostId": "guid",
  "jobPost": { ...JobPostDTO... },
  "worker": { ...WorkerProfileDTO... },
  "statusId": 1,
  "coverLetter": "string",
  "appliedAt": "2026-03-10T10:00:00Z",
  "workDates": ["2026-03-24T10:00:00Z"],
  "responseMessage": "string"
}
```

### 2.6 JobDetailDTO (Daily Report)
Dữ liệu báo cáo công việc hằng ngày của Worker.

```json
{
  "id": "guid",
  "jobApplicationId": "guid",
  "statusId": 1, 
  "workDate": "2026-03-03T00:00:00Z",
  "workerDescription": "Hôm nay tôi đã làm được...",
  "farmerFeedback": "Làm tốt",
  "farmerApprovedPercent": 100,
  "jobPrice": 500000,
  "workerPaymentAmount": 500000
}
```

---

## 3) APIs Công Khai (Public - Không cần Token)

Các API này phục vụ việc tìm kiếm việc làm và thông tin chung mà người dùng không cần đăng nhập vẫn có thể xem được.

### 3.1 Nhóm Công Việc & Danh Mục
- `GET /job/category`: Lấy toàn bộ danh mục công việc.
- `GET /job/category/{id}`: Xem chi tiết danh mục.
- `GET /job/post`: Lấy danh sách toàn bộ bài đăng (có thể phân trang nếu backend hỗ trợ).
- `GET /job/post/{id}`: Xem chi tiết một bài đăng cụ thể.

### 3.2 Nhóm Tìm Kiếm & Khám Phá (Discovery)
- `GET /job/post/nearby`: Tìm việc gần đây (Params: `latitude`, `longitude`, `maxDistanceKm`).
- `POST /job/post/search`: Tìm kiếm nâng cao với bộ lọc `JobSearchFilterRequest`.
- `GET /job/post/filter`: Lọc nhanh theo `title`, `category`, `address`.
- `GET /job/post/by-date`: Lọc theo ngày (`dateFilter`: today, weekend...).
- `GET /job/post/by-skill`: Lọc theo danh sách kỹ năng `skills` (phân cách dấu phẩy).
- `GET /job/post/by-wage`: Lọc theo khoảng lương (`minWage`, `maxWage`).
- `GET /job/post/urgent`: Lấy các công việc khẩn cấp gần vị trí.

### 3.3 Nhóm Thời Tiết (Public)
- `GET /weather/coordinates`: Lấy thời tiết qua tọa độ (`lat`, `lon`).
- `GET /weather/city`: Lấy thời tiết qua tên thành phố (`city`).

### 3.4 Nhóm Xác Thực (Auth)
- `POST /login`: Đăng nhập hệ thống.
    - *Lưu ý*: Nếu trả về `403 Forbidden`, nghĩa là Email chưa được xác thực.
- `POST /register`: Đăng ký tài khoản mới. Hệ thống sẽ gửi mã OTP vào Email.
- `POST /verify-email`: Xác thực tài khoản bằng OTP.
    - **Body**: `{ "email": "string", "otp": "string" }`
- `POST /resend-verification`: Gửi lại mã OTP xác thực.
    - **Body**: `{ "email": "string" }`
- `POST /google-login`: Đăng nhập bằng Google.
- `POST /forget`: Gửi mã OTP quên mật khẩu.
- `POST /reset`: Đặt lại mật khẩu mới bằng OTP.

---

## 4) Worker Profile APIs (Yêu cầu Token & Role: Worker)

### 3.1 GET `/worker`
- **Mục đích**: Lấy profile của chính mình qua token.
- **Role**: `Worker` ( Claims dựa trên Token )

### 3.2 PUT `/worker`
- **Mục đích**: Cập nhật thông tin hồ sơ (Bao gồm cập nhật danh sách `skillIds`).
- **Body**: `UpdateWorkerProfileRequest`

### 3.3 POST `/worker/upload-avatar`
- **Mục đích**: Tải lên ảnh đại diện.
- **Body**: `multipart/form-data` (`image`)
- **Response**: Trả về URL của ảnh.

---

## 5) Job Interaction APIs (Ứng tuyển - Yêu cầu Token)

*(Các API tìm kiếm công khai đã được liệt kê ở mục 3.2)*

### 5.1 POST `/job/application`
- **Mục đích**: Nộp đơn ứng tuyển.
- **Body**: `CreateJobApplicationRequest` (Cần gửi `workDates`).

### 5.2 GET `/job/application/worker`
- **Mục đích**: Xem toàn bộ lịch sử ứng tuyển của cá nhân.

### 5.3 DELETE `/job/application/cancel/{id}`
- **Mục đích**: Worker chủ động hủy đơn ứng tuyển đã nộp.

---

## 6) Job Daily Report APIs (Báo cáo công việc)

### 5.1 POST `/job/detail/report-daily`
- **Mục đích**: Worker gửi báo cáo kết quả công việc hằng ngày thay cho điểm danh.
- **Role**: `Worker`

### 5.2 GET `/job/detail/{id}`
- **Mục đích**: Xem chi tiết đánh giá từ Farmer sau khi Farmer đã duyệt báo cáo.

---

## 7) Wallet & Withdrawal APIs (Ví & Rút tiền)

### 6.1 GET `/wallet/me`
- **Mục đích**: Xem thông tin ví và số dư hiện có.

### 6.2 GET `/wallet-transaction/wallet/{walletId}`
- **Mục đích**: Lấy lịch sử biến động số dư.

### 6.3 POST `/withdraw`
- **Mục đích**: Tạo lệnh rút tiền về ngân hàng.

### 6.4 GET `/withdraw/account-balance`
- **Mục đích**: Lấy thông tin số dư khả dụng từ PayOS/Hệ thống ngân hàng tích hợp.

---

## 8) Notification APIs

### 7.1 GET `/notification/unread`
- **Mục đích**: Lấy danh sách thông báo chưa đọc phục vụ hiển thị Badge Icon.

### 7.2 POST `/notification/register-token`
- **Mục đích**: Liên kết Device Token (Expo/FCM) để nhận Push Notification.
- **Body**: `{"token": "string", "deviceName": "string"}`

---

## 9) Bảng Tra Cứu Enums (Dành cho Frontend)

### 8.1 Trạng Thái Đơn Ứng Tuyển (`ApplicationStatus`)
- `1`: Chờ duyệt (Pending)
- `2`: Đã được chấp nhận (Accepted)
- `3`: Bị từ chối (Rejected)
- `4`: Đã hủy (Cancelled)

### 8.2 Loại Công Việc (`JobType`)
- `1`: Khoán Trọn Gói (PerJob)
- `2`: Theo Công Nhật (Daily)

### 8.3 Trạng Thái Việc Làm (`JobPostStatus`)
- `2`: Đang Mở Tuyển (Published)
- `4`: Đang Tiến Hành (InProgress)
- `5`: Đã Hoàn Thành (Completed)

---

## 10) Ghi chú quan trọng

1. **camelCase**: Backend đã được cấu hình mặc định trả về JSON dạng camelCase. Team Mobile cần khai báo interface TypeScript tương ứng.
2. **Hủy đơn**: Sử dụng Endpoint `/cancel/{id}` thay vì DELETE đơn thuần để đảm bảo logic nghiệp vụ hủy record đúng quy trình.
3. **Daily Report**: Thay thế hoàn toàn cho luồng `Attendance` (Check-in/out). Worker cần gửi báo cáo này để Farmer duyệt lương hằng ngày.
4. **Skills**: Kỹ năng đã được tích hợp thẳng vào Profile Worker (GET `skills` và PUT `skillIds`), giúp hệ thống Match-Score tìm việc chính xác hơn.
