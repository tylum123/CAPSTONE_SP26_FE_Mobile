# Components Directory
- **Chức năng**: Chứa các UI Components có thể tái sử dụng trên nhiều màn hình (vd: Button, Input, Header, Card... hoặc các View phức tạp được tách nhỏ).
- **Luồng hoạt động**: Được gọi và render từ các màn hình trong `src/screens`. Components nên mang tính "Dumb/Presentational" (nhận props và trả về view) để đảm bảo tính tái sử dụng cao, hạn chế gọi trực tiếp API ở đây trừ khi là component mang tính local đặc biệt.
