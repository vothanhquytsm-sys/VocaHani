import SwiftUI

struct ReadingDetailView: View {
    @EnvironmentObject var store: VocabularyStore
    @Environment(\.dismiss) var dismiss
    
    let passage: ReadingPassage
    
    @StateObject private var synthesizer = SpeechSynthesizer()
    @State private var selectedWordResult: LookupResult? = nil
    @State private var isLoadingWord = false
    @State private var showQuiz = false
    @State private var savedWordSuccess = false
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                // Header level badge & stats
                HStack {
                    Text("Cấp bậc \(passage.level)")
                        .font(.system(.caption, design: .rounded))
                        .fontWeight(.black)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 8)
                        .background(levelColor.opacity(0.12))
                        .foregroundColor(levelColor)
                        .cornerRadius(10)
                    
                    Spacer()
                    
                    if let score = store.completedReadings[passage.id] {
                        HStack(spacing: 4) {
                            Image(systemName: "checkmark.seal.fill")
                                .foregroundColor(Color.emeraldColor)
                            Text("Đã làm: \(score)/\(passage.questions.count)")
                                .font(.caption)
                                .fontWeight(.bold)
                                .foregroundColor(.secondary)
                        }
                    }
                }
                
                // Title
                Text(passage.title)
                    .font(.system(size: 34, weight: .black, design: .rounded))
                    .foregroundColor(.primary)
                
                // Key Vocabulary section
                if !passage.vocabulary.isEmpty {
                    VStack(alignment: .leading, spacing: 10) {
                        Text("TỪ VỰNG CỐT LÕI (Nhấp để tra nghĩa)")
                            .font(.caption2)
                            .fontWeight(.black)
                            .foregroundColor(.secondary)
                            .tracking(1.2)
                        
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 10) {
                                ForEach(passage.vocabulary, id: \.self) { vocab in
                                    Button {
                                        lookupWord(vocab)
                                    } label: {
                                        Text(vocab)
                                            .font(.subheadline)
                                            .fontWeight(.bold)
                                            .padding(.horizontal, 14)
                                            .padding(.vertical, 8)
                                            .background(Color.accentColor.opacity(0.08))
                                            .foregroundColor(.accentColor)
                                            .cornerRadius(12)
                                    }
                                    .buttonStyle(.plain)
                                }
                            }
                        }
                    }
                    .padding(.vertical, 4)
                }
                
                Divider()
                
                // Reading passage content with word-tap capability
                VStack(alignment: .leading, spacing: 12) {
                    Text("BÀI ĐỌC (Nhấp vào bất kỳ từ nào để tra nghĩa)")
                        .font(.caption2)
                        .fontWeight(.black)
                        .foregroundColor(.secondary)
                        .tracking(1.2)
                        .padding(.bottom, 6)
                    
                    InteractiveReadingFlowLayout(text: passage.content) { tappedWord in
                        lookupWord(tappedWord)
                    }
                }
                
                Spacer().frame(height: 20)
                
                // Action: Start Test Button
                Button {
                    showQuiz = true
                } label: {
                    HStack(spacing: 8) {
                        Image(systemName: "square.and.pencil")
                            .font(.title3)
                        Text("Làm bài kiểm tra đọc hiểu")
                            .fontWeight(.black)
                    }
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 16)
                    .background(
                        LinearGradient(colors: [Color.purple, Color.blue], startPoint: .leading, endPoint: .trailing)
                    )
                    .cornerRadius(16)
                    .shadow(color: Color.purple.opacity(0.35), radius: 10, y: 5)
                }
                .buttonStyle(.plain)
            }
            .padding()
        }
        .navigationTitle("Chi tiết bài đọc")
        #if os(iOS)
        .navigationBarTitleDisplayMode(.inline)
        #endif
        .sheet(isPresented: $showQuiz) {
            ReadingQuizView(passage: passage)
                .environmentObject(store)
        }
        .sheet(item: $selectedWordResult) { result in
            WordDefinitionSheet(result: result, store: store, synthesizer: synthesizer)
                .presentationDetents([.fraction(0.42), .medium])
        }
        .overlay(
            Group {
                if isLoadingWord {
                    ZStack {
                        Color.black.opacity(0.15)
                            .edgesIgnoringSafeArea(.all)
                        
                        VStack(spacing: 12) {
                            ProgressView()
                                .progressViewStyle(CircularProgressViewStyle())
                                .scaleEffect(1.2)
                            Text("Đang tra từ điển...")
                                .font(.caption)
                                .fontWeight(.bold)
                                .foregroundColor(.secondary)
                        }
                        .padding(24)
                        .background(Color.appSecondarySystemBackground)
                        .cornerRadius(20)
                        .shadow(radius: 10)
                    }
                }
            }
        )
    }
    
    // MARK: - Level color helper
    private var levelColor: Color {
        switch passage.level {
        case "A1": return .green
        case "A2": return .blue
        case "B1": return .orange
        case "B2": return .red
        default: return .gray
        }
    }
    
    private func lookupWord(_ word: String) {
        let clean = word.trimmingCharacters(in: .punctuationCharacters)
            .trimmingCharacters(in: .whitespacesAndNewlines)
        guard !clean.isEmpty else { return }
        
        isLoadingWord = true
        Task {
            do {
                let result = try await DictionaryLookupService.lookup(word: clean)
                await MainActor.run {
                    self.selectedWordResult = result
                    self.isLoadingWord = false
                }
            } catch {
                await MainActor.run {
                    // Offline fallback translation
                    self.selectedWordResult = LookupResult(
                        word: clean,
                        ipa: "",
                        vietnameseMeaning: "Tra cứu thất bại. Vui lòng kiểm tra kết nối mạng.",
                        exampleEnglish: "",
                        exampleVietnamese: "",
                        symbolName: "exclamationmark.triangle.fill"
                    )
                    self.isLoadingWord = false
                }
            }
        }
    }
}

// MARK: - Interactive Reading Flow Layout
struct InteractiveReadingFlowLayout: View {
    let text: String
    let onWordTap: (String) -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            ForEach(text.components(separatedBy: "\n"), id: \.self) { paragraph in
                ParagraphWordsWrapView(paragraph: paragraph, onWordTap: onWordTap)
            }
        }
    }
}

struct ParagraphWordsWrapView: View {
    let paragraph: String
    let onWordTap: (String) -> Void
    
    @State private var totalHeight = CGFloat.zero
    
    var body: some View {
        VStack {
            GeometryReader { geometry in
                self.generateContent(in: geometry)
            }
        }
        .frame(height: totalHeight)
    }
    
    private func generateContent(in g: GeometryProxy) -> some View {
        var width = CGFloat.zero
        var height = CGFloat.zero
        
        let words = paragraph.components(separatedBy: " ")
        
        return ZStack(alignment: .topLeading) {
            ForEach(Array(words.enumerated()), id: \.offset) { index, word in
                // Keep punctuation with original presentation text, but strip for clean lookup
                let presentationText = word + " "
                
                Button {
                    onWordTap(word)
                } label: {
                    Text(presentationText)
                        .font(.system(.body, design: .rounded))
                        .fontWeight(.bold)
                        .foregroundColor(.primary)
                }
                .buttonStyle(.plain)
                .alignmentGuide(.leading) { d in
                    if (abs(width - d.width) > g.size.width) {
                        width = 0
                        height -= d.height + 6
                    }
                    let result = width
                    if index == words.count - 1 {
                        width = 0
                    } else {
                        width -= d.width
                    }
                    return result
                }
                .alignmentGuide(.top) { d in
                    let result = height
                    if index == words.count - 1 {
                        height = 0
                    }
                    return result
                }
            }
        }
        .background(GeometryReader { gp -> Color in
            DispatchQueue.main.async {
                self.totalHeight = gp.size.height
            }
            return Color.clear
        })
    }
}

// MARK: - Word Definition Sheet
struct WordDefinitionSheet: View {
    let result: LookupResult
    let store: VocabularyStore
    let synthesizer: SpeechSynthesizer
    
    @Environment(\.dismiss) var dismiss
    @State private var isSaved = false
    
    var isWordAlreadySaved: Bool {
        store.words.contains(where: { $0.word.lowercased() == result.word.lowercased() })
    }
    
    var body: some View {
        VStack(spacing: 20) {
            // Header with Drag Indicator and Close Button
            ZStack {
                Capsule()
                    .fill(Color.secondary.opacity(0.3))
                    .frame(width: 40, height: 5)
                
                HStack {
                    Spacer()
                    Button {
                        dismiss()
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundColor(.secondary)
                            .font(.title2)
                    }
                    .buttonStyle(.plain)
                    .padding(.trailing, 20)
                }
            }
            .padding(.top, 14)
            .padding(.bottom, 6)
            
            VStack(spacing: 12) {
                // Word and speaker
                HStack(spacing: 16) {
                    Text(result.word)
                        .font(.system(.title, design: .rounded))
                        .fontWeight(.black)
                    
                    Button {
                        synthesizer.speak(result.word)
                    } label: {
                        Image(systemName: "speaker.wave.2.fill")
                            .foregroundColor(.white)
                            .padding(10)
                            .background(Color.accentColor)
                            .clipShape(Circle())
                    }
                    .buttonStyle(.plain)
                    
                    Spacer()
                }
                
                // IPA
                if !result.ipa.isEmpty {
                    Text(result.ipa)
                        .font(.title3)
                        .foregroundColor(.secondary)
                        .frame(maxWidth: .infinity, alignment: .leading)
                }
                
                Divider()
                
                // Meaning
                VStack(alignment: .leading, spacing: 6) {
                    Text("Ý NGHĨA")
                        .font(.caption2)
                        .fontWeight(.black)
                        .foregroundColor(.secondary)
                        .tracking(1.2)
                    
                    Text(result.vietnameseMeaning)
                        .font(.headline)
                        .fontWeight(.black)
                        .foregroundColor(.primary)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                
                if !result.exampleEnglish.isEmpty {
                    Divider()
                    
                    // Example
                    VStack(alignment: .leading, spacing: 6) {
                        Text("VÍ DỤ")
                            .font(.caption2)
                            .fontWeight(.black)
                            .foregroundColor(.secondary)
                            .tracking(1.2)
                        
                        Text(result.exampleEnglish)
                            .font(.subheadline)
                            .fontWeight(.bold)
                            .italic()
                        
                        Text(result.exampleVietnamese)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                }
            }
            .padding(.horizontal, 24)
            
            Spacer()
            
            // Save Word Button
            Button {
                if !isWordAlreadySaved && !isSaved {
                    store.addCustomWord(
                        word: result.word,
                        ipa: result.ipa,
                        meaning: result.vietnameseMeaning,
                        exampleEn: result.exampleEnglish,
                        exampleVi: result.exampleVietnamese,
                        topic: "Từ bài đọc",
                        level: "B1"
                    )
                    withAnimation {
                        isSaved = true
                    }
                }
            } label: {
                HStack(spacing: 8) {
                    Image(systemName: (isWordAlreadySaved || isSaved) ? "checkmark.circle.fill" : "plus.circle.fill")
                    Text((isWordAlreadySaved || isSaved) ? "Đã lưu vào Từ của tôi" : "Lưu vào Từ của tôi")
                        .fontWeight(.black)
                }
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .background((isWordAlreadySaved || isSaved) ? Color.emeraldColor : Color.accentColor)
                .cornerRadius(14)
            }
            .buttonStyle(.plain)
            .padding(.horizontal, 24)
            .padding(.bottom, 20)
        }
        .background(Color.appSecondarySystemBackground.edgesIgnoringSafeArea(.all))
    }
}

// Helper identifier for Sheet model binding
extension LookupResult: Identifiable {
    public var id: String { word }
}
