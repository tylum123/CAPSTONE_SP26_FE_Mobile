# Services Directory
- **Chức năng**: Lớp giao tiếp với thế giới bên ngoài, chịu trách nhiệm cho các lời gọi API tới Backend, SDK, hay services khác. Tất cả fetch/axios instances đều nằm tại đây.
- **Luồng hoạt động**: File giao diện (VD: `src/screens`) sẽ gọi module tương ứng ở đây (VD: `await workerService.getJobs()`). Tầng service nhận request, format headers, ném HTTP error hoặc trả về response DTOs sạch sẽ. NÊN parse data vào interface của `src/types`.
