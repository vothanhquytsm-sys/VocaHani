import SwiftUI

struct TopicInfo: Identifiable {
    var id: String { name }
    let name: String
    let vietnameseName: String
    let icon: String
    let gradients: [Color]
}

struct TopicListView: View {
    @EnvironmentObject var store: VocabularyStore
    
    // Computed property to dynamically generate topics from the database
    var dynamicTopics: [TopicInfo] {
        let uniqueTopicNames = Array(Set(store.words.map { $0.topic })).sorted()
        
        var list = uniqueTopicNames.map { topicName -> TopicInfo in
            let (icon, gradients) = resolveTopicVisuals(for: topicName)
            return TopicInfo(name: topicName, vietnameseName: topicName, icon: icon, gradients: gradients)
        }
        
        // Always ensure Custom is available if there are custom words
        if !store.customWords.isEmpty && !uniqueTopicNames.contains("Custom") {
            list.append(TopicInfo(
                name: "Custom",
                vietnameseName: "Từ vựng của bạn",
                icon: "pencil.circle.fill",
                gradients: [Color(red: 100/255, green: 110/255, blue: 120/255), Color(red: 50/255, green: 55/255, blue: 60/255)]
            ))
        }
        
        return list
    }
    
    #if os(macOS)
    let columns = [
        GridItem(.adaptive(minimum: 240, maximum: 320), spacing: 24)
    ]
    #else
    let columns = [
        GridItem(.flexible(), spacing: 18),
        GridItem(.flexible(), spacing: 18)
    ]
    #endif
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 28) {
                // Header Banner
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("VocaHani - Chủ đề")
                            .font(.system(size: 13, weight: .bold, design: .rounded))
                            .foregroundColor(.secondary)
                            .tracking(0.5)
                        
                        Text("Khám Phá\nChủ Đề")
                            .font(.system(size: 34, weight: .black, design: .rounded))
                            .foregroundColor(.primary)
                            .lineSpacing(-2)
                    }
                    Spacer()
                    
                    Image("logo")
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .frame(height: 72)
                }
                .padding(.horizontal, 4)
                .padding(.top, 16)
                
                if dynamicTopics.isEmpty {
                    VStack(spacing: 20) {
                        Spacer()
                        ProgressView("Đang tải danh sách chủ đề...")
                            .frame(maxWidth: .infinity)
                        Spacer()
                    }
                    .frame(height: 300)
                } else {
                    LazyVGrid(columns: columns, spacing: 20) {
                        ForEach(dynamicTopics) { topic in
                            NavigationLink(destination: TopicDetailView(topic: topic)) {
                                TopicCard(topic: topic)
                            }
                            .buttonStyle(ScaleButtonStyle())
                        }
                    }
                }
            }
            .padding()
        }
        .navigationTitle("")
        #if os(iOS)
        .navigationBarTitleDisplayMode(.inline)
        #endif
    }
    
    // Resolve icons and vibrant color palettes dynamically based on topic name semantics
    private func resolveTopicVisuals(for topicName: String) -> (String, [Color]) {
        let name = topicName.lowercased()
        
        // Mockup accurate gradients
        let blueTeal = [Color(red: 49/255, green: 70/255, blue: 229/255), Color(red: 56/255, green: 189/255, blue: 248/255)]
        let forestGreen = [Color(red: 16/255, green: 110/255, blue: 50/255), Color(red: 34/255, green: 197/255, blue: 94/255)]
        let orangeYellow = [Color(red: 245/255, green: 158/255, blue: 11/255), Color(red: 251/255, green: 191/255, blue: 36/255)]
        let purplePink = [Color(red: 168/255, green: 85/255, blue: 247/255), Color(red: 236/255, green: 72/255, blue: 153/255)]
        let slateGray = [Color(red: 100/255, green: 116/255, blue: 139/255), Color(red: 148/255, green: 163/255, blue: 184/255)]
        
        if name.contains("gia đình") || name.contains("bạn") || name.contains("nhân thân") {
            return ("heart.fill", purplePink)
        }
        if name.contains("ăn") || name.contains("uống") || name.contains("bếp") || name.contains("trái cây") || name.contains("rau") || name.contains("hải sản") {
            return ("fork.knife", orangeYellow)
        }
        if name.contains("học") || name.contains("trường") || name.contains("đồ dùng") || name.contains("sách") {
            return ("pencil.and.ruler.fill", blueTeal)
        }
        if name.contains("du lịch") || name.contains("sân bay") || name.contains("biển") || name.contains("khách sạn") || name.contains("quốc gia") {
            return ("globe.desk.fill", blueTeal)
        }
        if name.contains("sức khỏe") || name.contains("bệnh viện") || name.contains("cơ thể") {
            return ("heart.text.square.fill", forestGreen)
        }
        if name.contains("công việc") || name.contains("nghề") || name.contains("ngân hàng") || name.contains("bưu điện") || name.contains("tài chính") {
            return ("briefcase.fill", blueTeal)
        }
        if name.contains("giao thông") || name.contains("chỉ đường") || name.contains("đường đi") {
            return ("car.fill", blueTeal)
        }
        if name.contains("giải trí") || name.contains("thể thao") || name.contains("phim") || name.contains("âm nhạc") {
            return ("gamecontroller.fill", purplePink)
        }
        if name.contains("giáng sinh") {
            return ("tree.fill", forestGreen)
        }
        if name.contains("thú cưng") || name.contains("động vật") {
            return ("pawprint.fill", orangeYellow)
        }
        
        return ("doc.text.fill", slateGray)
    }
}

// MARK: - Scale Button Style for click feel
struct ScaleButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.96 : 1.0)
            .animation(.spring(response: 0.2, dampingFraction: 0.6), value: configuration.isPressed)
    }
}

// MARK: - Topic Card Component
struct TopicCard: View {
    @EnvironmentObject var store: VocabularyStore
    let topic: TopicInfo
    
    var body: some View {
        let matchingWords = store.words.filter { $0.topic == topic.name }
        let totalCount = matchingWords.count
        let learnedCount = matchingWords.filter { $0.isLearned }.count
        let progress = totalCount > 0 ? Double(learnedCount) / Double(totalCount) : 0.0
        
        ZStack(alignment: .trailing) {
            // Main card details on the left
            HStack(spacing: 0) {
                VStack(alignment: .leading, spacing: 0) {
                    // English / Vietnamese Title
                    Text(topic.vietnameseName)
                        .font(.system(size: 20, weight: .bold, design: .rounded))
                        .foregroundColor(.white)
                        .multilineTextAlignment(.leading)
                        .lineLimit(2)
                    
                    Spacer()
                    
                    // Progress Bar capsule
                    GeometryReader { geo in
                        ZStack(alignment: .leading) {
                            Capsule()
                                .fill(Color.white.opacity(0.24))
                            Capsule()
                                .fill(Color.white)
                                .frame(width: max(4, min(geo.size.width, geo.size.width * CGFloat(progress))))
                        }
                    }
                    .frame(height: 5)
                    .padding(.bottom, 6)
                    
                    // Count tag subheader text
                    Text("\(totalCount) từ")
                        .font(.system(size: 11, weight: .semibold, design: .rounded))
                        .foregroundColor(.white.opacity(0.85))
                }
                .padding(.vertical, 20)
                .padding(.leading, 18)
                .frame(maxWidth: .infinity, alignment: .leading)
                
                // Icon panel placeholder space
                Spacer()
                    .frame(width: 80)
            }
            
            // Stylized 3D-like overlapping icon
            ZStack {
                Circle()
                    .fill(Color.white.opacity(0.18))
                    .frame(width: 85, height: 85)
                    .blur(radius: 6)
                
                Circle()
                    .fill(
                        RadialGradient(
                            colors: [Color.white.opacity(0.4), Color.clear],
                            center: .center,
                            startRadius: 0,
                            endRadius: 50
                        )
                    )
                    .frame(width: 100, height: 100)
                
                Image(systemName: topic.icon)
                    .font(.system(size: 38))
                    .foregroundColor(.white)
                    .shadow(color: .black.opacity(0.2), radius: 6, x: 0, y: 3)
            }
            .offset(x: -8, y: 0)
        }
        .frame(height: 145)
        .background(
            LinearGradient(colors: topic.gradients, startPoint: .topLeading, endPoint: .bottomTrailing)
        )
        .cornerRadius(24)
        .shadow(color: topic.gradients[0].opacity(0.35), radius: 12, x: 0, y: 6)
        .contentShape(Rectangle())
    }
}

// MARK: - Topic Detail View (Lessons list under Topic)
struct TopicDetailView: View {
    @EnvironmentObject var store: VocabularyStore
    let topic: TopicInfo
    
    var topicWords: [Word] {
        store.words.filter { $0.topic == topic.name }
    }
    
    var totalLessons: Int {
        Int(ceil(Double(topicWords.count) / 10.0))
    }
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                // Topic Banner Card with large styling
                VStack(alignment: .leading, spacing: 12) {
                    HStack {
                        Image(systemName: topic.icon)
                            .font(.system(size: 38))
                            .foregroundColor(.white)
                            .padding(10)
                            .background(Color.white.opacity(0.2))
                            .clipShape(Circle())
                        Spacer()
                    }
                    
                    VStack(alignment: .leading, spacing: 4) {
                        Text(topic.vietnameseName)
                            .font(.system(.title, design: .rounded))
                            .fontWeight(.black)
                            .foregroundColor(.white)
                        
                        Text(topic.name)
                            .font(.subheadline)
                            .foregroundColor(.white.opacity(0.8))
                    }
                }
                .padding(24)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(
                    LinearGradient(colors: topic.gradients, startPoint: .topLeading, endPoint: .bottomTrailing)
                )
                .cornerRadius(28)
                .shadow(color: topic.gradients[0].opacity(0.3), radius: 12, y: 6)
                
                Text("Bài học tiến trình")
                    .font(.system(.headline, design: .rounded))
                    .fontWeight(.bold)
                    .foregroundColor(.secondary)
                    .padding(.top, 4)
                
                if totalLessons == 0 {
                    VStack(spacing: 20) {
                        Image(systemName: "books.vertical.fill")
                            .font(.largeTitle)
                            .foregroundColor(.secondary)
                        Text("Chưa có từ vựng nào thuộc chủ đề này.")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 40)
                } else {
                    ForEach(0..<totalLessons, id: \.self) { index in
                        let startIndex = index * 10
                        let endIndex = min(startIndex + 10, topicWords.count)
                        let lessonWords = Array(topicWords[startIndex..<endIndex])
                        let totalCount = lessonWords.count
                        let learnedCount = lessonWords.filter { $0.isLearned }.count
                        let progress = totalCount > 0 ? Double(learnedCount) / Double(totalCount) : 0.0
                        
                        let isUnlocked = store.isLessonUnlocked(topic: topic.name, index: index)
                        let isPassed = store.passedLessons.contains("\(topic.name)_\(index)")
                        
                        NavigationLink(destination: WordListView(topic: topic.name, lessonIndex: index, lessonWords: lessonWords)) {
                            HStack(spacing: 16) {
                                // Locked / Unlocked / Passed Index Badge
                                ZStack {
                                    if !isUnlocked {
                                        Image(systemName: "lock.fill")
                                            .font(.body)
                                            .foregroundColor(.white)
                                    } else if isPassed {
                                        Image(systemName: "checkmark")
                                            .font(.system(.body, design: .rounded))
                                            .fontWeight(.black)
                                            .foregroundColor(.white)
                                    } else {
                                        Text("\(index + 1)")
                                            .font(.system(.headline, design: .rounded))
                                            .fontWeight(.black)
                                            .foregroundColor(.white)
                                    }
                                }
                                .frame(width: 54, height: 54)
                                .background(
                                    LinearGradient(colors: isUnlocked ? topic.gradients : [Color.gray, Color.secondary],
                                                   startPoint: .topLeading, endPoint: .bottomTrailing)
                                )
                                .cornerRadius(16)
                                .shadow(color: (isUnlocked ? topic.gradients[0] : Color.gray).opacity(0.25), radius: 6)
                                
                                VStack(alignment: .leading, spacing: 8) {
                                    Text("Bài học \(index + 1)")
                                        .font(.headline)
                                        .fontWeight(.bold)
                                        .foregroundColor(isUnlocked ? .primary : .secondary)
                                    
                                    Text("\(totalCount) từ vựng")
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                    
                                    if isUnlocked && totalCount > 0 {
                                        GeometryReader { geo in
                                            ZStack(alignment: .leading) {
                                                Capsule()
                                                    .fill(Color.secondary.opacity(0.12))
                                                Capsule()
                                                    .fill(LinearGradient(colors: topic.gradients, startPoint: .leading, endPoint: .trailing))
                                                    .frame(width: geo.size.width * CGFloat(progress))
                                            }
                                        }
                                        .frame(height: 5)
                                    }
                                }
                                
                                Spacer()
                                
                                if isUnlocked {
                                    if isPassed {
                                        Text("Đạt 10/10")
                                            .font(.caption2)
                                            .fontWeight(.bold)
                                            .foregroundColor(Color.emeraldColor)
                                            .padding(.horizontal, 8)
                                            .padding(.vertical, 4)
                                            .background(Color.emeraldColor.opacity(0.12))
                                            .cornerRadius(6)
                                    } else {
                                        Text("\(learnedCount)/\(totalCount)")
                                            .font(.system(.caption, design: .monospaced))
                                            .fontWeight(.bold)
                                            .foregroundColor(.secondary)
                                    }
                                } else {
                                    Text("Chưa mở")
                                        .font(.caption2)
                                        .fontWeight(.bold)
                                        .foregroundColor(.secondary)
                                }
                                
                                Image(systemName: "chevron.right")
                                    .foregroundColor(.secondary.opacity(0.6))
                                    .font(.footnote)
                            }
                            .padding(14)
                            .background(Color.appSecondarySystemBackground.opacity(isUnlocked ? 0.6 : 0.3))
                            .cornerRadius(20)
                        }
                        .buttonStyle(ScaleButtonStyle())
                        .disabled(!isUnlocked)
                    }
                }
            }
            .padding()
        }
        .navigationTitle(topic.vietnameseName)
        #if os(iOS)
        .navigationBarTitleDisplayMode(.inline)
        #endif
    }
}

#Preview {
    NavigationStack {
        TopicListView()
            .environmentObject(VocabularyStore())
    }
}
