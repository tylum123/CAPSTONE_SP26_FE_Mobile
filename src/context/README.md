# Context Directory
- **Chức năng**: Chứa các Global State Management của ứng dụng dùng React Context API (vd: Global Auth - quản lý trạng thái login, User Context, Theme Context).
- **Luồng hoạt động**: Khai báo Provider (`<AuthProvider>`) bao lấy Root App, sau đó các màn hình (`src/screens`) hoặc Components có thể dùng custom hook (vd: `useAuth()`) để chia sẻ trạng thái mà không cần truyền props xuống nhiều lớp.
