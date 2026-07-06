import SwiftUI

struct ReadingListView: View {
    @EnvironmentObject var store: VocabularyStore
    @State private var searchText = ""
    
    // Group passages by level
    var groupedPassages: [String: [ReadingPassage]] {
        let filtered = store.readings.filter {
            searchText.isEmpty || $0.title.localizedCaseInsensitiveContains(searchText)
        }
        return Dictionary(grouping: filtered, by: { $0.level })
    }
    
    var levelsSorted: [String] {
        groupedPassages.keys.sorted()
    }
    
    var body: some View {
        VStack(spacing: 0) {
            // Modern Search Bar
            VStack {
                HStack(spacing: 12) {
                    Image(systemName: "magnifyingglass")
                        .foregroundColor(.secondary)
                        .font(.title3)
                    
                    TextField("Tìm kiếm bài viết, cấp độ...", text: $searchText)
                        .textFieldStyle(PlainTextFieldStyle())
                        .font(.body)
                    
                    if !searchText.isEmpty {
                        Button {
                            searchText = ""
                        } label: {
                            Image(systemName: "xmark.circle.fill")
                                .foregroundColor(.secondary)
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 12)
                .background(Color.appSecondarySystemGroupedBackground)
                .cornerRadius(18)
                .overlay(
                    RoundedRectangle(cornerRadius: 18)
                        .stroke(Color.secondary.opacity(0.15), lineWidth: 1.5)
                )
            }
            .padding()
            .background(Color.appSystemBackground)
            
            // Passage Scroll Grid
            if store.readings.isEmpty {
                VStack(spacing: 20) {
                    Spacer()
                    Image(systemName: "book.closed.fill")
                        .font(.system(size: 72))
                        .foregroundColor(.secondary.opacity(0.5))
                    Text("Không tìm thấy bài đọc nào")
                        .font(.headline)
                        .foregroundColor(.secondary)
                    Spacer()
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .background(Color.appSystemBackground)
            } else {
                ScrollView {
                    LazyVStack(spacing: 24) {
                        ForEach(levelsSorted, id: \.self) { level in
                            VStack(alignment: .leading, spacing: 14) {
                                // Level Title Header
                                HStack(spacing: 8) {
                                    Circle()
                                        .fill(levelColor(for: level))
                                        .frame(width: 10, height: 10)
                                    
                                    Text("CẤP BẬC \(level)")
                                        .font(.system(.footnote, design: .rounded))
                                        .fontWeight(.black)
                                        .foregroundColor(levelColor(for: level))
                                        .tracking(1.5)
                                    
                                    Spacer()
                                }
                                .padding(.horizontal, 6)
                                
                                // Cards list for this level
                                if let passages = groupedPassages[level] {
                                    ForEach(passages) { passage in
                                        NavigationLink(destination: ReadingDetailView(passage: passage)) {
                                            ReadingPassageCard(passage: passage, score: store.completedReadings[passage.id])
                                        }
                                        .buttonStyle(.plain)
                                    }
                                }
                            }
                        }
                    }
                    .padding()
                }
                .background(Color.appSystemBackground)
            }
        }
        .navigationTitle("Luyện đọc")
    }
    
    // Level color helper
    private func levelColor(for level: String) -> Color {
        switch level {
        case "A1": return Color.green
        case "A2": return Color.blue
        case "B1": return Color.orange
        case "B2": return Color.red
        default: return Color.gray
        }
    }
}

// MARK: - Premium Reading Passage Card
struct ReadingPassageCard: View {
    let passage: ReadingPassage
    let score: Int?
    
    @State private var isHovered = false
    
    var body: some View {
        HStack(spacing: 20) {
            // Glow Level Icon
            ZStack {
                Circle()
                    .fill(
                        LinearGradient(
                            colors: levelColors(for: passage.level).map { $0.opacity(0.16) },
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(width: 58, height: 58)
                
                Circle()
                    .fill(
                        LinearGradient(
                            colors: levelColors(for: passage.level),
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(width: 44, height: 44)
                    .shadow(color: levelColors(for: passage.level).first!.opacity(0.3), radius: 6, x: 0, y: 3)
                
                Image(systemName: "doc.plaintext.fill")
                    .foregroundColor(.white)
                    .font(.system(size: 18, weight: .bold))
            }
            
            VStack(alignment: .leading, spacing: 8) {
                // Title
                Text(passage.title)
                    .font(.system(.title3, design: .rounded))
                    .fontWeight(.black)
                    .foregroundColor(.primary)
                    .multilineTextAlignment(.leading)
                
                // Details Chips
                HStack(spacing: 8) {
                    HStack(spacing: 4) {
                        Image(systemName: "character.book.closed.fill")
                            .font(.caption2)
                        Text("\(passage.vocabulary.count) từ cốt lõi")
                            .font(.system(size: 11, weight: .bold, design: .rounded))
                    }
                    .foregroundColor(.secondary)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 5)
                    .background(Color.secondary.opacity(0.07))
                    .cornerRadius(8)
                    
                    HStack(spacing: 4) {
                        Image(systemName: "questionmark.circle.fill")
                            .font(.caption2)
                        Text("\(passage.questions.count) câu hỏi")
                            .font(.system(size: 11, weight: .bold, design: .rounded))
                    }
                    .foregroundColor(.secondary)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 5)
                    .background(Color.secondary.opacity(0.07))
                    .cornerRadius(8)
                }
            }
            
            Spacer()
            
            // Score badge or play button
            if let score = score {
                VStack(spacing: 4) {
                    HStack(spacing: 4) {
                        Image(systemName: score == passage.questions.count ? "crown.fill" : "checkmark.seal.fill")
                            .foregroundColor(score == passage.questions.count ? .yellow : .white)
                            .font(.caption)
                        
                        Text("\(score)/\(passage.questions.count)")
                            .font(.system(size: 12, weight: .black, design: .rounded))
                            .foregroundColor(.white)
                    }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(
                        LinearGradient(
                            colors: score == passage.questions.count ? [Color.orange, Color.yellow] : [Color.emeraldColor, Color(red: 34/255, green: 197/255, blue: 94/255)],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .cornerRadius(12)
                    .shadow(color: (score == passage.questions.count ? Color.orange : Color.emeraldColor).opacity(0.3), radius: 6, y: 3)
                    
                    Text("Hoàn thành")
                        .font(.system(size: 9, weight: .bold))
                        .foregroundColor(.secondary)
                }
            } else {
                Image(systemName: "chevron.right")
                    .font(.system(size: 16, weight: .black))
                    .foregroundColor(.accentColor.opacity(0.8))
                    .padding(10)
                    .background(Color.accentColor.opacity(0.08))
                    .clipShape(Circle())
            }
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 18)
        .background(
            RoundedRectangle(cornerRadius: 24)
                .fill(Color.appSecondarySystemGroupedBackground)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 24)
                .stroke(isHovered ? Color.accentColor.opacity(0.4) : Color.secondary.opacity(0.12), lineWidth: 2)
        )
        .shadow(color: Color.black.opacity(isHovered ? 0.08 : 0.03), radius: isHovered ? 12 : 6, x: 0, y: isHovered ? 6 : 3)
        .scaleEffect(isHovered ? 1.015 : 1.0)
        .animation(.easeInOut(duration: 0.2), value: isHovered)
        .onHover { hovering in
            isHovered = hovering
        }
    }
    
    private func levelColors(for level: String) -> [Color] {
        switch level {
        case "A1": return [Color.green, Color.emeraldColor]
        case "A2": return [Color.blue, Color(red: 56/255, green: 189/255, blue: 248/255)]
        case "B1": return [Color.orange, Color.yellow]
        case "B2": return [Color.red, Color.orange]
        default: return [.gray, .secondary]
        }
    }
}
