import SwiftUI
import Charts

struct TopicProgressItem: Identifiable {
    var id: String { topic }
    let topic: String
    let passed: Int
    let total: Int
}

struct StatisticsView: View {
    @EnvironmentObject var store: VocabularyStore
    
    @State private var showingResetAlert = false
    
    // Overall Stats
    var totalWordsCount: Int {
        store.words.count
    }
    
    var learnedWordsCount: Int {
        store.words.filter { $0.isLearned }.count
    }
    
    var overallProgress: Double {
        totalWordsCount > 0 ? Double(learnedWordsCount) / Double(totalWordsCount) : 0.0
    }
    
    var favoriteWordsCount: Int {
        store.words.filter { $0.isFavorite }.count
    }
    
    var customWordsCount: Int {
        store.customWords.count
    }
    
    // Calculate total lessons in the database
    var totalLessonsCount: Int {
        let grouped = Dictionary(grouping: store.words, by: { $0.topic })
        var total = 0
        for (_, words) in grouped {
            total += Int(ceil(Double(words.count) / 10.0))
        }
        return total
    }
    
    var passedLessonsCount: Int {
        store.passedLessons.count
    }
    
    // Calculate progress data for each topic
    var topicProgressData: [TopicProgressItem] {
        let grouped = Dictionary(grouping: store.words, by: { $0.topic })
        return grouped.keys.sorted().map { topicName in
            let wordsInTopic = grouped[topicName] ?? []
            let total = Int(ceil(Double(wordsInTopic.count) / 10.0))
            
            // Count how many keys like "TopicName_Index" are present in store.passedLessons
            var passed = 0
            for idx in 0..<total {
                if store.passedLessons.contains("\(topicName)_\(idx)") {
                    passed += 1
                }
            }
            
            return TopicProgressItem(topic: topicName, passed: passed, total: total)
        }
    }
    
    #if os(macOS)
    let columns = [
        GridItem(.flexible(), spacing: 16),
        GridItem(.flexible(), spacing: 16),
        GridItem(.flexible(), spacing: 16)
    ]
    #else
    let columns = [
        GridItem(.flexible(), spacing: 12),
        GridItem(.flexible(), spacing: 12)
    ]
    #endif
    
    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Header Banner
                HStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("VOCAHANI - Tiến Độ")
                            .font(.system(size: 13, weight: .bold, design: .rounded))
                            .foregroundColor(.secondary)
                            .tracking(0.5)
                        
                        Text("Tiến Độ\nCủa Bạn")
                            .font(.system(size: 34, weight: .black, design: .rounded))
                            .foregroundColor(.primary)
                            .lineSpacing(-2)
                    }
                    Spacer()
                    
                    // Reset Button
                    Button {
                        showingResetAlert = true
                    } label: {
                        Image(systemName: "arrow.counterclockwise")
                            .font(.system(size: 16, weight: .bold))
                            .foregroundColor(.red)
                            .padding(12)
                            .background(Color.red.opacity(0.12))
                            .clipShape(Circle())
                    }
                    .buttonStyle(.plain)
                }
                .padding(.horizontal)
                .padding(.top, 16)
                
                // Overall Progress Card
                VStack(spacing: 20) {
                    HStack(spacing: 20) {
                        // Circular progress ring
                        ZStack {
                            Circle()
                                .stroke(Color.secondary.opacity(0.1), lineWidth: 12)
                                .frame(width: 100, height: 100)
                            
                            Circle()
                                .trim(from: 0.0, to: CGFloat(overallProgress))
                                .stroke(
                                    LinearGradient(colors: [Color.blue, Color(red: 99/255, green: 102/255, blue: 241/255)], startPoint: .top, endPoint: .bottom),
                                    style: StrokeStyle(lineWidth: 12, lineCap: .round)
                                )
                                .frame(width: 100, height: 100)
                                .rotationEffect(.degrees(-90))
                                .animation(.spring(response: 0.8, dampingFraction: 0.7), value: overallProgress)
                            
                            VStack(spacing: 2) {
                                Text("\(Int(overallProgress * 100))%")
                                    .font(.system(size: 24, weight: .black, design: .rounded))
                                    .foregroundColor(.primary)
                                Text("ĐÃ THUỘC")
                                    .font(.system(size: 8, weight: .bold))
                                    .foregroundColor(.secondary)
                                    .tracking(0.5)
                            }
                        }
                        .padding(.vertical, 4)
                        
                        // Detailed description
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Tổng quan tiến trình")
                                .font(.system(size: 16, weight: .bold, design: .rounded))
                                .foregroundColor(.primary)
                            
                            Text("Bạn đã học thuộc \(learnedWordsCount) từ trên tổng số \(totalWordsCount) từ vựng thông dụng.")
                                .font(.system(size: 14, design: .rounded))
                                .foregroundColor(.secondary)
                                .lineSpacing(3)
                        }
                        Spacer()
                    }
                }
                .padding(20)
                .background(Color.appSecondarySystemGroupedBackground)
                .cornerRadius(28)
                .shadow(color: Color.black.opacity(0.04), radius: 10, y: 5)
                .padding(.horizontal)
                
                // Topic Progress Chart (Vertical Swift Chart matching mockup)
                VStack(alignment: .leading, spacing: 18) {
                    Text("Tiến trình học tập")
                        .font(.system(size: 16, weight: .bold, design: .rounded))
                        .foregroundColor(.primary)
                    
                    Chart {
                        ForEach(topicProgressData.prefix(6)) { item in
                            BarMark(
                                x: .value("Chủ đề", String(item.topic.prefix(5))),
                                y: .value("Bài học", item.passed)
                            )
                            .foregroundStyle(
                                LinearGradient(
                                    colors: [Color.blue, Color(red: 99/255, green: 102/255, blue: 241/255)],
                                    startPoint: .bottom,
                                    endPoint: .top
                                )
                            )
                            .cornerRadius(6)
                        }
                    }
                    .chartYAxis {
                        AxisMarks(position: .leading)
                    }
                    .frame(height: 200)
                    .padding(.top, 10)
                }
                .padding(20)
                .background(Color.appSecondarySystemGroupedBackground)
                .cornerRadius(28)
                .shadow(color: Color.black.opacity(0.04), radius: 10, y: 5)
                .padding(.horizontal)
            }
            .padding(.vertical)
        }
        .navigationTitle("")
        .appNavigationBarHidden()
        .alert("Xác nhận Reset Tiến Độ", isPresented: $showingResetAlert) {
            Button("Reset", role: .destructive) {
                store.resetLessonProgress()
            }
            Button("Hủy", role: .cancel) {}
        } message: {
            Text("Hành động này sẽ xóa tất cả các bài kiểm tra đã vượt qua và trạng thái từ vựng đã học. Bạn sẽ học lại từ đầu.")
        }
    }
}

#Preview {
    NavigationStack {
        StatisticsView()
            .environmentObject(VocabularyStore())
    }
}

// MARK: - Metric Card Component
struct MetricCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: icon)
                    .foregroundColor(color)
                    .font(.headline)
                    .padding(8)
                    .background(color.opacity(0.12))
                    .clipShape(Circle())
                Spacer()
            }
            
            VStack(alignment: .leading, spacing: 4) {
                Text(value)
                    .font(.system(.title2, design: .rounded))
                    .fontWeight(.black)
                Text(title)
                    .font(.caption2)
                    .foregroundColor(.secondary)
                    .fontWeight(.bold)
            }
        }
        .padding()
        .background(Color.appSecondarySystemBackground.opacity(0.65))
        .cornerRadius(20)
        .shadow(color: Color.black.opacity(0.02), radius: 5)
    }
}
