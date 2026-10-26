# Ứng Dụng Quản Lý Sinh Viên - React Native (Thực Hành 2)

Ứng dụng di động quản lý học tập dành cho sinh viên được xây dựng bằng **React Native**, kết nối với **Mock API (json-server)**, hỗ trợ kiến trúc **Offline-First**, tự động đồng bộ và giải quyết xung đột dữ liệu.

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### 1. Chuẩn bị Server Mock API (json-server)
Ứng dụng sử dụng server giả lập `json-server` phiên bản 0.17.4 với độ trễ 800 ms và tệp dữ liệu `db.json`:

```bash
# Cài đặt json-server (nếu chưa cài)
npm install -g json-server@0.17.4

# Chạy server với delay 800ms trên cổng 3000
npm run server
# hoặc:
json-server --watch db.json --host 0.0.0.0 --port 3000 --delay 800
```

> **Lưu ý cấu hình IP kết nối:**  
> Trong file [src/config.ts](file:///d:/workspace/app/react_native_th_2/src/config.ts):
> - Máy ảo Android Emulator: `http://10.0.2.2:3000`
> - Thiết bị thật hoặc máy ảo khác: Thay bằng địa chỉ IP LAN của máy tính (ví dụ `http://192.168.1.x:3000`).

### 2. Khởi chạy Ứng dụng React Native
```bash
# Cài đặt thư viện dependencies
npm install

# Khởi động Metro Bundler
npm start

# Mở terminal mới và chạy trên Android
npm run android
```

---

## 📱 Cấu Trúc 5 Tab & Điều Hướng

Ứng dụng gồm 5 tab Native Stack riêng biệt theo đúng quy ước:
1. **Tổng quan (`HomeScreen`)**: Hiển thị họ tên, mã sinh viên; môn đang học; bài tập đến hạn trong 7 ngày tới; số lượng thay đổi chưa đồng bộ.
2. **Môn học (`CourseListScreen`, `CourseDetailScreen`)**: Danh sách môn học kèm tìm kiếm theo tên và lọc theo học kỳ. Kể cả khi offline, tìm kiếm và lọc vẫn hoạt động bình thường trên cache.
3. **Thời khóa biểu (`ScheduleScreen`, `SessionDetailScreen`)**: Xem lịch học theo thứ trong tuần với component chọn ngày `DaySelector`.
4. **Bài tập (`AssignmentListScreen`, `AssignmentDetailScreen`, `AssignmentFormScreen`)**: Danh sách bài tập, bộ lọc trạng thái (Tất cả / Chưa xong / Đã xong / Quá hạn), nút thêm mới, đổi trạng thái bài tập, badge số bài chưa hoàn thành trên tab bar.
5. **Cá nhân (`ProfileScreen`, `EditProfileScreen`, `GradeListScreen`, `GradeDetailScreen`)**: Mã sinh viên, họ tên, lớp, chuyên ngành, email, số điện thoại, tóm tắt GPA và bảng điểm chi tiết.

### Quy tắc điều hướng:
- Mọi tên route khai báo duy nhất tại [src/navigation/routes.ts](file:///d:/workspace/app/react_native_th_2/src/navigation/routes.ts).
- Các màn hình chi tiết chỉ nhận `{ id }` qua `route.params`.
- Tiêu đề header của màn hình chi tiết được gán động bằng `navigation.setOptions({ title: ... })`.
- Mọi màn hình chi tiết đều có nút quay lại; sau khi lưu form thành công thì tự quay về màn hình trước.

---

## 🛠️ Chi Tiết Các Tính Năng Đã Thực Hiện

### Phần A. Xử lý Trạng thái & Thao tác Dữ liệu
- **A3 & A4. Xử lý đủ 4 trạng thái & Kéo để làm mới**: Mọi màn hình danh sách xử lý đầy đủ 4 trạng thái:
  1. *Đang tải*: ActivityIndicator / Skeleton.
  2. *Có dữ liệu*: FlatList danh sách trực quan.
  3. *Danh sách rỗng*: Component `EmptyState` (`ListEmptyComponent`).
  4. *Lỗi*: Thông báo lỗi thân thiện kèm nút "Thử lại".
  - Hỗ trợ kéo để làm mới (`refreshing` và `onRefresh`).
- **A5. Thêm bài tập mới (`AssignmentFormScreen`)**:
  - Gửi dữ liệu bằng phương thức `POST` tới endpoint `/assignments`.
  - **Kiểm tra dữ liệu đầu vào (Validation)**:
    - Tiêu đề bài tập không được để trống hoặc chỉ có khoảng trắng.
    - Hạn nộp phải là ngày hợp lệ và **không được ở trong quá khứ** (`dueDate >= 00:00:00 hôm nay`).
  - Hỗ trợ các mốc chọn nhanh hạn nộp (+1 ngày, +3 ngày, +7 ngày, +14 ngày).
  - Sau khi lưu thành công, tự động quay về màn hình trước.
- **A6. Cập nhật lạc quan (Optimistic Update)**:
  - Khi người dùng bấm vào checkbox/nút đổi trạng thái bài tập: Giao diện chuyển đổi trạng thái `todo` ⟷ `done` ngay lập tức mà không phải chờ API phản hồi.
  - Sau đó gọi API `PATCH /assignments/:id`.
  - **Cơ chế Hoàn tác (Rollback)**: Nếu API gặp lỗi (máy chủ lỗi 500, timeout...), ứng dụng tự động hoàn tác giao diện về trạng thái ban đầu và hiển thị thông báo lỗi: *"Không thể cập nhật trạng thái bài tập lên máy chủ. Giao diện đã được hoàn tác."*

---

### Phần B. Chế Độ Offline & Đồng Bộ Ngoại Tuyến (4 Điểm)

#### B1. Theo dõi trạng thái mạng
- Sử dụng thư viện `@react-native-community/netinfo`.
- Xây dựng custom hook [useNetworkStatus()](file:///d:/workspace/app/react_native_th_2/src/hooks/useNetworkStatus.ts).
- Khi mất mạng: Banner **“Bạn đang offline”** xuất hiện ở **mọi màn hình** (thông qua `OfflineBanner` đặt tại `AppNavigator`), kèm cảnh báo dữ liệu đang đọc từ bộ nhớ đệm.

#### B2. Bộ nhớ đệm "Cache trước, mạng sau"
- Mỗi lần gọi `GET` thành công, lưu kết quả vào `AsyncStorage` kèm thời điểm lưu theo định dạng: `{ data, savedAt }`.
  - Ví dụ: Khóa `cache:courses` lưu `{ data: Course[], savedAt: string }`.
- **Chiến lược:** Khi mở bất kỳ màn hình nào, ứng dụng lập tức nạp và hiển thị dữ liệu từ cache cục bộ (tránh màn hình chờ), sau đó gọi API nền để lấy dữ liệu mới nhất nếu có mạng.
- **Khi offline:** Hiển thị dòng thông báo định dạng chuẩn: **“Cập nhật lần cuối: 14:32, 26/10/2026”** (qua component `LastUpdatedText`).

#### B3. Hàng đợi thao tác ngoại tuyến (Outbox Queue)
- Khi mất mạng, 3 thao tác quan trọng không bao giờ bị chặn:
  1. Đổi trạng thái bài tập (`updateAssignmentStatus`).
  2. Thêm bài tập mới (`createAssignment`).
  3. Chỉnh sửa thông tin cá nhân sinh viên (`updateStudent`).
- Các thao tác này được tuần tự lưu vào hàng đợi `AsyncStorage` (`outbox:queue`) theo đúng cấu trúc:
  ```typescript
  interface OutboxItem {
    id: string;
    method: 'POST' | 'PATCH' | 'PUT' | 'DELETE';
    url: string;
    body?: any;
    createdAt: string; // ISO 8601
  }
  ```
- **Nhãn "Chưa đồng bộ":** Các mục đang nằm trong hàng đợi hoặc tạo ngoại tuyến được hiển thị huy hiệu (badge) **“Chưa đồng bộ”** trên thẻ bài tập và thông tin cá nhân.

#### B4. Tự động đồng bộ (Auto Sync)
- Khi thiết bị có kết nối mạng trở lại (được hook `useNetworkStatus` phát hiện):
  - Ứng dụng tự động kích hoạt tiến trình gửi lần lượt các thao tác trong hàng đợi theo đúng thứ tự **FIFO (First In First Out)**.
  - Thao tác thành công được xóa khỏi hàng đợi (`outbox.remove(id)`).
  - Thao tác bị lỗi mạng/server được giữ lại trong hàng đợi để tiếp tục thử lại sau.
  - Sau khi hoàn tất tiến trình đồng bộ, hiển thị thông báo: **“Đã đồng bộ X thay đổi lên máy chủ thành công.”**

---

### B5. Cơ Chế Xử Lý Xung Đột Dữ Liệu (Conflict Resolution)

#### Vấn đề:
Trong môi trường ngoại tuyến (Offline-First), người dùng có thể thực hiện sửa đổi dữ liệu trên máy điện thoại khi không có mạng (ví dụ sửa thông tin sinh viên hoặc trạng thái bài tập). Trong thời gian đó, trên server dữ liệu cũng có thể đã được người khác hoặc hệ thống cập nhật mới hơn thời điểm thao tác ngoại tuyến được tạo ra.

#### Cách xử lý của ứng dụng:
1. **Kiểm tra thời điểm chỉnh sửa (`updatedAt`) trước khi ghi đè:**
   - Trong quá trình đồng bộ tự động một mục `PATCH`/`PUT` từ hàng đợi Outbox, trước khi gửi yêu cầu cập nhật lên server, ứng dụng thực hiện gửi `GET` đến endpoint tương ứng để lấy thực thể hiện tại trên server (`serverEntity`).
2. **So sánh tem thời gian:**
   - So sánh thời điểm cập nhật trên server `serverEntity.updatedAt` với thời điểm tạo thao tác offline `item.createdAt`:
     ```typescript
     const serverTime = new Date(serverEntity.updatedAt).getTime();
     const offlineTime = new Date(item.createdAt).getTime();

     if (serverTime > offlineTime) {
       // XUNG ĐỘT PHÁT SINH
     }
     ```
3. **Quy tắc giải quyết: Ưu tiên dữ liệu Server:**
   - **Nếu `serverTime > offlineTime`**: Dữ liệu trên server mới hơn thao tác ngoại tuyến của thiết bị. Ứng dụng sẽ **ưu tiên giữ nguyên dữ liệu từ máy chủ**, không gửi thao tác ghi đè của offline lên server.
   - Thao tác offline này được loại bỏ khỏi hàng đợi Outbox (`outbox.remove(item.id)`).
   - Dữ liệu trong bộ nhớ đệm và giao diện ứng dụng được làm mới lại theo dữ liệu mới nhất từ server.
4. **Thông báo cho người dùng:**
   - Ứng dụng hiển thị thông báo hộp thoại trực quan cho người dùng:
     > *"Xung đột dữ liệu: Dữ liệu '[Tên mục]' trên máy chủ đã được cập nhật mới hơn thao tác offline của bạn. Ứng dụng đã ưu tiên giữ nguyên dữ liệu từ máy chủ."*
5. **Trường hợp không có xung đột (`serverTime <= offlineTime`):**
   - Ứng dụng thực hiện gửi `PATCH`/`PUT` cập nhật dữ liệu bình thường, cập nhật `updatedAt` mới và xóa mục khỏi hàng đợi Outbox.

---

## 📂 Cấu Trúc Thư Mục Dự Án

```
src/
├── api/                  # Tầng giao tiếp mạng (Mock API client & services)
│   ├── client.ts         # Axios/Fetch client bọc hàm request()
│   ├── studentService.ts # API thông tin sinh viên (/students)
│   ├── courseService.ts  # API danh sách môn học (/courses)
│   ├── sessionService.ts # API thời khóa biểu (/sessions)
│   ├── assignmentService.ts # API bài tập (/assignments)
│   ├── gradeService.ts   # API bảng điểm (/grades)
│   └── types.ts          # Định nghĩa TypeScript interface dữ liệu
├── components/           # Component giao diện tái sử dụng
│   ├── common/           # OfflineBanner, LastUpdatedText, FilterChips, FormInput...
│   ├── assignment/       # AssignmentItem, StatusToggle
│   ├── course/           # CourseCard
│   ├── schedule/         # DaySelector, SessionCard
│   ├── grade/            # GpaSummary, GradeRow
│   └── profile/          # InfoRow
├── hooks/                # Custom hooks (useNetworkStatus...)
├── navigation/           # Quản lý điều hướng React Navigation
│   ├── routes.ts         # Khai báo hằng số định danh Routes duy nhất
│   ├── AppNavigator.tsx  # Bottom Tab Navigator & Global Offline Banner
│   └── *Stack.tsx        # 5 Native Stack Navigators
├── screens/              # 5 module màn hình ứng dụng
│   ├── home/
│   ├── courses/
│   ├── schedule/
│   ├── assignments/
│   └── profile/
├── storage/              # Tầng lưu trữ bộ nhớ cục bộ
│   ├── keys.ts           # Khóa AsyncStorage: cache:* và outbox:queue
│   ├── cache.ts          # Quản lý Cache với { data, savedAt }
│   └── outbox.ts         # Quản lý hàng đợi ngoại tuyến Outbox
├── store/                # Zustand State Management (useAppStore)
├── theme/                # Màu sắc, khoảng cách, typography
└── utils/                # Date formatting, GPA calculation, Validators
```
