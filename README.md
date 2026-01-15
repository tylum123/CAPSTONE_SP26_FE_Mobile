# CAPSTONE SP26 - Farm Worker Management Mobile App

Ứng dụng di động quản lý công việc nông nghiệp, kết nối nông dân (Farmer) và công nhân (Worker).

## 📱 Giới thiệu

Đây là phần Frontend Mobile của dự án CAPSTONE SP26, được xây dựng bằng React Native và Expo. Ứng dụng cung cấp nền tảng kết nối giữa:

- **Nông dân (Farmer)**: Đăng công việc, quản lý ứng viên, thanh toán
- **Công nhân (Worker)**: Tìm kiếm công việc, ứng tuyển, quản lý hồ sơ và ví tiền

## 🚀 Công nghệ sử dụng

- **React Native** 0.81.5
- **Expo** ~54.0.31
- **React Navigation** 7.x
- **TypeScript** 5.9.2
- **React** 19.1.0
- **Lucide React Native** (Icons)
- **React Native Reanimated** (Animations)

## 📦 Cài đặt

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

## 📂 Cấu trúc dự án

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

## 🎯 Tính năng chính

### Cho Nông dân (Farmer)

- ✅ Đăng công việc mới
- ✅ Quản lý danh sách công việc
- ✅ Xem và quản lý ứng viên
- ✅ Thanh toán công nhân
- ✅ Quản lý hồ sơ cá nhân

### Cho Công nhân (Worker)

- ✅ Tìm kiếm công việc
- ✅ Ứng tuyển công việc
- ✅ Quản lý công việc đã ứng tuyển
- ✅ Quản lý ví tiền
- ✅ Quản lý hồ sơ cá nhân

## 🔐 Authentication

Ứng dụng sử dụng AuthContext để quản lý authentication state và phân quyền người dùng (Farmer/Worker).

## 🎨 UI/UX

- Material Design principles
- Responsive layout
- Dark mode support (via theme)
- Smooth animations với React Native Reanimated
- Safe area handling cho iOS notch và Android navigation bar

## 📱 Platforms

- ✅ iOS
- ✅ Android
- ✅ Web (Expo Web)

## 🛠️ Development

```bash
# Start development server
npm start

# Clear cache và restart
npm start -- --clear

# Run tests (nếu có)
npm test
```

## 📝 Scripts

- `npm start` - Khởi động Expo development server
- `npm run android` - Chạy trên Android emulator/device
- `npm run ios` - Chạy trên iOS simulator/device
- `npm run web` - Chạy trên web browser

## 🤝 Contributing

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📄 License

This project is private.

## 👥 Team

CAPSTONE SP26 - FPT University

## 📞 Contact

- Repository: [CAPSTONE_SP26_FE_Mobile](https://github.com/tylum123/CAPSTONE_SP26_FE_Mobile)

---

Made with ❤️ by CAPSTONE SP26 Team
