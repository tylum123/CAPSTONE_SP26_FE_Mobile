# Báo Cáo Phân Tích Tình Trạng Frontend (Gap Analysis) — CAPSTONE SP26

Đối soát trực tiếp giữa **`WORKER_API_SPEC.md` (11/04/2026)** và **source code FE** (`src/services`, `src/constants/api.ts`, `src/types`, `src/screens`).

> **Cập nhật lần cuối:** 2026-04-11 21:24

---

## 1. Tổng quan nhanh

| Nhóm | Tổng | ✅ Đúng | ⚠️ Thiếu / Sai | 🔴 Bug |
|---|---|---|---|---|
| Endpoint constants (`api.ts`) | ~38 | 34 | 4 | 0 |
| Service layer | 10 service | 9 | 1 | 1 |
| TypeScript interfaces | 18 DTO | 14 | 4 | 1 |
| Screens & Navigation | 22 screen | 21 | 1 | 0 |
| **Guideline Compliance** | **4 Rules** | **0** | **4** | **Debt** |
| **Tổng** | | **~75%** | | |

---

## 2. Chi tiết rà soát từng nhóm

---

### 2.1 Endpoints (`src/constants/api.ts`)

#### ✅ Đã đúng & đầy đủ

| Nhóm | Endpoint | Trạng thái |
|---|---|---|
| **Auth** | `/login`, `/register`, `/verify-email`, `/resend-verification`, `/forget`, `/reset`, `/google-login`, `/logout` | ✅ Khớp hoàn toàn |
| **Worker Profile** | `/worker` (GET/PUT), `/worker/upload-avatar` | ✅ Khớp |
| **Jobs** | `/job/category`, `/job/post/{id}`, `/job/post/nearby`, `/job/post/search`, `/job/post/filter`, `/job/post/by-date`, `/job/post/by-skill`, `/job/post/by-wage`, `/job/post/urgent` | ✅ Khớp |
| **Application** | `/job/application` (POST), `/job/application/worker` (GET), `/job/application/{id}`, `/job/application/cancel/{id}` | ✅ Khớp |
| **JobDetail** | `/job/detail/report/{id}`, `/job/detail/{id}`, `/job/detail/worker/{id}` | ✅ Route đúng (lowercase, từ `ApiEndpointConstants`) |
| **Dispute** | `/disputes` (POST), `/disputes/mine` (GET), `/disputes/{id}` | ✅ Khớp |
| **Wallet** | `/wallet/me`, `/wallet-transaction/wallet/{walletId}`, `/withdraw`, `/withdraw/account-balance` | ✅ Khớp |
| **Notification** | `/notification`, `/notification/unread`, `/notification/read`, `/notification/read-all`, `/notification/tokens`, `/notification/register-token`, `/notification/unregister-token`, `/notification/{id}` | ✅ Khớp |
| **Weather** | `/weather/me`, `/weather/coordinates`, `/weather/city` | ✅ Khớp |
| **Messages** | `/messages` (GET/POST), `/messages/read` (PATCH) | ✅ Khớp |
| **Media** | `/media/upload/image` | ✅ Khớp |
| **Rating** | `/ratings`, `/ratings/{id}`, `/ratings/user/{userId}/all`, `/ratings/user/{userId}/average`, `/ratings/user/given` | ✅ Khớp |
| **Skills** | `/skills` | ✅ Khớp |

#### ❌ Thiếu trong `api.ts`

| Endpoint thiếu | Spec nguồn | Mức độ |
|---|---|---|
| `GET /messages/conversations` | Spec §6.7, `GET /messages/conversations` → `ConversationDTO[]` (inbox) | 🟡 P1 |
| `GET /job/application/worker/stats` | Spec §6.2, `WorkerApplicationStatsDTO` | 🔵 P2 |
| `GET /job/detail/post/{id}` | Spec §6.3, lấy daily report theo `jobPostId` | 🔵 P2 |
| `POST /job/detail/approve/{id}` | Spec §6.3, Farmer phê duyệt (FE Worker không cần dùng) | 🔵 P2 |

---

### 2.2 Service Layer (`src/services/`)

#### ✅ Services đã đầy đủ & đúng

| Service | Coverage | Trạng thái |
|---|---|---|
| `auth.service.ts` | Login, Register, Logout, VerifyEmail, ResendVerification, ForgotPassword, ResetPassword | ✅ |
| `worker-profile.service.ts` | GetProfile, UpdateProfile, UploadAvatar | ✅ |
| `job.service.ts` | GetCategories, GetNearby, Search, Filter, GetDetail, Apply, GetApplications, CancelApplication | ✅ |
| `daily_report.service.ts` | SubmitDailyReport, GetById, GetWorkerReports | ✅ Route đúng (lowercase `/job/detail/...`) |
| `dispute.service.ts` | Create, GetMine | ✅ |
| `wallet.service.ts` | GetWallet, GetTransactions, CreateWithdrawal, GetAccountBalance | ✅ |
| `notification.service.ts` | GetAll, GetUnread, MarkAsRead, MarkAllAsRead, RegisterToken, UnregisterToken | ✅ |
| `rating.service.ts` | CreateRating, UpdateRating, GetUserRatings, GetGivenRatings, GetAverageRating | ✅ |
| `message.service.ts` | GetMessages (paginated), SendMessage, MarkAsRead | ✅ Đã handle paginated response |

#### ❌ Thiếu / Cần thêm

| Service | Thiếu gì | Mức độ |
|---|---|---|
| `message.service.ts` | Thiếu `getConversations()` → `GET /messages/conversations` để lấy danh sách inbox | 🟡 P1 |

#### 🔴 Bug trong service

| Service | Bug | Mức độ |
|---|---|---|
| `ChatScreen.tsx` (không phải service) | `MessageDTO` trong FE interface **thiếu trường `sender` và `receiver`** (embedded `UserBriefDTO`). BE trả về 2 trường này nhưng FE interface chỉ có `senderId`/`receiverId` dạng string → khi dùng `sender?.name` sẽ là `undefined`. ChatScreen hiện dùng `route.params.farmerName` để workaround nhưng không dùng được dữ liệu từ API. | 🟡 P1 |

---

### 2.3 TypeScript Interfaces (`src/types/define_worker_interfaces.ts`)

#### ✅ Đã khớp với spec

| Interface | Trạng thái |
|---|---|
| `WorkerProfileDTO` | ✅ Khớp — `date_of_birth` snake_case, `genderId`, `skills[]` |
| `UpdateWorkerProfileRequest` | ✅ Khớp — đã workaround `address` field (PENDING #7) |
| `JobPostDTO` | ✅ Khớp hoàn toàn |
| `JobDiscoveryDTO extends JobPostDTO` | ✅ Khớp — đủ trường bổ sung |
| `JobApplicationDTO` | ✅ Khớp — có `jobPost?`, `worker?`, `workDates?`, `locationName?` |
| `CreateJobApplicationRequest` | ✅ Khớp — có `workDates?` |
| `JobSearchFilterRequest` | ✅ Đầy đủ |
| `PaginatedJobDiscoveryResponse` | ✅ Khớp |
| `PaginatedResponse<T>` | ✅ Generic flexible (handle nhiều shape API response) |
| `DisputeReportDTO` | ✅ Đã có đủ `reporterUserId`, `accusedUserId`, `penaltyTargetId` |
| `CreateDisputeReportRequest` | ✅ Đã có `farmerId?`, `workerId?` |
| `NotificationDTO` | ✅ Đủ dùng (thêm `typeName` của FE, không xung đột) |
| `WalletDTO`, `WalletTransactionDTO` | ✅ Đủ dùng |
| `RatingDTO`, `CreateRatingRequest`, `UpdateRatingRequest` | ✅ Khớp |
| `ApproveJobDetailRequest` | ✅ Khớp — `farmerApprovedPercent`, `farmerFeedback?` |

#### ❌ Thiếu hoặc sai

| Interface | Vấn đề | Mức độ |
|---|---|---|
| `MessageDTO` | **Thiếu `sender?: UserBriefDTO` và `receiver?: UserBriefDTO`** — BE nhúng 2 object này vào response nhưng FE interface chỉ có `senderId`/`receiverId` string. Sẽ không đọc được `sender.name`, `sender.avatarUrl` từ API. | 🟡 P1 |
| `ConversationDTO` | **Chưa có interface** — cần thêm `{ contact: UserBriefDTO; lastMessage: MessageDTO; unreadCount: number }` để dùng cho inbox screen | 🟡 P1 |
| `UserBriefDTO` | **Chưa có interface** — cần thêm `{ id: string; name: string; avatarUrl?: string }` (dùng bởi MessageDTO và ConversationDTO) | 🟡 P1 |
| `WorkerApplicationStatsDTO` | **Chưa có interface** — cần thêm `{ totalApplications, pendingApplications, acceptedApplications, rejectedApplications, cancelledApplications, completedJobs, totalEarnings }` | 🔵 P2 |

#### 🔴 Tạm thời sai về intent (do chờ BE)

| Interface | Vấn đề | Mức độ |
|---|---|---|
| `JobDetailDTO` | Có `evidenceUrl?` và `jobPost?: Partial<JobPostDTO>` — đúng về intent nhưng BE **chưa trả về** 2 trường này → luôn là `undefined` khi nhận từ API thực. Khi BE fix [PENDING #1, #2] thì FE đã sẵn sàng. | 🔴 Chờ BE |
| `CreateDailyReportRequest` | `evidenceUrl?` đang có trong interface nhưng **bị comment** trong BE → BE bỏ qua khi nhận. FE interface hiện đã comment cả `jobApplicationId` (đúng vì nó được truyền qua route). | 🔴 Chờ BE |

---

### 2.4 Screens & Navigation

#### ✅ Screens đã implement

| Screen | Chức năng | Trạng thái |
|---|---|---|
| `LoginScreen` | Đăng nhập + Google | ✅ |
| `RegisterScreen` | Đăng ký | ✅ |
| `VerifyEmailScreen` | OTP verify + resend countdown | ✅ |
| `ForgotPasswordScreen` | Quên mật khẩu | ✅ |
| `OnboardingProfileScreen` | Tạo profile lần đầu | ✅ |
| `WorkerHomeScreen` | Trang chủ, gợi ý việc | ✅ |
| `WorkerJobsScreen` | Danh sách việc + đơn ứng tuyển | ✅ |
| `WorkerSearchScreen` | Tìm kiếm job | ✅ |
| `WorkerProfileScreen` | Xem hồ sơ | ✅ |
| `EditProfileScreen` | Sửa hồ sơ + chọn kỹ năng | ✅ |
| `JobDetailScreen` | Chi tiết bài đăng | ✅ |
| `SubmitReportScreen` | Gửi báo cáo ngày | ✅ |
| `ReportHistoryScreen` | Lịch sử báo cáo | ✅ |
| `ReportDetailScreen` | Chi tiết 1 báo cáo + khiếu nại | ✅ |
| `DisputeHistoryScreen` | Danh sách khiếu nại | ✅ |
| `WorkerWalletScreen` | Ví tiền | ✅ |
| `WithdrawalScreen` | Rút tiền | ✅ |
| `NotificationsScreen` | Thông báo | ✅ |
| `ChatScreen` | Chat 1-1 (poll 5s) | ✅ Hoạt động, nhưng xem bug bên dưới |
| `ReviewScreen` | Đánh giá | ✅ UI + Service kết nối |
| `SplashScreen` | Màn hình khởi động | ✅ |

#### ⚠️ Chức năng còn thiếu trong Screen

| Vấn đề | Screen | Mô tả | Mức độ |
|---|---|---|---|
| Không có màn hình inbox/danh sách cuộc hội thoại | Chưa có | Spec §6.7 có `GET /messages/conversations` → `ConversationDTO[]` nhưng FE chưa có screen liệt kê tất cả cuộc chat. Hiện chỉ có `ChatScreen` mở thẳng khi biết `farmerId`. | 🟡 P1 |
| `ChatScreen` không dùng được `sender.name`/`sender.avatarUrl` từ API | `ChatScreen.tsx` | FE dùng `route.params.farmerName` thay vì data từ API do interface thiếu. Khi BE trả về `sender: { name, avatarUrl }`, FE sẽ hiển thị sai tên nếu không update interface. | 🟡 P1 |
| Dispute form `reason` hardcode | `ReportDetailScreen.tsx (L.81)` | `reason` bị hardcode chuỗi cứng. Chưa có form cho Worker tự nhập `reason`, `description`, `disputeTypeId`. | 🟡 P1 |
| Logic nghiệp vụ nằm trực tiếp trong Screen | `WorkerHomeScreen.tsx`, `ChatScreen.tsx` | Vi phạm Guideline §16. Logic `loadData` (mapping, filtering, geocoding) và Polling nằm trong component thay vì Hook/Service. | 🔴 P0 |
| Sử dụng `any` quá phổ biến | Toàn bộ Screens | Vi phạm Guideline §16. `navigation: any`, `route: any`, response mapping dùng `any`. Mất an toàn kiểu dữ liệu. | 🔴 P0 |
| File vượt định mức 250 dòng | Nhiều files | Vi phạm Guideline §16. Xem chi tiết tại `refactoring_plan.md`. | 🟡 P1 |

---

## 3. Tuân thủ Technical Guideline (`ai-docs/guideline.md`)

| Quy tắc | Tình trạng | Giải pháp | Mức độ |
|---|---|---|---|
| **Max 250 lines/file** | ❌ Vi phạm nặng | Chia nhỏ component, tách logic ra hook. (14 file đang > 250 dòng) | 🟡 P1 |
| **Action-based naming** | ⚠️ Đã làm | Cần rà soát lại các hàm callback nhỏ trong Screen. | 🔵 P2 |
| **Strict Typing (No any)** | ❌ Vi phạm nặng | Định nghĩa Navigation types, Route types và rà soát toàn bộ project. | 🔴 P0 |
| **Logic Separation** | ❌ Vi phạm nặng | Trích xuất logic fetching/mapping từ Screen sang Custom Hooks (vd: `useHomeData`, `useChat`). | 🔴 P0 |

---

## 3. Tổng hợp: Những gì CẦN LÀM

### 🔴 P0 — Chờ BE fix (FE đã sẵn sàng đón nhận)

| # | Vấn đề | Người làm |
|---|---|---|
| 1 | `evidenceUrl` (`ImageUrls`) bị comment out trong `CreateDailyReportRequest.cs` → ảnh minh chứng không lưu | **BE Team** |
| 2 | `JobDetailResponseDTO` không có `evidenceUrl`, không có `jobPost` nested → UI fallback | **BE Team** |
| 3 | **Strict Typing**: Thay thế toàn bộ `any` bằng interface cụ thể (Navigation, Route, Data) | **FE Team** |
| 4 | **Logic Separation**: Trích xuất logic từ `WorkerHomeScreen` và `ChatScreen` sang Custom Hooks | **FE Team** |

### 🟡 P1 — FE tự làm được

| # | Vấn đề | Người làm | File cần sửa |
|---|---|---|---|
| 3 | Thêm `UserBriefDTO`, cập nhật `MessageDTO` thêm `sender?` & `receiver?`, thêm `ConversationDTO` interface | **FE Team** | `define_worker_interfaces.ts` |
| 4 | Thêm `getConversations()` vào `message.service.ts` → `GET /messages/conversations` | **FE Team** | `message.service.ts` |
| 5 | Thêm `CONVERSATIONS` constant vào `API_ENDPOINTS.MESSAGES` | **FE Team** | `constants/api.ts` |
| 6 | Dispute form: thay Alert cứng bằng Modal → Worker tự nhập `reason`, `description`, `disputeTypeId` | **FE Team** | `ReportDetailScreen.tsx` |
| 7 | (Optional) Tạo `ConversationListScreen` (inbox) — list cuộc hội thoại | **FE Team** | Screen mới |
| 8 | **Refactor File Size**: Chia nhỏ các file vượt 250 dòng (theo `refactoring_plan.md`) | **FE Team** | Nhiều file |

### 🔵 P2 — Nice to have

| # | Vấn đề | Người làm |
|---|---|---|
| 8 | Thêm `WorkerApplicationStatsDTO` interface và `getWorkerStats()` service | **FE Team** |
| 9 | Thêm `GET /job/detail/post/{id}` endpoint vào `api.ts` | **FE Team** |
| 10 | Rà soát Safe Area định kỳ trên thiết bị màn hình gập | **FE Team** |

---

## 4. Ma trận khớp đầy đủ (Spec §6 vs FE)

| Spec API | FE Endpoint | FE Service | FE Interface | Trạng thái |
|---|---|---|---|---|
| `GET /worker` | ✅ `WORKER_PROFILE.BASE` | ✅ `worker-profile.service.ts` | ✅ `WorkerProfileDTO` | ✅ |
| `PUT /worker` | ✅ `WORKER_PROFILE.BASE` | ✅ | ✅ `UpdateWorkerProfileRequest` | ✅ |
| `POST /worker/upload-avatar` | ✅ `WORKER_PROFILE.UPLOAD_AVATAR` | ✅ | — | ✅ |
| `POST /job/application` | ✅ `JOB.APPLICATION` | ✅ | ✅ `CreateJobApplicationRequest` | ✅ |
| `GET /job/application/worker` | ✅ `JOB.APPLICATION_WORKER` | ✅ | ✅ `JobApplicationDTO[]` | ✅ |
| `GET /job/application/worker/stats` | ❌ Chưa có | ❌ Chưa có | ❌ Chưa có `WorkerApplicationStatsDTO` | ❌ P2 |
| `PUT /job/application/cancel/{id}` | ✅ `JOB.CANCEL_APPLICATION(id)` | ✅ | — | ✅ |
| `POST /job/detail/report/{id}` | ✅ `JOB_DETAIL.REPORT_DAILY(id)` | ✅ | ✅ `CreateDailyReportRequest` | ✅ |
| `GET /job/detail/{id}` | ✅ `JOB_DETAIL.DETAIL(id)` | ✅ | ✅ `JobDetailDTO` | ✅ |
| `GET /job/detail/worker/{id}` | ✅ `JOB_DETAIL.WORKER(id)` | ✅ | ✅ `JobDetailResponseDTO` (paginated) | ✅ |
| `GET /job/detail/post/{id}` | ❌ Chưa có | ❌ Chưa có | — | ❌ P2 |
| `POST /disputes` | ✅ `DISPUTE.CREATE` | ✅ | ✅ `CreateDisputeReportRequest` | ✅ |
| `GET /disputes/mine` | ✅ `DISPUTE.MY` | ✅ | ✅ `DisputeReportDTO[]` | ✅ |
| `GET /wallet/me` | ✅ `WALLET.ME` | ✅ | ✅ `WalletDTO` | ✅ |
| `GET /wallet-transaction/wallet/{id}` | ✅ `WALLET.TRANSACTIONS(id)` | ✅ | ✅ `WalletTransactionDTO[]` | ✅ |
| `POST /withdraw` | ✅ `WALLET.WITHDRAW` | ✅ | ✅ `WithdrawalResponse` | ✅ |
| `GET /withdraw/account-balance` | ✅ `WALLET.ACCOUNT_BALANCE` | ✅ | ✅ `WithdrawalAccountBalanceResponse` | ✅ |
| `GET /notification` | ✅ `NOTIFICATIONS.LIST` | ✅ | ✅ `NotificationDTO` | ✅ |
| `GET /notification/unread` | ✅ `NOTIFICATIONS.UNREAD` | ✅ | ✅ | ✅ |
| `POST /notification/register-token` | ✅ `NOTIFICATIONS.REGISTER_TOKEN` | ✅ | — | ✅ |
| `POST /notification/unregister-token` | ✅ `NOTIFICATIONS.UNREGISTER_TOKEN` | ✅ | — | ✅ |
| `PATCH /notification/read` | ✅ `NOTIFICATIONS.READ` | ✅ | — | ✅ |
| `GET /messages` | ✅ `MESSAGES.BASE` | ✅ | ⚠️ `MessageDTO` thiếu `sender`/`receiver` | ⚠️ P1 |
| `GET /messages/conversations` | ❌ Chưa có | ❌ Chưa có | ❌ Chưa có `ConversationDTO` | ❌ P1 |
| `POST /messages` | ✅ `MESSAGES.BASE` | ✅ | ✅ `CreateMessageRequest` | ✅ |
| `PATCH /messages/read` | ✅ `MESSAGES.MARK_AS_READ` | ✅ | ✅ `MarkConversationAsReadRequest` | ✅ |
| `POST /ratings` | ✅ `RATING.CREATE` | ✅ | ✅ `CreateRatingRequest` | ✅ |
| `PUT /ratings/{id}` | ✅ `RATING.DETAIL(id)` | ✅ | ✅ `UpdateRatingRequest` | ✅ |
| `GET /ratings/user/given` | ✅ `RATING.USER_GIVEN` | ✅ | — | ✅ |
| `GET /ratings/user/{id}/all` | ✅ `RATING.USER_ALL(id)` | ✅ | ✅ `RatingDTO[]` | ✅ |
| `GET /ratings/user/{id}/average` | ✅ `RATING.USER_AVERAGE(id)` | ✅ | — | ✅ |

---

## 5. Lịch sử cập nhật

| Ngày | Thay đổi |
|---|---|
| 02/04/2026 | Tạo báo cáo lần đầu |
| 03/04/2026 (lần 1) | Đánh dấu hoàn thành 5/7 gap; phát hiện 2 bug mới (evidenceUrl, jobPost) |
| 03/04/2026 (lần 2) | Rà soát toàn bộ FE theo WORKER_API_SPEC.md mới — chuẩn hóa toàn bộ |
| 03/04/2026 (lần 3) | Hoàn thành tích hợp Specialized Filters, fix bug `getApplications`, Safe Area, Debounced Search |
| 11/04/2026 | Đối soát lại toàn bộ theo spec mới (11/04) — phát hiện 4 thiếu endpoint, 3 interface thiếu (`UserBriefDTO`, `ConversationDTO`, `WorkerApplicationStatsDTO`), 1 bug `MessageDTO`, thêm ma trận khớp đầy đủ |
| 11/04/2026 (21:35) | Thành lập mục **Technical Guideline Compliance** — Audit mức Senior phát hiện vi phạm nghiêm trọng về file size, logic separation và strict typing (`any`). |
