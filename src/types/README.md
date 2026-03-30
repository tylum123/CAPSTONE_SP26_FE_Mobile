# Types Directory
- **Chức năng**: Chứa định nghĩa các Type, Interface của TypeScript (VD: User interface, API Response DTOs, Error Types) dùng trên toàn app, để giảm thiểu việc phải code `any`.
- **Luồng hoạt động**: Đây là file cung cấp schema thuần túy. Được import vào mọi nơi đặc biệt là `src/services` (lọc response), `src/context`, và props của `src/components`.
