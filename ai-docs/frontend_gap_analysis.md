# Báo Cáo Phân Tích Tình Trạng Frontend (Gap Analysis) — CAPSTONE SP26

Đối soát trực tiếp giữa **`WORKER_API_SPEC.md` (03/04/2026)** và **source code FE** (`src/services`, `src/constants/api.ts`, `src/types`, `src/screens`).

> **Cập nhật lần cuối:** 2026-04-03 16:45

---

## 1. Tổng quan nhanh

| Nhóm | Tổng | ✅ Đúng | ⚠️ Thiếu / Sai | 🔴 Bug |
|---|---|---|---|---|
| Endpoint constants (`api.ts`) | 32 | 32 | 0 | 0 |
| Service layer | 7 service | 7 | 0 | 0 |
| TypeScript interfaces | 14 DTO | 12 | 2 | 1 |
| Screens & Navigation | 22 screen | 21 | 1 | 0 |
| **Tổng** | | **~94%** | | |

---

## 2. Chi tiết rà soát từng nhóm

---

### 2.1 Endpoints (`src/constants/api.ts`)

#### ✅ Đã đúng & đầy đủ
| Nhóm | Endpoint | Trạng thái |
|---|---|---|
| **Auth** | `/login`, `/register`, `/verify-email`, `/resend-verification`, `/forget`, `/reset`, `/google-login`, `/logout` | ✅ Khớp hoàn toàn |
| **Worker Profile** | `/worker`, `/worker/upload-avatar` | ✅ Khớp |
| **Jobs** | `/job/category`, `/job/post/{id}`, `/job/post/nearby`, `/job/post/search`, `/job/post/filter`, `/job/post/by-date`, `/job/post/by-skill`, `/job/post/by-wage`, `/job/post/urgent` | ✅ Khớp |
| **Application** | `/job/application` (POST), `/job/application/worker` (GET), `/job/application/{id}`, `/job/application/cancel/{id}` | ✅ Khớp |
| **JobDetail** | `/JobDetail/report-daily`, `/JobDetail/{id}`, `/JobDetail/worker/{workerProfileId}` | ✅ Khớp (PascalCase đúng) |
| **Dispute** | `/disputes`, `/disputes/mine`, `/disputes/{id}` | ✅ Khớp |
| **Wallet** | `/wallet/me`, `/wallet-transaction/wallet/{walletId}`, `/withdraw`, `/withdraw/account-balance` | ✅ Khớp |
| **Notification** | `/notification`, `/notification/unread`, `/notification/register-token` | ✅ Khớp |
| **Weather** | `/weather/coordinates`, `/weather/me` | ✅ Khớp |

#### ⚠️ Lưu ý phối hợp BE
> [!NOTE]
> `job/application/worker` — Đã được chuẩn hóa trong FE dùng `/job/application/worker` để lấy đơn của riêng worker. BE cần đảm bảo endpoint này hoạt động đúng thay vì dùng chung route POST search.

---

### 2.2 Service Layer (`src/services/`)

#### ✅ Services đã đầy đủ
| Service | Coverage |
|---|---|
| `auth.service.ts` | Login, Register, Logout, VerifyEmail, ResendVerification, ForgotPassword, ResetPassword |
| `worker-profile.service.ts` | GetProfile, UpdateProfile, UploadAvatar |
| `job.service.ts` | GetCategories, GetJobPosts, GetNearby, Search, Filter, GetDetail, Apply, GetApplications, CancelApplication |
| `daily_report.service.ts` | Submit, GetById, GetWorkerReports |
| `dispute.service.ts` | Create, GetMine |
| `wallet.service.ts` | GetWallet, GetTransactions, CreateWithdrawal, GetAccountBalance |
| `notification.service.ts` | GetAll, GetUnread, MarkAsRead, MarkAllAsRead, Delete, RegisterToken, UnregisterToken |

#### 🔴 Bug trong service
*Hiện tại không phát hiện bug nghiêm trọng trong service layer sau khi đã chuẩn hóa route `/worker` cho đơn ứng tuyển.*

---

### 2.3 TypeScript Interfaces (`src/types/define_worker_interfaces.ts`)

#### ✅ Đã khớp với spec
| Interface | Trạng thái |
|---|---|
| `WorkerProfileDTO` | ✅ Khớp (có `date_of_birth` snake_case đúng, `genderId`, `skills`) |
| `UpdateWorkerProfileRequest` | ✅ Khớp (có `genderId`, `skillIds`) |
| `JobPostDTO` | ✅ Khớp |
| `JobDiscoveryDTO extends JobPostDTO` | ✅ Khớp, có đầy đủ các trường bổ sung |
| `JobApplicationDTO` | ✅ Khớp (có `jobPost?: Partial<JobPostDTO>`, `workDates`, `locationName`) |
| `CreateJobApplicationRequest` | ✅ Khớp (có `workDates`) |
| `JobSearchFilterRequest` | ✅ Đầy đủ |
| `PaginatedJobDiscoveryResponse` | ✅ Khớp |
| `DisputeReportDTO` | ⚠️ Thiếu `reporter/accusedUserId`, `penaltyTargetId` (có trong BE DTO nhưng FE chưa khai báo) |
| `CreateDisputeReportRequest` | ⚠️ Thiếu `farmerId`, `workerId` optional fields |
| `NotificationDTO` | ✅ Đủ dùng |
| `WalletDTO`, `WalletTransactionDTO` | ✅ Đủ dùng |

#### 🔴 Bug trong interface (PENDING BE)
| Interface | Vấn đề |
|---|---|
| `JobDetailDTO` | Có `evidenceUrl?` và `jobPost?: Partial<JobPostDTO>` — **đúng về intent** nhưng BE chưa trả về 2 trường này. Hiện tại luôn là `undefined` khi nhận từ API thực. |
| `CreateDailyReportRequest` | Có `evidenceUrl?` — **đúng về intent** nhưng BE bỏ qua trường này. |

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
| `ChatScreen` | Chat | ✅ (UI có, BE chưa rõ) |
| `ReviewScreen` | Đánh giá | ✅ (UI có) |

#### ⚠️ Chức năng còn thiếu trong Screen
| Vấn đề | Screen | Mô tả |
|---|---|---|
| Dispute chỉ dùng Alert cứng | `ReportDetailScreen` (L.81) | `reason` bị hardcode: *"Chủ vườn đánh giá không công bằng..."*. Chưa có form cho Worker tự nhập. |

---

## 3. Tổng hợp: Những gì CẦN LÀM

### 🔴 P0 — Bug nghiêm trọng (BE phải fix trước)
| # | Vấn đề | Người làm |
|---|---|---|
| 1 | `evidenceUrl` bị comment out trong `CreateDailyReportRequest.cs` → ảnh minh chứng không lưu | **BE Team** |
| 2 | `JobDetailResponseDTO` không có `evidenceUrl`, không có `jobPost` nested → UI fallback | **BE Team** |

### 🟡 P1 — Cần fix (FE có thể tự làm)
| # | Vấn đề | Người làm |
|---|---|---|
| 3 | Dispute form dùng Alert + reason hardcode — cần Modal cho Worker tự nhập `reason`, `description`, `disputeTypeId` | **FE Team** |
| 4 | `DisputeReportDTO` thiếu `reporterUserId`, `accusedUserId`, `penaltyTargetId` trong TypeScript interface | **FE Team** |

### 🔵 P2 — Nice to have
| # | Vấn đề | Người làm |
|---|---|---|
| 5 | `CreateDisputeReportRequest` interface thiếu `farmerId?`, `workerId?` optional fields | **FE Team** |
| 6 | Cần rà soát Safe Area định kỳ trên các thiết bị màn hình gập hoặc tỷ lệ dị | **FE Team** |

---

## 4. Lịch sử cập nhật

| Ngày | Thay đổi |
|---|---|
| 02/04/2026 | Tạo báo cáo lần đầu |
| 03/04/2026 (lần 1) | Đánh dấu hoàn thành 5/7 gap; phát hiện 2 bug mới (evidenceUrl, jobPost) |
| 03/04/2026 (lần 2) | Rà soát toàn bộ FE theo WORKER_API_SPEC.md mới — chuẩn hóa toàn bộ |
| 03/04/2026 (lần 3) | Hoàn thành tích hợp Specialized Filters, fix bug `getApplications`, Safe Area, Debounced Search |
