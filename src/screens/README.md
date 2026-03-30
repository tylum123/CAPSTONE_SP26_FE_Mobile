# Screens Directory
- **Chức năng**: Nơi chứa các màn hình chính. Mỗi thư mục hoặc file ở đây đại diện cho 1 trang trọn vẹn của ứng dụng (VD: WorkerHome, FarmerJobPost, LoginScreen, MapScreen).
- **Luồng hoạt động**: Đây là tầng Container - kết dính UI Components (`src/components`), giao tiếp với Backend (`src/services`), đọc Global State (`src/context`) để hiển thị thông tin lên giao diện. Các màn hình này sẽ được đăng ký định tuyến ở `src/navigation`.
