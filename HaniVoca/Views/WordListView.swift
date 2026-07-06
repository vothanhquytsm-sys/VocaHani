import SwiftUI

struct WordListView: View {
    @EnvironmentObject var store: VocabularyStore
    let topic: String
    let lessonIndex: Int
    let lessonWords: [Word]
    
    @State private var searchText = ""
    @State private var showFavoritesOnly = false
    @State private var showUnlearnedOnly = false
    
    var filteredWords: [Word] {
        var list = lessonWords
        
        if showFavoritesOnly {
            list = list.filter { $0.isFavorite }
        }
        if showUnlearnedOnly {
            list = list.filter { !$0.isLearned }
        }
        
        if !searchText.isEmpty {
            list = list.filter {
                $0.word.localizedCaseInsensitiveContains(searchText) ||
                $0.vietnameseMeaning.localizedCaseInsensitiveContains(searchText)
            }
        }
        
        return list
    }
    
    var title: String {
        "\(topic) - Bài \(lessonIndex + 1)"
    }
    
    var body: some View {
        VStack(spacing: 0) {
            // Action banner for flashcards and test (Frosted Glass style)
            if !filteredWords.isEmpty {
                HStack(spacing: 16) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Tiến trình học")
                            .font(.caption)
                            .fontWeight(.bold)
                            .foregroundColor(.secondary)
                            .textCase(.uppercase)
                        
                        Text("\(filteredWords.count) từ vựng")
                            .font(.title3)
                            .fontWeight(.black)
                    }
                    
                    Spacer()
                    
                    HStack(spacing: 10) {
                        // Flashcards study button
                        NavigationLink(destination: FlashcardView(deckWords: lessonWords)) {
                            Image(systemName: "square.stack.3d.up.fill")
                                .foregroundColor(.white)
                                .font(.body)
                                .padding(12)
                                .background(
                                    LinearGradient(colors: [Color.accentColor, Color(red: 99/255, green: 102/255, blue: 241/255)],
                                                   startPoint: .leading, endPoint: .trailing)
                                )
                                .clipShape(Circle())
                                .shadow(color: Color.accentColor.opacity(0.3), radius: 6)
                        }
                        .buttonStyle(ScaleButtonStyle())
                        
                        // Quiz unlock button
                        let isPassed = store.passedLessons.contains("\(topic)_\(lessonIndex)")
                        NavigationLink(destination: TestView(topicName: topic, lessonIndex: lessonIndex, lessonWords: lessonWords)) {
                            HStack(spacing: 6) {
                                Image(systemName: isPassed ? "checkmark.circle.fill" : "checkmark.seal.fill")
                                Text(isPassed ? "Đạt 10/10" : "Kiểm tra")
                                    .font(.caption)
                                    .fontWeight(.black)
                            }
                            .padding(.horizontal, 16)
                            .padding(.vertical, 12)
                            .background(isPassed ? Color.emeraldColor : Color.purple)
                            .foregroundColor(.white)
                            .cornerRadius(16)
                            .shadow(color: (isPassed ? Color.emeraldColor : Color.purple).opacity(0.3), radius: 6)
                        }
                        .buttonStyle(ScaleButtonStyle())
                    }
                }
                .padding()
                .background(Color.appSecondarySystemBackground.opacity(0.8))
                .cornerRadius(24)
                .padding()
            }
            
            
            // Filter Pills (Vibrant pills design)
            HStack(spacing: 10) {
                Toggle(isOn: $showFavoritesOnly) {
                    Label("Yêu thích", systemImage: "heart.fill")
                }
                .toggleStyle(.button)
                .tint(.red)
                .buttonStyle(.bordered)
                .clipShape(Capsule())
                
                Toggle(isOn: $showUnlearnedOnly) {
                    Label("Chưa học", systemImage: "circle")
                }
                .toggleStyle(.button)
                .tint(.blue)
                .buttonStyle(.bordered)
                .clipShape(Capsule())
                
                Spacer()
            }
            .padding(.horizontal)
            .padding(.bottom, 12)
            .font(.caption2)
            .fontWeight(.bold)
            
            // Word list
            if filteredWords.isEmpty {
                VStack(spacing: 24) {
                    Spacer()
                    ZStack {
                        Circle()
                            .fill(Color.secondary.opacity(0.1))
                            .frame(width: 100, height: 100)
                        Image(systemName: "magnifyingglass")
                            .font(.system(size: 40))
                            .foregroundColor(.secondary)
                    }
                    Text("Không tìm thấy từ vựng nào")
                        .font(.headline)
                        .foregroundColor(.secondary)
                    Spacer()
                }
            } else {
                List {
                    ForEach(filteredWords) { word in
                        NavigationLink(destination: WordDetailView(words: filteredWords, currentIndex: filteredWords.firstIndex(where: { $0.id == word.id }) ?? 0, lessonIndex: lessonIndex)) {
                            HStack(spacing: 16) {
                                // Dynamic illustration symbol
                                ZStack {
                                    Circle()
                                        .fill(Color.accentColor.opacity(0.12))
                                        .frame(width: 44, height: 44)
                                    Image(systemName: word.symbolName)
                                        .foregroundColor(.accentColor)
                                        .font(.system(size: 18))
                                }
                                
                                VStack(alignment: .leading, spacing: 6) {
                                    HStack(alignment: .lastTextBaseline, spacing: 8) {
                                        Text(word.word)
                                            .font(.headline)
                                            .fontWeight(.bold)
                                        Text(word.ipa)
                                            .font(.caption)
                                            .foregroundColor(.secondary)
                                    }
                                    Text(word.vietnameseMeaning)
                                        .font(.subheadline)
                                        .foregroundColor(.secondary)
                                        .lineLimit(1)
                                }
                                
                                Spacer()
                                
                                // Clean Status indicators
                                HStack(spacing: 8) {
                                    if word.isFavorite {
                                        Image(systemName: "heart.fill")
                                            .foregroundColor(.red)
                                            .font(.footnote)
                                    }
                                    if word.isLearned {
                                        Image(systemName: "checkmark.circle.fill")
                                            .foregroundColor(.green)
                                            .font(.body)
                                    } else {
                                        Image(systemName: "circle")
                                            .foregroundColor(.secondary.opacity(0.4))
                                            .font(.body)
                                    }
                                }
                            }
                            .padding(.vertical, 4)
                        }
                        .swipeActions(edge: .trailing, allowsFullSwipe: true) {
                            Button {
                                store.toggleLearned(for: word)
                            } label: {
                                Label(word.isLearned ? "Chưa học" : "Đã học",
                                      systemImage: word.isLearned ? "circle" : "checkmark.circle.fill")
                            }
                            .tint(.green)
                            
                            Button {
                                store.toggleFavorite(for: word)
                            } label: {
                                Label(word.isFavorite ? "Bỏ thích" : "Thích",
                                      systemImage: word.isFavorite ? "heart.slash.fill" : "heart.fill")
                            }
                            .tint(.red)
                        }
                    }
                }
                #if os(macOS)
                .listStyle(.inset)
                #endif
            }
        }
        .navigationTitle(title)
        .searchable(text: $searchText, prompt: "Tìm kiếm từ hoặc nghĩa...")
        #if os(iOS)
        .navigationBarTitleDisplayMode(.inline)
        #endif
    }
}

#Preview {
    NavigationStack {
        WordListView(topic: "Food & Dining", lessonIndex: 0, lessonWords: [])
            .environmentObject(VocabularyStore())
    }
}
