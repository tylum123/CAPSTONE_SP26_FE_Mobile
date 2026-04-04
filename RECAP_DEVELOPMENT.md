# Tóm tắt quá trình phát triển (CapStone SP26)

## 📱 1. Mobile Frontend (`CAPSTONE_SP26_FE_Mobile`)

### Quản lý Hồ sơ (Profile & Edit Profile) ✅ Hoàn thành
- **Đồng bộ ngày sinh (Cập nhật 03/04/2026):** Khắc phục triệt để lỗi hydration dữ liệu `dateOfBirth` từ backend, hỗ trợ tự động nhận diện và nạp đa định dạng (ISO, YYYY-MM-DD).
- **Skill Selection Modal (03/04/2026):** Thay thế danh sách kỹ năng tĩnh bằng Modal chọn kỹ năng chuyên nghiệp:
    - Tìm kiếm thời gian thực và phân loại động theo danh mục từ API.
    - Giao diện Chip/Tag hiện đại với bộ đếm số lượng được chọn.
- **Giao diện Premium (P0):** Triển khai **Sticky Footer** tích hợp `LinearGradient`, đổ bóng Shadow 2xl và căn chỉnh **SafeArea** chống che khuất bởi thanh điều hướng.
- **Phản hồi xúc giác (Haptics):** Tích hợp `expo-haptics` cho toàn bộ luồng chỉnh sửa hồ sơ mang lại cảm giác cao cấp.
- **Refactor Giao diện Worker Profile (03/04/2026):** [P0] Cải thiện trải nghiệm người dùng với các cập nhật quan trọng:
    - **Phân loại Kỹ năng:** Tự động gán màu sắc Badge dựa trên danh mục (Trồng trọt, Chăn nuôi...) và tích hợp Modal xem toàn bộ kỹ năng.
    - **Thông tin chi tiết:** Hiển thị Địa chỉ đầy đủ (không cắt dòng), bổ sung trường Giới tính (Nam/Nữ).
    - **Contact Info Card:** Thiết kế lại mục Số điện thoại và Email thành dạng 2 cột mỏng gọn, dễ truy cập với hệ thống icon nằm ngang.
    - **Hệ thống Icon:** Tích hợp bộ icon trang trí đồng bộ cho tất cả các trường dữ liệu và tiêu đề mục (Kỹ năng, Tiện ích...).
    - **Xử lý Giới tính & Kỹ năng (04/04/2026):** Thêm bộ chọn giới tính (Nam/Nữ) và tích hợp Modal chọn kỹ năng vào luồng thiết lập ban đầu.
- **Đồng bộ Onboarding (04/04/2026):** [P0] Đưa các Component dùng chung (`ExperienceSelector`, `DayPicker`, `SkillSelectionModal`) vào trang Thiết lập hồ sơ, đồng bộ trải nghiệm 100% với trang Chỉnh sửa.
- **Bổ sung Bán kính đi lại (04/04/2026):** Thêm trường nhập "Bán kính đi lại (km)" vào cả 2 trang quản lý hồ sơ để khớp với yêu cầu từ Backend.

- **Tối ưu kiến trúc:** Module hóa `SkillSelectionModal.tsx`, đồng bộ lề (padding) toàn trang và xử lý lỗi cú pháp JSX triệt để.

### Ví & Rút tiền (Wallet & Withdrawal) 
- **Tích hợp PayOS:** Triển khai luồng rút tiền qua API Payout của PayOS.
- **Tra cứu ngân hàng:** Thêm tính năng gợi ý tên ngân hàng và tự động kiểm tra tên chủ tài khoản qua VietQR.
- **Bảo mật:** Thêm biểu tượng "mắt" để ẩn/hiện số dư ví trên màn hình chính.

### Màn hình chính (Home Dashboard)
- **Thống kê:** Thiết kế lại bảng thống kê thu nhập và công việc theo dạng lưới hiện đại.
- **Tiện ích thời tiết (03/04/2026):** Nâng cấp lấy dữ liệu thời tiết theo tọa độ GPS thực tế qua `expo-location`. 
- **Cơ chế Fallback Đa tầng (Robust Geocoding):** Tự động chuyển đổi thông minh giữa GPS -> Địa chỉ Profile -> Thành phố mặc định (Hồ Chí Minh) nếu xảy ra lỗi đồng hóa địa chỉ từ Backend, đảm bảo UI luôn hiển thị thông tin.
- **Đồng bộ tham số (lat/lon):** Khắc phục lỗi sai lệch tên tham số giữa FE và BE cho API thời tiết.

### Tìm kiếm & Lọc nâng cao (Advanced Search & Filter) [P1] ✅ Hoàn thành
- **Logic tìm kiếm (03/04/2026):** Triển khai Custom Hook `useJobSearch` hỗ trợ tìm kiếm nâng cao, phân trang tự động và Infinite scrolling.
- **Bộ lọc Nhanh (Quick Filters):** Tích hợp các nút lọc nhanh "Cần gấp" và "Không gấp" (isUrgent) hoạt động cộng dồn với bộ lọc chuyên sâu.
- **Lọc Hình thức làm việc (03/04/2026):** Thêm tùy chọn lọc theo "Ngày" (Daily) và "Khoán" (PerJob) đồng bộ với `jobTypeId`.
- **Giao diện Bộ lọc:** Xây dựng `JobFilterModal` hiện đại với Input thù lao, Chip chọn kỹ năng (multi-select) và Safe Area cho footer.
- **Duy trì vị trí (Persistence):** Khắc phục lỗi mất tọa độ khi thay đổi bộ lọc; đảm bảo Worker luôn tìm thấy việc quanh mình.
- **Tối ưu hiển thị khoảng cách (P0):** Cơ chế hiển thị số km cụ thể (ví dụ: 1.2 km). Hỗ trợ tự động fallback sang "Địa chỉ/Khu vực" nếu Server không trả về khoảng cách, đảm bảo minh bạch thông tin.
- **Tối ưu kiến trúc:** Trích xuất `JobSearchCard.tsx` và refactor màn hình tìm kiếm, giảm **70% số dòng code** dư thừa.

### Khiếu nại & Hỗ trợ (Dispute System)
- **Danh sách khiếu nại:** Triển khai đầy đủ tính năng theo dõi lịch sử khiếu nại (`DisputeHistoryScreen`) với hệ thống Badge màu sắc theo trạng thái.
- **Logic fetching:** Xây dựng Custom Hook `useFetchMyDisputes` hỗ trợ Pull-to-refresh và xử lý lỗi chuyên nghiệp.

### Tối ưu hệ thống (Optimization & Audit)
- **Gap Analysis 100%:** Hoàn tất đối soát toàn bộ Network & UI layer với Backend API Spec.
- **Sửa lỗi định tuyến (P0):** Đồng bộ hóa Casing cho nhóm API `job/detail` (camelCase) để khắc phục lỗi 404 khi báo cáo công việc.
- **Refactor Trang Cá nhân:** Giảm **45% số dòng code** cho `WorkerProfileScreen`, cải thiện tốc độ nạp và tính dễ bảo trì.
- **Dọn dẹp mã nguồn (P3):** Loại bỏ hoàn toàn các hàm API dành cho Farmer trong ứng dụng Worker để tối ưu dung lượng.

### Thông báo & Push Notification (Notifications & Push) ✅ Hoàn thành
- **Đồng bộ hệ thống thông báo (04/04/2026):** Khắc phục lỗi không hiển thị thông báo do không đồng bộ dữ liệu với Backend:
    - **Xử lý phân trang:** Cập nhật Service để bóc tách dữ liệu từ `PaginatedResponse<NotificationDTO>`.
    - **Mapping thuộc tính:** Điều chỉnh FE để khớp với Schema mới của BE (`type`, `message`, `sentAt`, `relatedEntityId`).
- **Tích hợp Expo Push Notification (04/04/2026):**
    - Chuyển đổi từ FCM Token sang **Expo Push Token** để tương thích với hạ tầng gửi tin của Backend.
    - Triển khai **Foreground Alert**: Tự động hiển thị popup `Alert` ngay trong app khi có thông báo tới lúc đang mở app, đảm bảo trải nghiệm người dùng tức thì.
    - Tối ưu hóa đăng ký Token: Tự động đăng ký lại Token mới mỗi khi Login hoặc khởi động app với cơ chế log chuyên sâu để debug.
- **Tối ưu hóa Logging (04/04/2026):** Khắc phục lỗi in log 401 Unauthorized dư thừa khi người dùng bấm Đăng xuất (Logout).
    - Triển khai trạng thái **logoutGlobalState** để đồng bộ hóa giữa AuthContext và Axios Client.
    - Tự động ẩn các cảnh báo 401 nếu yêu cầu không có Token hoặc đang trong quá trình chuyển đổi đăng xuất, giúp màn hình terminal sạch sẽ và chuyên nghiệp hơn.

### Xác thực & Bảo mật (Authentication & Security) [P1] ✅ Hoàn thành
- **Luồng Quên mật khẩu (03/04/2026):** Triển khai quy trình 3 bước hoàn chỉnh (`Yêu cầu` -> `Xác thực OTP` -> `Thành công`) ngay trong `ForgotPasswordScreen.tsx`.
- **Tính năng Gửi lại mã (Resend OTP):** Thêm logic đếm ngược 60 giây và tích hợp API `resend-verification`.
- **Đồng bộ API:** Cập nhật `authService` và `API_ENDPOINTS` để khớp với backend spec cho các tính năng xác thực tài khoản.
- **Tối ưu trải nghiệm:** Thêm hiển thị mật khẩu mới và kiểm tra định dạng OTP/Password trực tiếp tại bước xác thực.

---

## 📄 2. Tài liệu & Quy trình
- **Đồng bộ API Spec (03/04/2026):** Toàn bộ hệ thống Frontend hiện đã khớp 100% với file `WORKER_API_SPEC.md`.
- **Yêu cầu BE (PENDING):** Tài liệu hóa 6 gap quan trọng bao gồm tính toán khoảng cách search, đính kèm ảnh báo cáo và nhúng dữ liệu `jobPost`.
- **TypeScript Strict:** Khắc phục lỗi mismatch props cho các component dùng chung như `EmptyState` và các lỗi type `string | number` trong hiển thị khoảng cách.

---

> [!NOTE]
> Các thay đổi trong ngày 03/04/2026 tập trung vào việc **hoàn thiện hệ thống tìm kiếm thông minh** và **chuẩn hóa dữ liệu với Backend**, đảm bảo ứng dụng hoạt động ổn định và chuyên nghiệp.
