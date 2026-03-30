# AI Agent Guideline: Sổ tay nhập môn

## Công nghệ chính
- **Framework**: React Native + Expo (TypeScript)
- **Styling**: NativeWind + TailwindCSS (Bắt buộc sử dụng `className`, KHÔNG dùng `StyleSheet` trừ khi thật sự cần thiết)
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **State Management**: React Context API
- **Networking**: Axios (Tất cả các API calls nằm trong `src/services`)
- **Map / Location**: MapLibre React Native (`@maplibre/maplibre-react-native`) + Expo Location cho hiệu năng cao
- **Khác**: Async Storage (lưu session, token), Lucide React Native (Icons), lottie-react-native (Animations).

## Luồng dữ liệu chính (Data Flow)
1. **API -> Service**: Dữ liệu gọi từ backend thông qua thư mục `src/services` (vd: `api.ts`, `auth.ts`, `worker.ts`). Các module này trả về dữ liệu thuần hoặc ném lỗi.
2. **Service -> Context / Screen State**: Dữ liệu được fetch về sẽ lưu trữ tạm thời tại local state của Screen (dùng `useState`, `useEffect`) hoặc truyền lên Global Context (`src/context/`) nếu là trạng thái toàn cục dùng chung (vd: dữ liệu người dùng, token đăng nhập).
3. **State -> UI (Components / Screens)**: Phản ứng (React) render UI từ State. Layout được chia thành các màn hình độc lập (`src/screens`) tái sử dụng các UI components nhỏ/dùng chung (`src/components`).

## Quy ước bắt buộc (Coding Conventions)
- **UI & Styling**: BẮT BUỘC dùng NativeWind (`className`) cho UI. Tuân thủ bảng màu chính của app đã định nghĩa trong `tailwind.config.js`. Không dùng mã màu trực tiếp (hex/rgb) trong component nếu đã có trong cấu hình.
- **Cấu trúc file**: Mỗi tính năng mới phải đặt chuẩn thư mục (VD: màn hình vào `screens/`, logic gọi API vào `services/`, interface TypeScript vào `types/`, helper functions vào `utils/`).
- **Data Binding & N+1 Queries**: Khi gọi API lấy danh sách, đảm bảo dùng đúng API DTO chuẩn trên backend, nếu thấy thiếu thuộc tính thì yêu cầu backend cập nhật thay vì gọi thêm API rời rạc trên Frontend.
- **UX**: Đảm bảo padding, margin chuẩn xác, chú ý viền màn hình (Safe Area) trên thiết bị di động. Xử lý loading và error state cẩn thận.
- **Typescript**: Hạn chế tối đa dùng `any`. Viết interface cụ thể trong `src/types`.
