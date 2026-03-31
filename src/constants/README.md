# Constants Directory
- **Chức năng**: Lưu trữ các hằng số không thay đổi để tránh tình trạng "magic numbers/strings" hay hardcode (vd: màu sắc, typography constants, list API endpoints, enum giá trị quy đổi...).
- **Luồng hoạt động**: File này không chứa logic, chỉ export các object/biến hằng số. Được import vào các services, screens, components để dùng chung giá trị định sẵn.
