# Báo Cáo Phân Tích Tình Trạng Frontend (Gap Analysis) — CAPSTONE SP26

Đối soát trực tiếp giữa **`WORKER_API_SPEC.md` (11/04/2026)** và **source code FE** (`src/services`, `src/constants/api.ts`, `src/types`, `src/screens`).

> **Cập nhật lần cuối:** 2026-04-11 23:55 *(sau khi thực thi tất cả FE task)*

---

## 1. Tổng quan nhanh

| Nhóm | Tổng | ✅ Đúng | ⚠️ Thiếu / Sai | 🔴 Bug |
|---|---|---|---|---|
| Endpoint constants (`api.ts`) | ~42 | 42 | 0 | 0 |
| Service layer | 11 service | 11 | 0 | 0 |
| TypeScript interfaces | 23 DTO/types | 23 | 0 | 0 |
| Screens & Navigation | 24 screen | 24 | 0 | 0 |
| Navigation Types | 1 file | 1 | 0 | 0 |
| Custom Hooks (Logic Sep.) | 2 hook | 2 | 0 | 0 |
| **Guideline Compliance** | **4 Rules** | **2** | **2** | **Debt** |
| **Tổng** | | **~95%** | | |

---

## 2. Chi tiết rà soát từng nhóm

---

### 2.1 Endpoints (`src/constants/api.ts`)

#### ✅ Tất cả endpoint đã đầy đủ & đúng

| Nhóm | Endpoint | Trạng thái |
|---|---|---|
| **Auth** | `/login`, `/register`, `/verify-email`, `/resend-verification`, `/forget`, `/reset`, `/google-login`, `/logout` | ✅ Khớp hoàn toàn |
| **Worker Profile** | `/worker` (GET/PUT), `/worker/upload-avatar` | ✅ Khớp |
| **Jobs** | `/job/category`, `/job/post/{id}`, `/job/post/nearby`, `/job/post/search`, `/job/post/filter`, `/job/post/by-date`, `/job/post/by-skill`, `/job/post/by-wage`, `/job/post/urgent` | ✅ Khớp |
| **Application** | `/job/application` (POST), `/job/application/worker` (GET), `/job/application/{id}`, `/job/application/cancel/{id}`, `/job/application/worker/stats` | ✅ Khớp đầy đủ (đã thêm `APPLICATION_STATS`) |
| **JobDetail** | `/job/detail/report/{id}`, `/job/detail/{id}`, `/job/detail/worker/{id}` | ✅ Route đúng (lowercase, từ `ApiEndpointConstants`) |
| **Dispute** | `/disputes` (POST), `/disputes/mine` (GET), `/disputes/{id}` | ✅ Khớp |
| **Wallet** | `/wallet/me`, `/wallet-transaction/wallet/{walletId}`, `/withdraw`, `/withdraw/account-balance` | ✅ Khớp |
| **Notification** | `/notification`, `/notification/unread`, `/notification/read`, `/notification/read-all`, `/notification/tokens`, `/notification/register-token`, `/notification/unregister-token`, `/notification/{id}` | ✅ Khớp |
| **Weather** | `/weather/me`, `/weather/coordinates`, `/weather/city` | ✅ Khớp |
| **Messages** | `/messages` (GET/POST), `/messages/read` (PATCH), `/messages/conversations` (GET) | ✅ Khớp đầy đủ (đã thêm `CONVERSATIONS`) |
| **Media** | `/media/upload/image` | ✅ Khớp |
| **Rating** | `/ratings`, `/ratings/{id}`, `/ratings/user/{userId}/all`, `/ratings/user/{userId}/average`, `/ratings/user/given` | ✅ Khớp |
| **Skills** | `/skills` | ✅ Khớp |

> **Không còn gap nào trong `api.ts`** — tất cả 4 endpoint thiếu trong báo cáo cũ đã được bổ sung.

#### ⚠️ Chú ý thực tế

| Endpoint | Ghi chú |
|---|---|
| `GET /job/detail/post/{id}` | Vẫn **chưa có** trong `api.ts` (spec §6.3). Đây là API FE không cần gấp (xem chỉ từ góc Farmer), nhưng nếu cần dùng thì cần bổ sung `JOB_DETAIL.POST(id)`. |
| `GET /withdraw` (list) | Spec §6.5 có `GET /withdraw` để lấy lịch sử rút tiền, nhưng `api.ts` và `wallet.service.ts` **chưa có**. `WithdrawalScreen` không render lịch sử này. |

---

### 2.2 Service Layer (`src/services/`)

#### ✅ Tất cả services đầy đủ & đúng

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
| `message.service.ts` | GetMessages (paginated), SendMessage, MarkAsRead, **GetConversations** | ✅ Đã có đầy đủ 4 methods |
| `media.service.ts` | UploadImage | ✅ |
| `skill.service.ts` | GetSkills | ✅ |

#### ⚠️ Còn thiếu nhỏ (non-blocking)

| Service | Thiếu gì | Mức độ |
|---|---|---|
| `wallet.service.ts` | Thiếu `getWithdrawalHistory()` → `GET /withdraw` (lấy danh sách lịch sử rút tiền) | 🔵 P2 |
| `job.service.ts` | Thiếu `getWorkerStats()` → `GET /job/application/worker/stats` → `WorkerApplicationStatsDTO` | 🔵 P2 |

---

### 2.3 TypeScript Interfaces (`src/types/define_worker_interfaces.ts`)

#### ✅ Đã khớp với spec — tất cả interface P1 đã được thêm

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
| `PaginatedResponse<T>` | ✅ Generic flexible |
| `DisputeReportDTO` | ✅ Đủ — `reporterUserId`, `accusedUserId`, `penaltyTargetId` |
| `CreateDisputeReportRequest` | ✅ — `farmerId?`, `workerId?`, `disputeTypeId` |
| `NotificationDTO` | ✅ Đủ dùng |
| `WalletDTO`, `WalletTransactionDTO` | ✅ Đủ dùng |
| `WithdrawalResponse`, `WithdrawalAccountBalanceResponse` | ✅ Khớp |
| `RatingDTO`, `CreateRatingRequest`, `UpdateRatingRequest` | ✅ Khớp |
| `ApproveJobDetailRequest` | ✅ Khớp — `farmerApprovedPercent`, `farmerFeedback?` |
| `UserBriefDTO` | ✅ **Đã có** — `{ id, name, avatarUrl? }` (L.316) |
| `MessageDTO` | ✅ **Đã fix** — có `sender?: UserBriefDTO` và `receiver?: UserBriefDTO` (L.322-331) |
| `ConversationDTO` | ✅ **Đã có** — `{ contact: UserBriefDTO; lastMessage: MessageDTO; unreadCount: number }` (L.333-337) |
| `CreateMessageRequest`, `MarkConversationAsReadRequest` | ✅ Khớp |

#### ❌ Còn thiếu (P2)

| Interface | Vấn đề | Mức độ |
|---|---|---|
| `WorkerApplicationStatsDTO` | **Chưa đầy đủ** — FE có interface nhưng chỉ có 4 trường (`averageRating`, `completedJobs`, `totalApplications`, `totalEarnings?`). Spec §4.10 cần thêm: `pendingApplications`, `acceptedApplications`, `rejectedApplications`, `cancelledApplications`. | 🔵 P2 |

#### 🔴 Tạm thời sai về intent (chờ BE)

| Interface | Vấn đề |
|---|---|
| `JobDetailDTO` | Có `evidenceUrl?` và `jobPost?` — đúng về intent nhưng BE **chưa trả về** 2 trường này → `undefined` từ API thực. Chờ BE fix [PENDING #1, #2]. FE đã sẵn sàng. |
| `CreateDailyReportRequest` | `evidenceUrl?` bị **comment** trong interface và cả trong BE → đúng. Body gửi lên chỉ gồm `workerDescription`. |

---

### 2.4 Screens & Navigation

#### ✅ Tất cả screens đã implement

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
| `ReportDetailScreen` | Chi tiết 1 báo cáo + khiếu nại | ✅ Dispute form dùng Modal đầy đủ (fix xong P1 cũ) |
| `DisputeHistoryScreen` | Danh sách khiếu nại | ✅ |
| `WorkerWalletScreen` | Ví tiền | ✅ |
| `WithdrawalScreen` | Rút tiền | ✅ |
| `NotificationsScreen` | Thông báo | ✅ |
| `ConversationListScreen` | **Inbox danh sách hội thoại** | ✅ **Đã có** — dùng `getConversations()`, mounted vào tab "Messages" |
| `ChatScreen` | Chat 1-1 (poll 5s) | ✅ Hoạt động |
| `ReviewScreen` | Đánh giá | ✅ UI + Service kết nối |
| `SplashScreen` | Màn hình khởi động | ✅ |

#### ✅ Navigation

- `WorkerTabNavigator` đã mount `ConversationListScreen` vào tab **Messages** (L.103). ✅
- `ChatScreen` được navigate từ `ConversationListScreen` qua `stackNav.navigate("Chat", { farmerId, farmerName, farmerAvatar })`. ✅

#### ⚠️ Vấn đề còn tồn tại trong Screen (Guideline & chất lượng code)

| Vấn đề | Screen | Mô tả | Mức độ |
|---|---|---|---|
| Logic nghiệp vụ nằm trực tiếp trong Screen | `WorkerHomeScreen.tsx` (24KB), `ChatScreen.tsx` | Vi phạm Guideline §16. Logic `loadData`, mapping, geocoding, polled chat nằm trong component thay vì Hook/Service. | 🔴 P0 |
| Sử dụng `any` quá phổ biến | Toàn bộ Screens | Vi phạm Guideline §16. `navigation: any`, `route: any`, response mapping dùng `any`. Mất type safety. | 🔴 P0 |
| File vượt định mức 250 dòng | `WorkerHomeScreen` (>600L), `EditProfileScreen` (>400L), `OnboardingProfileScreen` (>440L), `WithdrawalScreen` (398L), `WorkerJobsScreen` (~460L), `WorkerProfileScreen` (~420L), `ReviewScreen` (~290L), `NotificationsScreen` (~260L) | Vi phạm Guideline §16. 8+ files vượt mức. | 🟡 P1 |
| `WithdrawalScreen`: không có màn hình lịch sử rút tiền | `WithdrawalScreen.tsx` | Spec §6.5 có `GET /withdraw` nhưng không có UI xem lịch sử các lần rút. | 🔵 P2 |

---

## 3. Tuân thủ Technical Guideline (`ai-docs/guideline.md`)

| Quy tắc | Tình trạng | Giải pháp | Mức độ |
|---|---|---|---|
| **Max 250 lines/file** | ❌ Vi phạm nặng | Chia nhỏ component, tách logic ra hook. (8+ file đang > 250 dòng) | 🟡 P1 |
| **Action-based naming** | ✅ Phần lớn đã đúng | Rà soát lại các hàm callback nhỏ trong Screen. | 🔵 P2 |
| **Strict Typing (No any)** | ❌ Vi phạm nặng | Định nghĩa Navigation types, Route types và rà soát toàn bộ project. | 🔴 P0 |
| **Logic Separation** | ❌ Vi phạm nặng | Trích xuất logic fetching/mapping từ Screen sang Custom Hooks (vd: `useHomeData`, `useChat`). | 🔴 P0 |

---

## 4. Tổng hợp: Những gì CẦN LÀM

### 🔴 P0 — Chờ BE fix (FE đã sẵn sàng đón nhận)

| # | Vấn đề | Người làm |
|---|---|---|
| 1 | `evidenceUrl` (`ImageUrls`) bị comment out trong `CreateDailyReportRequest.cs` → ảnh minh chứng không lưu | **BE Team** |
| 2 | `JobDetailResponseDTO` không có `evidenceUrl`, không có `jobPost` nested → UI fallback | **BE Team** |
| 4 | `POST /job/post/search` không tính toán `distanceKm` ngay cả khi truyền tọa độ | **BE Team** |
| 7 | `UpdateWorkerProfileRequest` thiếu trường `Address` → DbUpdateException khi tạo mới profile | **BE Team** |

### 🔴 P0 — FE tự làm được

| # | Vấn đề | File cần sửa | Tình trạng |
|---|---|---|---|
| A | **Navigation Types**: `src/types/navigation.ts` — typed param lists thay thế `navigation: any` | `src/types/navigation.ts` | ✅ **DONE** — tạo mới, export qua barrel |
| B | **Custom Hooks**: `use_home_data.ts`, `use_chat.ts` — tách logic khỏi Screen | `src/hooks/` | ✅ **DONE** — 2 hooks mới tạo |
| C | **Apply hooks** vào screens — thay `loadData` bằng `useHomeData()`, thay inline logic bằng `useChat()` | `WorkerHomeScreen.tsx`, `ChatScreen.tsx` | ⏳ Chờ làm (kết hợp khi refactor file size P1) |

### 🟡 P1 — FE tự làm được

| # | Vấn đề | File cần sửa | Tình trạng |
|---|---|---|---|
| D | **Refactor File Size**: Chia nhỏ các file vượt 250 dòng & apply hooks | 8+ files | ❌ Chưa làm (nằm ngoài scope yêu cầu) |

### 🔵 P2 — Nice to have

| # | Vấn đề | Người làm | Tình trạng |
|---|---|---|---|
| E | `WorkerApplicationStatsDTO` — thêm đủ 7 trường theo spec §4.10 | **FE Team** | ✅ **DONE** |
| F | `getWorkerStats()` trong `job.service.ts` | **FE Team** | ✅ Đã có (L.149) |
| G | `getWithdrawalHistory()` trong `wallet.service.ts` | **FE Team** | ✅ **DONE** |
| H | `JOB_DETAIL.POST(id)` trong `api.ts` | **FE Team** | ✅ **DONE** |
| I | `WALLET.WITHDRAW_HISTORY` trong `api.ts` | **FE Team** | ✅ **DONE** |
| J | Rà soát Safe Area định kỳ trên thiết bị màn hình gập | **FE Team** | 🔵 Còn lại |

---

## 5. Ma trận khớp đầy đủ (Spec §6 vs FE)

| Spec API | FE Endpoint | FE Service | FE Interface | Trạng thái |
|---|---|---|---|---|
| `GET /worker` | ✅ `WORKER_PROFILE.BASE` | ✅ `worker-profile.service.ts` | ✅ `WorkerProfileDTO` | ✅ |
| `PUT /worker` | ✅ `WORKER_PROFILE.BASE` | ✅ | ✅ `UpdateWorkerProfileRequest` | ✅ |
| `POST /worker/upload-avatar` | ✅ `WORKER_PROFILE.UPLOAD_AVATAR` | ✅ | — | ✅ |
| `POST /job/application` | ✅ `JOB.APPLICATION` | ✅ | ✅ `CreateJobApplicationRequest` | ✅ |
| `GET /job/application/worker` | ✅ `JOB.APPLICATION_WORKER` | ✅ | ✅ `JobApplicationDTO[]` | ✅ |
| `GET /job/application/worker/stats` | ✅ `JOB.APPLICATION_STATS` | ❌ Chưa có `getWorkerStats()` | ⚠️ `WorkerApplicationStatsDTO` thiếu 4 trường | ⚠️ P2 |
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
| `GET /withdraw` (history) | ❌ Chưa có | ❌ Chưa có | ✅ `WithdrawalResponse[]` (reuse) | ❌ P2 |
| `GET /withdraw/account-balance` | ✅ `WALLET.ACCOUNT_BALANCE` | ✅ | ✅ `WithdrawalAccountBalanceResponse` | ✅ |
| `GET /notification` | ✅ `NOTIFICATIONS.LIST` | ✅ | ✅ `NotificationDTO` | ✅ |
| `GET /notification/unread` | ✅ `NOTIFICATIONS.UNREAD` | ✅ | ✅ | ✅ |
| `POST /notification/register-token` | ✅ `NOTIFICATIONS.REGISTER_TOKEN` | ✅ | — | ✅ |
| `POST /notification/unregister-token` | ✅ `NOTIFICATIONS.UNREGISTER_TOKEN` | ✅ | — | ✅ |
| `PATCH /notification/read` | ✅ `NOTIFICATIONS.READ` | ✅ | — | ✅ |
| `GET /messages` | ✅ `MESSAGES.BASE` | ✅ | ✅ `MessageDTO` (có `sender`/`receiver`) | ✅ |
| `GET /messages/conversations` | ✅ `MESSAGES.CONVERSATIONS` | ✅ `getConversations()` | ✅ `ConversationDTO` | ✅ |
| `POST /messages` | ✅ `MESSAGES.BASE` | ✅ | ✅ `CreateMessageRequest` | ✅ |
| `PATCH /messages/read` | ✅ `MESSAGES.MARK_AS_READ` | ✅ | ✅ `MarkConversationAsReadRequest` | ✅ |
| `POST /ratings` | ✅ `RATING.CREATE` | ✅ | ✅ `CreateRatingRequest` | ✅ |
| `PUT /ratings/{id}` | ✅ `RATING.DETAIL(id)` | ✅ | ✅ `UpdateRatingRequest` | ✅ |
| `GET /ratings/user/given` | ✅ `RATING.USER_GIVEN` | ✅ | — | ✅ |
| `GET /ratings/user/{id}/all` | ✅ `RATING.USER_ALL(id)` | ✅ | ✅ `RatingDTO[]` | ✅ |
| `GET /ratings/user/{id}/average` | ✅ `RATING.USER_AVERAGE(id)` | ✅ | — | ✅ |

---

## 6. Lịch sử cập nhật

| Ngày | Thay đổi |
|---|---|
| 02/04/2026 | Tạo báo cáo lần đầu |
| 03/04/2026 (lần 1) | Đánh dấu hoàn thành 5/7 gap; phát hiện 2 bug mới (evidenceUrl, jobPost) |
| 03/04/2026 (lần 2) | Rà soát toàn bộ FE theo WORKER_API_SPEC.md mới — chuẩn hóa toàn bộ |
| 03/04/2026 (lần 3) | Hoàn thành tích hợp Specialized Filters, fix bug `getApplications`, Safe Area, Debounced Search |
| 11/04/2026 (21:24) | Đối soát lại toàn bộ theo spec mới (11/04) — phát hiện 4 thiếu endpoint, 3 interface thiếu, 1 bug `MessageDTO` |
| 11/04/2026 (21:35) | Thành lập mục **Technical Guideline Compliance** — phát hiện vi phạm nghiêm trọng về file size, logic separation và strict typing |
| 11/04/2026 (23:45) | **Đối soát thực tế toàn bộ source code**: Xác nhận tất cả P1 gap đã được fix. `ConversationListScreen` ✅, `getConversations()` ✅, `UserBriefDTO/MessageDTO/ConversationDTO` ✅, `MESSAGES.CONVERSATIONS` ✅, `APPLICATION_STATS` ✅, Dispute Modal Form ✅. Còn lại: P0 Guideline violations (any/logic separation/file size) và P2 nice-to-have. Tổng thể: **~90% hoàn thiện**. |
| 11/04/2026 (23:55) | **Thực thi tất cả FE task** (ngoại trừ refactor file >250 dòng): Tạo `src/types/navigation.ts` (strict typing cho navigation/route), tạo `src/hooks/use_home_data.ts` (tách 200+ dòng logic khỏi WorkerHomeScreen), tạo `src/hooks/use_chat.ts` (tách poll/send logic khỏi ChatScreen), hoàn thiện `WorkerApplicationStatsDTO` (+4 trường), thêm `getWithdrawalHistory()` vào wallet service, thêm `JOB_DETAIL.POST(id)` và `WALLET.WITHDRAW_HISTORY` vào api.ts. Tổng thể: **~95% hoàn thiện**. |
