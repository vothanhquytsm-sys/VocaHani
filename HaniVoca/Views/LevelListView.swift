import SwiftUI

struct LevelListView: View {
    @EnvironmentObject var store: VocabularyStore
    
    // Modern curated level color schemes
    let levels = [
        ("A1", "Cơ bản (Beginner)", [Color(red: 59/255, green: 130/255, blue: 246/255), Color(red: 6/255, green: 182/255, blue: 212/255)]),
        ("A2", "Sơ cấp (Elementary)", [Color(red: 16/255, green: 185/255, blue: 129/255), Color(red: 34/255, green: 197/255, blue: 94/255)]),
        ("B1", "Trung cấp (Intermediate)", [Color(red: 245/255, green: 158/255, blue: 11/255), Color(red: 234/255, green: 179/255, blue: 8/255)]),
        ("B2", "Trung cao cấp (Upper Intermediate)", [Color(red: 239/255, green: 68/255, blue: 68/255), Color(red: 249/255, green: 115/255, blue: 22/255)]),
        ("C1", "Cao cấp (Advanced)", [Color(red: 168/255, green: 85/255, blue: 247/255), Color(red: 236/255, green: 72/255, blue: 153/255)]),
        ("C2", "Thành thạo (Proficient)", [Color(red: 79/255, green: 70/255, blue: 229/255), Color(red: 124/255, green: 58/255, blue: 237/255)])
    ]
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 28) {
                // Header Title
                VStack(alignment: .leading, spacing: 6) {
                    Text("Cấp Độ Theo Tiêu Chuẩn")
                        .font(.subheadline)
                        .fontWeight(.bold)
                        .foregroundColor(.accentColor)
                        .textCase(.uppercase)
                        .tracking(1.5)
                    
                    Text("Lựa Chọn Trình Độ")
                        .font(.system(.largeTitle, design: .rounded))
                        .fontWeight(.black)
                }
                .padding(.horizontal, 4)
                .padding(.top, 12)
                
                ForEach(levels, id: \.0) { levelKey, title, colors in
                    let matchingWords = store.words.filter { $0.level == levelKey }
                    let totalCount = matchingWords.count
                    let learnedCount = matchingWords.filter { $0.isLearned }.count
                    let progress = totalCount > 0 ? Double(learnedCount) / Double(totalCount) : 0.0
                    
                    NavigationLink(destination: WordListView(topic: nil, level: levelKey)) {
                        HStack(spacing: 18) {
                            // Rounded Level Card badge
                            Text(levelKey)
                                .font(.system(.title, design: .rounded))
                                .fontWeight(.black)
                                .foregroundColor(.white)
                                .frame(width: 76, height: 76)
                                .background(
                                    LinearGradient(colors: colors, startPoint: .topLeading, endPoint: .bottomTrailing)
                                )
                                .cornerRadius(22)
                                .shadow(color: colors[0].opacity(0.3), radius: 8, y: 4)
                            
                            VStack(alignment: .leading, spacing: 8) {
                                Text(levelKey)
                                    .font(.headline)
                                    .fontWeight(.bold)
                                
                                Text(title)
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                                
                                // Progress bar with dynamic percentage tag
                                HStack(spacing: 12) {
                                    GeometryReader { geo in
                                        ZStack(alignment: .leading) {
                                            Capsule()
                                                .fill(Color.secondary.opacity(0.12))
                                            Capsule()
                                                .fill(LinearGradient(colors: colors, startPoint: .leading, endPoint: .trailing))
                                                .frame(width: geo.size.width * CGFloat(progress))
                                        }
                                    }
                                    .frame(height: 6)
                                    
                                    Text("\(Int(progress * 100))%")
                                        .font(.system(size: 10, weight: .black))
                                        .foregroundColor(.secondary)
                                }
                            }
                            
                            Spacer()
                            
                            VStack(alignment: .trailing, spacing: 4) {
                                Text("\(learnedCount)/\(totalCount)")
                                    .font(.system(.subheadline, design: .monospaced))
                                    .fontWeight(.bold)
                                Text("đã học")
                                    .font(.system(size: 9))
                                    .foregroundColor(.secondary)
                            }
                            
                            Image(systemName: "chevron.right")
                                .foregroundColor(.secondary.opacity(0.6))
                                .font(.footnote)
                        }
                        .padding(16)
                        .background(Color.appSecondarySystemBackground.opacity(0.6))
                        .cornerRadius(24)
                    }
                    .buttonStyle(ScaleButtonStyle())
                    .disabled(totalCount == 0)
                }
            }
            .padding()
        }
        .navigationTitle("Trình độ")
    }
}

#Preview {
    LevelListView()
        .environmentObject(VocabularyStore())
}
