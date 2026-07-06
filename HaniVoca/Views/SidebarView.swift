import SwiftUI

struct SidebarView: View {
    @EnvironmentObject var store: VocabularyStore
    
    enum SidebarItem: Hashable {
        case topic(String) // topic name
        case phrases
        case reading
        case dictionary
        case customWords
        case statistics
    }
    
    @State private var selectedItem: SidebarItem? = nil
    @State private var selectedLessonIndex: Int? = 0
    
    // Dynamic unique topics list
    var topics: [String] {
        Array(Set(store.words.map { $0.topic })).sorted()
    }
    
    var body: some View {
        NavigationSplitView {
            VStack(alignment: .leading, spacing: 0) {
                // VocaHani Logo Header
                Image("logo")
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(height: 76)
                    .padding(.vertical, 14)
                    .padding(.horizontal, 16)
                    .frame(maxWidth: .infinity, alignment: .center)
                    .background(Color.appSecondarySystemGroupedBackground.opacity(0.3))
                
                Divider()
                
                List(selection: $selectedItem) {
                    Section(header: Text("CHỦ ĐỀ HỌC TẬP")) {
                        ForEach(topics, id: \.self) { topic in
                            NavigationLink(value: SidebarItem.topic(topic)) {
                                Label(topic, systemImage: resolveTopicIcon(for: topic))
                            }
                        }
                    }
                    
                    Section(header: Text("TIỆN ÍCH")) {
                        NavigationLink(value: SidebarItem.phrases) {
                            Label("Cụm từ", systemImage: "bubble.left.and.bubble.right.fill")
                        }
                        NavigationLink(value: SidebarItem.reading) {
                            Label("Luyện đọc", systemImage: "book.fill")
                        }
                        NavigationLink(value: SidebarItem.dictionary) {
                            Label("Từ điển", systemImage: "character.book.closed.fill")
                        }
                        NavigationLink(value: SidebarItem.customWords) {
                            Label("Từ của tôi", systemImage: "pencil.and.outline")
                        }
                        NavigationLink(value: SidebarItem.statistics) {
                            Label("Tiến trình", systemImage: "chart.bar.xaxis")
                        }
                    }
                }
                .listStyle(SidebarListStyle())
            }
            #if os(macOS)
            .navigationSplitViewColumnWidth(min: 220, ideal: 250, max: 320)
            #endif
        } content: {
            // Column 2: Content Column (Lessons inside the chosen Topic)
            switch selectedItem {
            case .topic(let topicName):
                let topicWords = store.words.filter { $0.topic == topicName }
                let totalLessons = Int(ceil(Double(topicWords.count) / 10.0))
                
                List(selection: $selectedLessonIndex) {
                    Section(header: Text("BÀI HỌC - \(topicName)")) {
                        if totalLessons == 0 {
                            Text("Không có từ vựng")
                                .foregroundColor(.secondary)
                        } else {
                            ForEach(0..<totalLessons, id: \.self) { index in
                                let isUnlocked = store.isLessonUnlocked(topic: topicName, index: index)
                                let isPassed = store.passedLessons.contains("\(topicName)_\(index)")
                                
                                NavigationLink(value: index) {
                                    HStack(spacing: 12) {
                                        // Status symbol
                                        Image(systemName: !isUnlocked ? "lock.fill" : (isPassed ? "checkmark.circle.fill" : "play.circle.fill"))
                                            .foregroundColor(!isUnlocked ? .secondary : (isPassed ? .green : .accentColor))
                                        
                                        VStack(alignment: .leading, spacing: 4) {
                                            Text("Bài học \(index + 1)")
                                                .font(.headline)
                                                .foregroundColor(isUnlocked ? .primary : .secondary)
                                            
                                            Text(isPassed ? "Hoàn thành 10/10" : (isUnlocked ? "Sẵn sàng học" : "Đang khóa"))
                                                .font(.caption)
                                                .foregroundColor(.secondary)
                                        }
                                    }
                                    .padding(.vertical, 4)
                                }
                                .disabled(!isUnlocked)
                            }
                        }
                    }
                }
                .navigationTitle("Bài học")
                #if os(macOS)
                .navigationSplitViewColumnWidth(min: 200, ideal: 220, max: 280)
                #endif
            default:
                VStack(spacing: 12) {
                    Image(systemName: "sidebar.left")
                        .font(.system(size: 32))
                        .foregroundColor(.secondary)
                    Text("Chọn chủ đề để xem bài học")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
        } detail: {
            // Column 3: Detail Column (WordListView or Utility View) wrapped in a NavigationStack to support back navigation on macOS/iPad
            NavigationStack {
                Group {
                    switch selectedItem {
                    case .topic(let topicName):
                        if let lessonIndex = selectedLessonIndex {
                            let topicWords = store.words.filter { $0.topic == topicName }
                            let startIndex = lessonIndex * 10
                            let endIndex = min(startIndex + 10, topicWords.count)
                            
                            if startIndex < topicWords.count {
                                let lessonWords = Array(topicWords[startIndex..<endIndex])
                                WordListView(topic: topicName, lessonIndex: lessonIndex, lessonWords: lessonWords)
                                    .id("\(topicName)_\(lessonIndex)") // Force recreation of views
                            } else {
                                Text("Bài học không tìm thấy từ vựng")
                                    .foregroundColor(.secondary)
                            }
                        } else {
                            VStack(spacing: 12) {
                                Image(systemName: "book.fill")
                                    .font(.system(size: 48))
                                    .foregroundColor(.accentColor)
                                Text("Chọn một bài học từ cột giữa")
                                    .font(.headline)
                                    .foregroundColor(.secondary)
                            }
                        }
                    case .phrases:
                        PhrasesView()
                    case .reading:
                        ReadingListView()
                    case .dictionary:
                        DictionaryView()
                    case .customWords:
                        CustomWordsView()
                    case .statistics:
                        StatisticsView()
                    case nil:
                        VStack(spacing: 12) {
                            Image(systemName: "square.grid.2x2")
                                .font(.system(size: 48))
                                .foregroundColor(.accentColor)
                            Text("Chào mừng bạn đến với VocaHani")
                                .font(.headline)
                            Text("Chọn một chủ đề học tập từ Sidebar để bắt đầu học.")
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                        }
                    }
                }
            }
        }
        .onAppear {
            if selectedItem == nil, let firstTopic = topics.first {
                selectedItem = .topic(firstTopic)
                selectedLessonIndex = 0
            }
        }
    }
    
    // Simple helper to resolve topic icons
    private func resolveTopicIcon(for topicName: String) -> String {
        let name = topicName.lowercased()
        if name.contains("gia đình") || name.contains("bạn") || name.contains("nhân thân") {
            return "heart.fill"
        }
        if name.contains("ăn") || name.contains("uống") || name.contains("bếp") || name.contains("trái cây") {
            return "fork.knife"
        }
        if name.contains("học") || name.contains("trường") || name.contains("sách") {
            return "pencil.and.ruler.fill"
        }
        if name.contains("du lịch") || name.contains("sân bay") || name.contains("biển") || name.contains("khách sạn") {
            return "globe.desk.fill"
        }
        if name.contains("sức khỏe") || name.contains("bệnh viện") {
            return "heart.text.square.fill"
        }
        if name.contains("công việc") || name.contains("nghề") || name.contains("tài chính") {
            return "briefcase.fill"
        }
        if name.contains("giao thông") || name.contains("đường đi") {
            return "car.fill"
        }
        if name.contains("giải trí") || name.contains("thể thao") || name.contains("âm nhạc") {
            return "gamecontroller.fill"
        }
        if name.contains("giáng sinh") {
            return "tree.fill"
        }
        return "book.closed.fill"
    }
}

#Preview {
    SidebarView()
        .environmentObject(VocabularyStore())
}
