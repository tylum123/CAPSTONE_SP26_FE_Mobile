# Tóm tắt quá trình phát triển (CapStone SP26)

## 📱 1. Mobile Frontend (`CAPSTONE_SP26_FE_Mobile`)

### Quản lý Hồ sơ (Profile & Edit Profile)
- **Đồng bộ ngày sinh:** Khắc phục lỗi hiển thị và lưu trữ `dateOfBirth`, hỗ trợ nhiều định dạng ngày (ISO, YYYY-MM-DD).
- **Sửa lỗi điều hướng:** Đảm bảo thông tin cũ được nạp đầy đủ khi vào màn hình Chỉnh sửa hồ sơ.
- **Cải thiện UX:** Xử lý lỗi bàn phím che mất ô nhập địa chỉ và tối ưu hóa logic validation (tỉnh/huyện/xã).

### Ví & Rút tiền (Wallet & Withdrawal)
- **Tích hợp PayOS:** Triển khai luồng rút tiền qua API Payout của PayOS.
- **Tra cứu ngân hàng:** Thêm tính năng gợi ý tên ngân hàng và tự động kiểm tra tên chủ tài khoản qua VietQR.
- **Bảo mật:** Thêm biểu tượng "mắt" để ẩn/hiện số dư ví trên màn hình chính.

### Màn hình chính (Home Dashboard)
- **Thống kê:** Thiết kế lại bảng thống kê thu nhập và công việc theo dạng lưới hiện đại.
- **Tiện ích thời tiết:** Thay thế khu vực hiển thị số dư bằng Widget thời tiết (Weather API).

### Luồng công việc (Job Workflow)
- **Cập nhật thuật ngữ:** Chuyển toàn bộ "Lương" thành **"Thù lao"** trên toàn hệ thống.
- **Hủy ứng tuyển:** Triển khai tính năng cho phép Worker hủy các đơn ứng tuyển đang chờ.
- **Báo cáo hàng ngày:** Tích hợp bộ chọn ảnh (`expo-image-picker`) để tải ảnh báo cáo công việc.

---

## 📄 2. Tài liệu & Quy trình
- **Cập nhật API Spec:** Đồng bộ file `WORKER_API_SPEC.md` với code thực tế trong .NET, mô tả chi tiết các endpoint mới về Daily Report và Dispute.

> [!NOTE]
> Các thay đổi này tập trung vào việc **hoàn thiện UX cho Worker** và đảm bảo **luồng dòng tiền (thù lao)** hoạt động ổn định và chính xác.
