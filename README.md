# HaniVoca - Ứng Dụng Học Từ Vựng Anh - Việt (iOS & macOS)

HaniVoca là ứng dụng học từ vựng tiếng Anh giao tiếp chuyên nghiệp chạy trên cả thiết bị iOS (iPhone/iPad) và máy Mac (macOS). Ứng dụng được viết hoàn toàn bằng **SwiftUI** và **Swift**, hỗ trợ học từ vựng theo cấu trúc logic, trực quan với giọng đọc chuẩn Mỹ (US Voice) và tích hợp các công cụ luyện tập tương tác.

---

## 🌟 Tính Năng Nổi Bật

1. **Phân loại bài học chuẩn quốc tế:**
   - Học theo thứ tự: **Chủ đề** (Gia đình, Ẩm thực, Du lịch, Công nghệ, Sức khỏe, Công việc) -> **Cấp bậc** từ cơ bản đến nâng cao (A1, A2, B1, B2, C1, C2).
2. **Kho từ vựng tích hợp sẵn và tùy chọn thêm mới:**
   - Đi kèm danh sách từ vựng thông dụng phong phú kèm phiên âm IPA, nghĩa tiếng Việt, câu ví dụ trực quan sinh động.
   - Cho phép tự thêm từ vựng mới của riêng bạn trực tiếp trên ứng dụng.
3. **Quản lý dữ liệu linh hoạt (Lưu File JSON):**
   - Tự động lưu trữ từ vựng cá nhân an toàn vào bộ nhớ máy.
   - Hỗ trợ **Xuất danh sách từ vựng** ra file JSON để làm sao lưu và **Nhập file JSON** để chia sẻ/phục hồi từ vựng một cách đơn giản.
4. **Phát âm chuẩn Mỹ (US Audio Pronunciation):**
   - Đọc phát âm từ vựng chính xác bằng giọng tiếng Anh-Mỹ thông qua bộ tổng hợp âm thanh native `AVSpeechSynthesizer`.
   - Có nút đọc cả câu ví dụ tiếng Anh để luyện nghe trôi chảy.
5. **Cụm từ giao tiếp thông dụng:**
   - Bộ sưu tập các mẫu câu/cụm từ giao tiếp nhiều trong cuộc sống hàng ngày (Chào hỏi, Mua sắm, Du lịch, Kết bạn).
6. **Luyện tập Flashcard thông minh (Game Swipe Card):**
   - Giao diện flashcard 3D lật thẻ mượt mà.
   - Vuốt sang **Phải** nếu đã nhớ từ (Đánh dấu Green "Nhớ").
   - Vuốt sang **Trái** nếu chưa nhớ từ (Đánh dấu Red "Quên").
7. **Biểu đồ theo dõi tiến độ (Swift Charts):**
   - Biểu đồ thống kê chi tiết phần trăm hoàn thành theo từng cấp bậc (A1-C2) và chủ đề.

---

## 📂 Cấu Trúc Thư Mục Trong Workspace

```
App HaniVoca/
├── README.md (Tài liệu hướng dẫn này)
├── scripts/
│   └── generate_dataset.py (File python sinh dữ liệu words.json và phrases.json)
└── HaniVoca/
    ├── HaniVocaApp.swift (Entry point của ứng dụng)
    ├── Models/
    │   ├── Word.swift (Model dữ liệu Từ vựng)
    │   ├── Phrase.swift (Model dữ liệu Cụm từ giao tiếp)
    │   └── VocabularyStore.swift (Quản lý trạng thái, lưu trữ, import/export)
    ├── Views/
    │   ├── ContentView.swift (Bộ điều hướng thích ứng theo thiết bị)
    │   ├── MainTabView.swift (Giao diện chính trên iPhone - Tabs)
    │   ├── SidebarView.swift (Giao diện chính trên macOS/iPadOS - Sidebar)
    │   ├── TopicListView.swift (Giao diện chọn chủ đề & cấp bậc)
    │   ├── LevelListView.swift (Giao diện chọn trình độ)
    │   ├── WordListView.swift (Giao diện danh sách từ vựng & tìm kiếm)
    │   ├── WordDetailView.swift (Thẻ chi tiết từ, tranh SF Symbol & đọc phát âm)
    │   ├── CustomWordsView.swift (Quản lý, thêm từ mới & Import/Export JSON)
    │   ├── PhrasesView.swift (Danh sách cụm từ giao tiếp kèm audio)
    │   ├── FlashcardView.swift (Luyện tập vuốt Flashcards 3D)
    │   └── StatisticsView.swift (Biểu đồ thống kê tiến trình học)
    ├── Utils/
    │   └── SpeechSynthesizer.swift (Công cụ phát âm chuẩn Mỹ)
    └── Resources/
        ├── words.json (Dữ liệu từ vựng gốc)
        └── phrases.json (Dữ liệu câu giao tiếp gốc)
```

---

## 🚀 Hướng Dẫn Tích Hợp Vào Xcode Để Chạy Ứng Dụng

Vì Xcode đã được tải và cài đặt thành công, bạn hãy thực hiện theo các bước cực kỳ đơn giản sau để biên dịch ứng dụng chạy trên iPhone Simulator hoặc máy Mac:

### Bước 1: Khởi tạo Project mới trong Xcode
1. Mở ứng dụng **Xcode** trên máy Mac của bạn.
2. Chọn **Create New Project...** (hoặc nhấn tổ hợp phím `Cmd + Shift + N`).
3. Chọn thẻ **Multiplatform** ở phía trên cùng, rồi chọn mẫu **App**, bấm **Next**.
4. Điền các thông tin của ứng dụng:
   - **Product Name**: `HaniVoca`
   - **Organization Identifier**: Ví dụ `com.hanivoca`
   - **Interface**: Chọn **SwiftUI**
   - **Language**: Chọn **Swift**
5. Nhấp **Next**, chọn thư mục lưu trữ Project (khuyên dùng lưu ở ngoài Desktop hoặc Document khác với thư mục mã nguồn này để tránh xung đột file).

### Bước 2: Nhập các file mã nguồn vào Xcode
1. Trong Xcode, ở cột bên trái (Project Navigator), bạn sẽ thấy thư mục con tên là `HaniVoca`. Nhấp chuột phải vào file `ContentView.swift` chọn **Delete** -> **Move to Trash**. Thực hiện tương tự với file `HaniVocaApp.swift` (vì chúng ta sẽ dùng file code tối ưu riêng đã tạo sẵn).
2. Mở trình duyệt file **Finder** trên máy Mac, truy cập vào thư mục mã nguồn: `/Users/voquy/Desktop/App HaniVoca/HaniVoca`.
3. Bôi đen và kéo thả (Drag and Drop) các thư mục và file sau từ Finder vào Xcode (thả trực tiếp vào bên dưới thư mục `HaniVoca` ở cột Project Navigator trái):
   - Thư mục `Models`
   - Thư mục `Views`
   - Thư mục `Utils`
   - Thư mục `Resources`
   - File `HaniVocaApp.swift`
   - File `ContentView.swift`
4. Khi thả vào, Xcode sẽ hiện một hộp thoại cài đặt. Hãy đảm bảo:
   - Tích chọn **Copy items if needed** (Sao chép các mục nếu cần).
   - Chọn **Create groups** (Tạo nhóm).
   - Trong phần **Add to targets**, hãy tích chọn vào ô **HaniVoca** (để các file này được đóng gói vào app).
   - Nhấn **Finish**.

### Bước 3: Đảm bảo các File JSON được đóng gói chính xác
1. Click vào tên Project ở dòng cao nhất cột bên trái (`HaniVoca`).
2. Chọn target `HaniVoca` ở cột chính giữa.
3. Chọn thẻ **Build Phases** ở phía trên cùng.
4. Tìm và mở mục **Copy Bundle Resources**.
5. Đảm bảo rằng file `words.json` và `phrases.json` đã có mặt trong danh sách này. Nếu chưa có, nhấp vào nút dấu **+** ở dưới cùng danh sách, chọn `words.json` và `phrases.json` từ thư mục Resources để add vào.

### Bước 4: Chạy thử ứng dụng (Build & Run)
1. Ở phía trên cùng của cửa sổ Xcode, chọn thiết bị giả lập chạy thử:
   - Chọn một máy ảo iPhone (ví dụ: `iPhone 16 Pro`) trong danh sách thiết bị.
   - Hoặc chọn **My Mac** để chạy trực tiếp ứng dụng trên máy Mac của bạn.
2. Nhấn nút hình tam giác **Play** (hoặc tổ hợp phím `Cmd + R`) để bắt đầu Build ứng dụng.
3. Chờ vài giây để Xcode biên dịch, ứng dụng sẽ tự động khởi chạy và bạn có thể bắt đầu trải nghiệm học từ vựng ngay lập tức!

---

## 🛠️ Hướng Dẫn Mở Rộng Kho Từ Vựng (Nếu muốn)

Nếu bạn muốn tạo thêm từ vựng mới để làm dữ liệu gốc của app, bạn có thể chỉnh sửa mã nguồn python:
1. Mở file [generate_dataset.py](file:///Users/voquy/Desktop/App%20HaniVoca/scripts/generate_dataset.py) và thêm các từ mới vào mảng `words` hoặc `extra_words`.
2. Mở Terminal lên, cd vào thư mục gốc của dự án và chạy lệnh sau để cập nhật lại dữ liệu file JSON:
   ```bash
   python3 scripts/generate_dataset.py
   ```
3. Xcode sẽ tự động nhận diện file JSON mới cập nhật và đồng bộ vào lượt build tiếp theo.

*Chúc bạn học tập từ vựng thật tốt với HaniVoca!*
