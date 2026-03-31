# Utils Directory
- **Chức năng**: Các helper function xử lý dữ liệu chung gọn nhẹ, tiện ích mở rộng linh tinh (ví dụ: hàm format Date, format tiền tệ VNĐ, validate email...).
- **Luồng hoạt động**: Đây là các hàm độc lập, thuần tiện ích (pure functions - thường không dính logic state hay components), tái sử dụng cao. Import khi cần vào `src/screens` hay `src/components` để format thông tin.
