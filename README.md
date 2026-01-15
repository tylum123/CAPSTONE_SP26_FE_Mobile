# CAPSTONE SP26 - Farm Worker Management Mobile App

Ứng dụng di động quản lý công việc nông nghiệp, kết nối nông dân (Farmer) và công nhân (Worker).

## Giới thiệu

Đây là phần Frontend Mobile của dự án CAPSTONE SP26, được xây dựng bằng React Native và Expo. Ứng dụng cung cấp nền tảng kết nối giữa:

- **Nông dân (Farmer)**: Đăng công việc, quản lý ứng viên, thanh toán
- **Công nhân (Worker)**: Tìm kiếm công việc, ứng tuyển, quản lý hồ sơ và ví tiền

## Công nghệ sử dụng

- **React Native** 0.81.5
- **Expo** ~54.0.31
- **React Navigation** 7.x
- **TypeScript** 5.9.2
- **React** 19.1.0
- **Lucide React Native** (Icons)
- **React Native Reanimated** (Animations)

## Cài đặt

### Yêu cầu hệ thống

- Node.js (version 16 trở lên)
- npm hoặc yarn
- Expo CLI
- iOS Simulator (cho macOS) hoặc Android Emulator

### Các bước cài đặt

1. Clone repository:

```bash
git clone https://github.com/tylum123/CAPSTONE_SP26_FE_Mobile.git
cd CAPSTONE_SP26_FE_Mobile
```

2. Cài đặt dependencies:

```bash
npm install
```

3. Chạy ứng dụng:

```bash
# Chạy trên Expo Go
npm start

# Chạy trên Android
npm run android

# Chạy trên iOS
npm run ios

# Chạy trên web
npm run web
```

## Cấu trúc dự án

```
CAPSTONE_SP26_FE_Mobile/
├── App.tsx                 # Entry point của ứng dụng
├── index.ts               # Root index
├── package.json           # Dependencies và scripts
├── tsconfig.json          # TypeScript configuration
├── src/
│   ├── components/        # Reusable components
│   │   └── ui/           # UI components
│   ├── constants/         # Constants và theme
│   │   └── theme.ts
│   ├── context/          # React Context
│   │   └── AuthContext.tsx
│   ├── navigation/       # Navigation setup
│   │   ├── RootNavigator.tsx
│   │   ├── FarmerTabNavigator.tsx
│   │   └── WorkerTabNavigator.tsx
│   ├── screens/          # App screens
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   ├── FarmerDashboardScreen.tsx
│   │   ├── FarmerProfileScreen.tsx
│   │   ├── WorkerHomeScreen.tsx
│   │   ├── WorkerJobsScreen.tsx
│   │   ├── WorkerProfileScreen.tsx
│   │   ├── WorkerSearchScreen.tsx
│   │   └── WorkerWalletScreen.tsx
│   ├── types/            # TypeScript types
│   │   └── index.ts
│   └── utils/            # Utility functions
│       └── helpers.ts
└── assets/               # Images, fonts, etc.
```

## Tính năng chính

### Cho Nông dân (Farmer)

- Đăng công việc mới
- Quản lý danh sách công việc
- Xem và quản lý ứng viên
- Thanh toán công nhân
- Quản lý hồ sơ cá nhân

### Cho Công nhân (Worker)

- Tìm kiếm công việc
- Ứng tuyển công việc
- Quản lý công việc đã ứng tuyển
- Quản lý ví tiền
- Quản lý hồ sơ cá nhân

## 🔐 Authentication

Ứng dụng sử dụng AuthContext để quản lý authentication state và phân quyền người dùng (Farmer/Worker).

## UI/UX

- Material Design principles
- Responsive layout
- Dark mode support (via theme)
- Smooth animations với React Native Reanimated
- Safe area handling cho iOS notch và Android navigation bar

## Platforms

- iOS
- Android
- Web (Expo Web)

## 🛠️ Development

```bash
# Start development server
npm start

# Clear cache và restart
npm start -- --clear

# Run tests (nếu có)
npm test
```

## Scripts

- `npm start` - Khởi động Expo development server
- `npm run android` - Chạy trên Android emulator/device
- `npm run ios` - Chạy trên iOS simulator/device
- `npm run web` - Chạy trên web browser

## Contributing

Chúng tôi hoan nghênh mọi đóng góp cho dự án! Để đóng góp, vui lòng làm theo các bước sau:

### Quy trình đóng góp

1. **Fork repository** - Tạo một bản sao của dự án về tài khoản GitHub của bạn

2. **Clone về máy local**
   ```bash
   git clone https://github.com/<your-username>/CAPSTONE_SP26_FE_Mobile.git
   cd CAPSTONE_SP26_FE_Mobile
   ```

3. **Tạo nhánh mới** cho tính năng hoặc bugfix của bạn
   ```bash
   git checkout -b feature/ten-tinh-nang
   # hoặc
   git checkout -b fix/ten-bug
   ```

4. **Thực hiện thay đổi** và commit code của bạn
   ```bash
   git add .
   git commit -m "feat: thêm tính năng xyz"
   # hoặc
   git commit -m "fix: sửa lỗi abc"
   ```

5. **Push lên nhánh của bạn**
   ```bash
   git push origin feature/ten-tinh-nang
   ```

6. **Tạo Pull Request** - Mở Pull Request từ nhánh của bạn về nhánh `develop` của repository gốc

### Quy tắc commit message

Vui lòng tuân theo conventional commits:

- `feat:` - Thêm tính năng mới
- `fix:` - Sửa lỗi
- `docs:` - Cập nhật documentation
- `style:` - Thay đổi code formatting, không ảnh hưởng logic
- `refactor:` - Refactor code
- `test:` - Thêm hoặc sửa tests
- `chore:` - Cập nhật build tasks, package manager configs, etc.

### Code style

- Sử dụng TypeScript cho tất cả code mới
- Tuân theo ESLint rules của dự án
- Đặt tên biến và hàm rõ ràng, có ý nghĩa
- Thêm comments cho các đoạn code phức tạp
- Đảm bảo code của bạn không có lỗi trước khi commit

### Testing

- Kiểm tra ứng dụng chạy được trên cả iOS và Android
- Test các tính năng mới kỹ lưỡng
- Đảm bảo không làm hỏng các tính năng hiện có

### Review process

Mọi Pull Request sẽ được review bởi maintainers. Vui lòng:
- Mô tả rõ ràng những thay đổi trong PR
- Liên kết đến issue liên quan (nếu có)
- Trả lời các comments và thực hiện thay đổi nếu được yêu cầu

## License

This project is private.

## Team

CAPSTONE SP26 - FPT University

## Contact

- Repository: [CAPSTONE_SP26_FE_Mobile](https://github.com/tylum123/CAPSTONE_SP26_FE_Mobile)

---

Made by CAPSTONE SP26 Team
