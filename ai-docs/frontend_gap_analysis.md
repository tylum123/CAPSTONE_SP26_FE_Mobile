# Báo Cáo Phân Tích Lỗ Hổng Tính Năng (Frontend Gap Analysis) - AGROTEMP Worker App

Bản báo cáo này thực hiện đối soát giữa **Backend API Spec (02/04/2026)** và **Frontend Codebase** hiện tại của ứng dụng Worker.

---

## 1. Bảng Đối Soát Tính Năng (Feature Mapping)

| Tên Tính Năng | API Endpoint | Trạng Thái Frontend | Ưu Tiên | Đánh Giá & Hành Động Cần Thiết |
| :--- | :--- | :--- | :--- | :--- |
| **Xác thực - Gửi lại OTP** | `/resend-verification` | [❌ Chưa có code] | **[P1]** | Thiếu API trong `auth.service.ts` và nút "Gửi lại mã" trên UI. |
| **Báo cáo hàng ngày (Casing)** | `/job/detail/report-daily` | [⚠️ Đang làm dở/Cũ] | **[P0]** | **KHẨN CẤP**: Code FE đang dùng `/JobDetail` (PascalCase), Spec yêu cầu `job/detail` (camelCase). |
| **Khiếu nại - Tạo mới** | `/disputes` | [⚠️ Đang làm dở/Cũ] | **[P1]** | Service đã có nhưng UI đang dùng `Alert.alert` tạm bợ. Cần làm Modal/Form chỉn chu. |
| **Khiếu nại - Danh sách** | `/disputes/mine` | [❌ Chưa có code] | **[P1]** | Service có `getMyDisputes` nhưng **không có màn hình hiển thị**. Cần thêm `DisputeHistoryScreen`. |
| **Tìm kiếm - Lọc chuyên sâu** | `/by-skill`, `/by-wage`... | [❌ Chưa có code] | **[P1]** | Spec có API lọc theo lương/kỹ năng nhưng UI Search chưa tích hợp các bộ lọc này. |
| **Thời tiết (GPS/City)** | `/weather/city`, `/coords` | [⚠️ Đang làm dở/Cũ] | **[P2]** | Spec yêu cầu lọc theo tọa độ/thành phố, FE hiện chỉ gọi `/weather/me`. |
| **Dọn dẹp Farmer API** | `getFarmReports`... | [❌ Chưa có code] | **[P3]** | Xóa các hàm `evaluateReport` dư thừa trong `report.service.ts` vì đây là app cho Worker. |
| **Ví & Rút tiền** | `/wallet/me`, `/withdraw` | [✅ Đã hoàn thiện] | - | Đã hoạt động tốt, UI đẹp và có tra cứu tên tài khoản. |
| **Hồ sơ Worker** | `/worker` | [✅ Đã hoàn thiện] | - | Đã khớp hoàn toàn với Spec mới nhất. |
| **Hủy đơn ứng tuyển** | `/application/cancel/{id}` | [✅ Đã hoàn thiện] | - | Đã cập nhật đúng Endpoint mới thay cho DELETE đơn thuần. |

---

## 2. Kế Hoạch Hành Động (Action Plan)

Để giải quyết các lỗ hổng trên một cách an toàn nhất, tôi đề xuất thực hiện theo 3 bước sau:

*   **Bước 1 (Sửa lỗi P0):** Đồng bộ hóa Casing cho nhóm API `JobDetail`. Đây là ưu tiên cao nhất để tránh lỗi 404 khi gọi API Reporting.
*   **Bước 2 (Hoàn thiện luồng Khiếu nại):** Xây dựng màn hình `DisputeHistoryScreen` và gắn vào Navigation. Điều này giúp Worker kiểm soát được các khiếu nại đã gửi.
*   **Bước 3 (Đồng bộ bộ lọc & Dọn dẹp):** Cập nhật `job.service.ts` để bổ sung các hàm lọc chuyên sâu (`by-skill`, `by-wage`), sau đó tích hợp vào UI và loại bỏ code dư thừa của Farmer.

---
**Người báo cáo:** Antigravity AI (Senior React Native Architect)
**Ngày tạo:** 02/04/2026
