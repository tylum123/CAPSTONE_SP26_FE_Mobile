# Tóm tắt quá trình phát triển (CapStone SP26)

## 📱 1. Mobile Frontend (`CAPSTONE_SP26_FE_Mobile`)

### Quản lý Hồ sơ (Profile & Edit Profile)
- **Đồng bộ ngày sinh:** Khắc phục lỗi hiển thị và lưu trữ `dateOfBirth`, thay thế hoàn toàn ô nhập văn bản cũ bằng **Date Picker** chuyên dụng.
- **Quản lý Kỹ năng:** Triển khai tính năng chọn/cập nhật danh sách kỹ năng chuyên môn (`skillIds`) trực tiếp trong hồ sơ.
- **Tối ưu kiến trúc:** Tái cấu trúc màn hình `EditProfileScreen` thành các component nhỏ (`ExperienceSelector`, `DayPicker`, `SkillSelector`) để dễ bảo trì.
- **Sửa lỗi điều hướng:** Đảm bảo toàn bộ thông tin (bao gồm kỹ năng) được nạp đầy đủ khi vào màn hình Chỉnh sửa.

### Ví & Rút tiền (Wallet & Withdrawal) 
- **Tích hợp PayOS:** Triển khai luồng rút tiền qua API Payout của PayOS.
- **Tra cứu ngân hàng:** Thêm tính năng gợi ý tên ngân hàng và tự động kiểm tra tên chủ tài khoản qua VietQR.
- **Bảo mật:** Thêm biểu tượng "mắt" để ẩn/hiện số dư ví trên màn hình chính.

### Màn hình chính (Home Dashboard)
- **Thống kê:** Thiết kế lại bảng thống kê thu nhập và công việc theo dạng lưới hiện đại.
- **Tiện ích thời tiết:** Thay thế khu vực hiển thị số dư bằng Widget thời tiết (Weather API).

### Tìm kiếm & Lọc nâng cao (Advanced Search & Filter) [P1]
- **Logic tìm kiếm (02/04/2026):** Triển khai Custom Hook `useJobSearch` hỗ trợ tìm kiếm nâng cao, phân trang tự động và Infinite scrolling.
- **Giao diện Bộ lọc:** Xây dựng `JobFilterModal` hiện đại với Input thù lao, Chip chọn kỹ năng (multi-select) và Switch ưu tiên việc gấp.
- **Tối ưu kiến trúc:** Trích xuất `JobSearchCard.tsx` và refactor màn hình tìm kiếm, giảm **70% số dòng code** dư thừa (từ 444 xuống ~135 dòng).

### Khiếu nại & Hỗ trợ (Dispute System)
- **Danh sách khiếu nại:** Triển khai đầy đủ tính năng theo dõi lịch sử khiếu nại (`DisputeHistoryScreen`) với hệ thống Badge màu sắc theo trạng thái.
- **Logic fetching:** Xây dựng Custom Hook `useFetchMyDisputes` hỗ trợ Pull-to-refresh và xử lý lỗi chuyên nghiệp.

### Tối ưu hệ thống (Optimization & Audit)
- **Gap Analysis 100%:** Hoàn tất đối soát toàn bộ Network & UI layer với Backend API Spec (Cập nhật 02/04/2026).
- **Sửa lỗi định tuyến (P0):** Đồng bộ hóa Casing cho nhóm API `job/detail` (camelCase) để khắc phục lỗi 404 khi báo cáo công việc.
- **Refactor Trang Cá nhân:** Giảm **45% số dòng code** (từ 287 xuống 157 dòng) cho `WorkerProfileScreen`, cải thiện tốc độ nạp và tính dễ bảo trì.
- **Dọn dẹp mã nguồn (P3):** Loại bỏ hoàn toàn các hàm API dành cho Farmer trong ứng dụng Worker để tối ưu dung lượng.

---

## 📄 2. Tài liệu & Quy trình
- **Đồng bộ API Spec:** Toàn bộ hệ thống Frontend (Types, Services, UI) hiện đã khớp 100% với file `WORKER_API_SPEC.md`.
- **TypeScript Strict:** Khắc phục lỗi mismatch props cho các component dùng chung như `EmptyState`.

> [!NOTE]
> Các thay đổi này tập trung vào việc **xây dựng niềm tin cho Worker** thông qua hệ thống khiếu nại minh bạch và **tối ưu hóa hiệu năng** ứng dụng thông qua việc dọn dẹp các thành phần dư thừa.
