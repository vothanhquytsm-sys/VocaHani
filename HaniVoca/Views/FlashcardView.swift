import SwiftUI

struct FlashcardView: View {
    @EnvironmentObject var store: VocabularyStore
    @Environment(\.dismiss) var dismiss
    
    let deckWords: [Word]
    
    @State private var shuffledWords: [Word] = []
    @State private var currentIndex = 0
    @State private var isFlipped = false
    @State private var degrees: Double = 0.0
    @State private var dragOffset = CGSize.zero
    @State private var rememberedCount = 0
    @State private var sessionFinished = false
    
    @StateObject private var synthesizer = SpeechSynthesizer()
    
    // Background color based on drag gesture for dynamic feedback
    var dragBackgroundColor: Color {
        let width = dragOffset.width
        if width > 0 {
            return Color.green.opacity(min(0.2, Double(width / 600.0)))
        } else if width < 0 {
            return Color.red.opacity(min(0.2, Double(-width / 600.0)))
        }
        return Color.clear
    }
    
    var body: some View {
        ZStack {
            // Base background
            Color.appSystemBackground
                .ignoresSafeArea()
            
            // Dynamic swipe glow overlay
            dragBackgroundColor
                .ignoresSafeArea()
                .animation(.easeOut(duration: 0.15), value: dragOffset.width)
            
            if sessionFinished {
                // Session summary screen (Premium dashboard results)
                VStack(spacing: 28) {
                    Spacer()
                    
                    ZStack {
                        Circle()
                            .fill(Color.yellow.opacity(0.12))
                            .frame(width: 160, height: 160)
                        
                        Image(systemName: "crown.fill")
                            .font(.system(size: 80))
                            .foregroundColor(.yellow)
                            .shadow(color: .yellow.opacity(0.4), radius: 8)
                    }
                    
                    Text("Hoàn thành vòng học!")
                        .font(.system(.title, design: .rounded))
                        .fontWeight(.black)
                    
                    VStack(spacing: 16) {
                        Text("KẾT QUẢ HỌC TẬP")
                            .font(.caption2)
                            .fontWeight(.black)
                            .foregroundColor(.secondary)
                            .tracking(1.5)
                        
                        HStack(spacing: 48) {
                            VStack(spacing: 6) {
                                Text("\(rememberedCount)")
                                    .font(.system(size: 42, weight: .black, design: .rounded))
                                    .foregroundColor(.green)
                                Text("Đã nhớ")
                                    .font(.caption)
                                    .fontWeight(.bold)
                                    .foregroundColor(.secondary)
                            }
                            
                            VStack(spacing: 6) {
                                Text("\(shuffledWords.count - rememberedCount)")
                                    .font(.system(size: 42, weight: .black, design: .rounded))
                                    .foregroundColor(.red)
                                Text("Chưa nhớ")
                                    .font(.caption)
                                    .fontWeight(.bold)
                                    .foregroundColor(.secondary)
                            }
                        }
                        .padding(.horizontal, 40)
                        .padding(.vertical, 24)
                        .background(Color.appSecondarySystemBackground.opacity(0.7))
                        .cornerRadius(24)
                        .shadow(color: Color.black.opacity(0.03), radius: 8)
                    }
                    
                    Spacer()
                    
                    VStack(spacing: 16) {
                        Button {
                            resetSession()
                        } label: {
                            Text("Học lại lượt này")
                                .font(.headline)
                                .fontWeight(.black)
                                .foregroundColor(.white)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 16)
                                .background(Color.accentColor)
                                .cornerRadius(16)
                                .shadow(color: Color.accentColor.opacity(0.3), radius: 8, y: 4)
                        }
                        .buttonStyle(.plain)
                        
                        Button {
                            dismiss()
                        } label: {
                            Text("Quay về danh sách")
                                .font(.headline)
                                .fontWeight(.black)
                                .foregroundColor(.accentColor)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 16)
                                .background(Color.accentColor.opacity(0.08))
                                .cornerRadius(16)
                        }
                        .buttonStyle(.plain)
                    }
                    .padding(.horizontal, 32)
                    .padding(.bottom, 40)
                }
            } else if !shuffledWords.isEmpty {
                // Flashcard deck view
                VStack(spacing: 20) {
                    // Progress Header
                    HStack {
                        ProgressView(value: Double(currentIndex + 1), total: Double(shuffledWords.count))
                            .progressViewStyle(.linear)
                            .tint(Color.accentColor)
                            .frame(width: 120)
                        
                        Text("\(currentIndex + 1) / \(shuffledWords.count)")
                            .font(.system(.subheadline, design: .monospaced))
                            .fontWeight(.black)
                            .foregroundColor(.secondary)
                        
                        Spacer()
                        
                        // Repeat pronunciation
                        Button {
                            synthesizer.speak(shuffledWords[currentIndex].word)
                        } label: {
                            Image(systemName: "speaker.wave.2.fill")
                                .font(.body)
                                .foregroundColor(.accentColor)
                                .padding(10)
                                .background(Color.accentColor.opacity(0.1))
                                .clipShape(Circle())
                        }
                        .buttonStyle(.plain)
                    }
                    .padding(.horizontal)
                    .padding(.top)
                    
                    Spacer()
                    
                    // Card Pile Stack
                    ZStack {
                        // Card 3 (Bottom card of the deck)
                        if currentIndex + 2 < shuffledWords.count {
                            CardContent(word: shuffledWords[currentIndex + 2], degrees: 0.0)
                                .frame(height: 380)
                                .scaleEffect(0.90)
                                .offset(y: 24)
                                .opacity(0.4)
                                .disabled(true)
                        }
                        
                        // Card 2 (Middle card of the deck)
                        if currentIndex + 1 < shuffledWords.count {
                            CardContent(word: shuffledWords[currentIndex + 1], degrees: 0.0)
                                .frame(height: 380)
                                .scaleEffect(0.95)
                                .offset(y: 12)
                                .opacity(0.85)
                                .disabled(true)
                        }
                        
                        // Card 1 (Top Active card)
                        CardContent(word: shuffledWords[currentIndex], degrees: degrees)
                            .frame(height: 380)
                            .offset(dragOffset)
                            .rotationEffect(.degrees(Double(dragOffset.width / 15)))
                            .gesture(
                                DragGesture()
                                    .onChanged { gesture in
                                        dragOffset = gesture.translation
                                    }
                                    .onEnded { gesture in
                                        let width = gesture.translation.width
                                        if width > 120 {
                                            rateAndNext(quality: 4) // Swiped right: default high memory rating
                                        } else if width < -120 {
                                            rateAndNext(quality: 1) // Swiped left: default poor memory rating
                                        } else {
                                            withAnimation(.spring(response: 0.35, dampingFraction: 0.65)) {
                                                dragOffset = .zero
                                            }
                                        }
                                    }
                            )
                            .onTapGesture {
                                withAnimation(.spring(response: 0.45, dampingFraction: 0.7)) {
                                    isFlipped.toggle()
                                    degrees += 180.0
                                }
                            }
                        
                        // Swipe HUD Overlays
                        if dragOffset.width > 30 {
                            Text("NHỚ")
                                .font(.system(size: 26, weight: .black))
                                .foregroundColor(.green)
                                .padding(.horizontal, 20)
                                .padding(.vertical, 10)
                                .background(
                                    RoundedRectangle(cornerRadius: 14)
                                        .stroke(Color.green, lineWidth: 4)
                                )
                                .rotationEffect(.degrees(-15))
                                .opacity(min(1.0, Double((dragOffset.width - 30) / 60)))
                                .offset(x: -80, y: -100)
                        } else if dragOffset.width < -30 {
                            Text("QUÊN")
                                .font(.system(size: 26, weight: .black))
                                .foregroundColor(.red)
                                .padding(.horizontal, 20)
                                .padding(.vertical, 10)
                                .background(
                                    RoundedRectangle(cornerRadius: 14)
                                        .stroke(Color.red, lineWidth: 4)
                                )
                                .rotationEffect(.degrees(15))
                                .opacity(min(1.0, Double((-dragOffset.width - 30) / 60)))
                                .offset(x: 80, y: -100)
                        }
                    }
                    .padding(.horizontal)
                    
                    Spacer()
                    
                    // SM-2 Spaced Repetition Quality Rating Controls (Shown when card is flipped)
                    if isFlipped {
                        VStack(spacing: 8) {
                            Text("Đánh giá mức độ nhớ từ (SM-2):")
                                .font(.system(size: 13, weight: .bold, design: .rounded))
                                .foregroundColor(.secondary)
                            
                            HStack(spacing: 8) {
                                ForEach(0...5, id: \.self) { q in
                                    Button {
                                        rateAndNext(quality: q)
                                    } label: {
                                        VStack(spacing: 4) {
                                            Text("\(q)")
                                                .font(.system(size: 16, weight: .bold, design: .rounded))
                                                .foregroundColor(.white)
                                                .frame(width: 38, height: 38)
                                                .background(ratingColor(q))
                                                .clipShape(Circle())
                                                .shadow(color: ratingColor(q).opacity(0.3), radius: 3, y: 1.5)
                                            
                                            Text(ratingLabel(q))
                                                .font(.system(size: 8, weight: .bold, design: .rounded))
                                                .foregroundColor(.secondary)
                                        }
                                    }
                                    .buttonStyle(.plain)
                                }
                            }
                            .padding(.top, 4)
                        }
                        .transition(.opacity.combined(with: .scale))
                    } else {
                        // Tip Info block
                        HStack(spacing: 8) {
                            Image(systemName: "hand.draw")
                                .foregroundColor(.secondary)
                            Text("Chạm để lật thẻ. Vuốt PHẢI để ghi nhớ, TRÁI để bỏ qua.")
                                .font(.system(size: 11, weight: .bold))
                                .foregroundColor(.secondary)
                        }
                        .padding(.bottom, 12)
                    }
                    
                    Spacer().frame(height: 12)
                }
            } else {
                ProgressView("Đang tải dữ liệu thẻ...")
            }
        }
        .navigationTitle("Luyện từ vựng")
        #if os(iOS)
        .navigationBarTitleDisplayMode(.inline)
        #endif
        .onAppear {
            initializeDeck()
        }
        .onChange(of: currentIndex) { _ in
            playCurrentWordSpeech()
        }
        .onDisappear {
            synthesizer.stop()
        }
    }
    
    private func initializeDeck() {
        shuffledWords = deckWords.shuffled()
        currentIndex = 0
        rememberedCount = 0
        sessionFinished = false
        isFlipped = false
        degrees = 0.0
        dragOffset = .zero
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.4) {
            playCurrentWordSpeech()
        }
    }
    
    private func playCurrentWordSpeech() {
        guard currentIndex < shuffledWords.count else { return }
        synthesizer.speak(shuffledWords[currentIndex].word)
    }
    
    private func rateAndNext(quality: Int) {
        let currentWord = shuffledWords[currentIndex]
        store.rateWordQuality(wordId: currentWord.id, quality: quality)
        
        #if os(iOS)
        let generator = UINotificationFeedbackGenerator()
        generator.notificationOccurred(quality >= 3 ? .success : .warning)
        #endif
        
        if quality >= 3 {
            rememberedCount += 1
        }
        
        withAnimation(.easeOut(duration: 0.22)) {
            dragOffset = CGSize(width: quality >= 3 ? 600 : -600, height: dragOffset.height)
        }
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) {
            if currentIndex + 1 < shuffledWords.count {
                isFlipped = false
                degrees = 0.0
                currentIndex += 1
                dragOffset = .zero
            } else {
                sessionFinished = true
            }
        }
    }
    
    private func ratingColor(_ q: Int) -> Color {
        switch q {
        case 0: return .red
        case 1: return .orange
        case 2: return .yellow
        case 3: return .cyan
        case 4: return .blue
        case 5: return .green
        default: return .gray
        }
    }
    
    private func ratingLabel(_ q: Int) -> String {
        switch q {
        case 0: return "Quên"
        case 1: return "Mơ hồ"
        case 2: return "Nhắc nhớ"
        case 3: return "Nhớ chậm"
        case 4: return "Nhớ tốt"
        case 5: return "Nhớ ngay"
        default: return ""
        }
    }
    
    private func resetSession() {
        initializeDeck()
    }
}

struct CardContent: View {
    let word: Word
    let degrees: Double
    
    var levelColor: Color {
        switch word.level {
        case "A1", "A2": return Color(red: 59/255, green: 130/255, blue: 246/255)
        case "B1", "B2": return Color(red: 245/255, green: 158/255, blue: 11/255)
        case "C1", "C2": return Color(red: 168/255, green: 85/255, blue: 247/255)
        default: return .gray
        }
    }
    
    var body: some View {
        // Toggle front/back layout visibility at 90-degree rotation boundary
        let normalizedDegrees = abs(degrees).truncatingRemainder(dividingBy: 360)
        let isBackVisible = normalizedDegrees >= 90 && normalizedDegrees < 270
        
        ZStack {
            if isBackVisible {
                // Back Side
                VStack(spacing: 20) {
                    Text("Ý NGHĨA")
                        .font(.caption2)
                        .fontWeight(.black)
                        .foregroundColor(.secondary)
                        .tracking(1.5)
                    
                    Text(word.vietnameseMeaning)
                        .font(.system(.title2, design: .rounded))
                        .fontWeight(.black)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)
                    
                    Divider()
                        .padding(.horizontal)
                    
                    if !word.exampleEnglish.isEmpty {
                        VStack(spacing: 12) {
                            Text("Ví dụ:")
                                .font(.caption)
                                .fontWeight(.bold)
                                .foregroundColor(.secondary)
                            
                            Text(word.exampleEnglish)
                                .font(.body)
                                .fontWeight(.bold)
                                .italic()
                                .multilineTextAlignment(.center)
                                .padding(.horizontal)
                            
                            Text(word.exampleVietnamese)
                                .font(.caption)
                                .foregroundColor(.secondary)
                                .multilineTextAlignment(.center)
                                .padding(.horizontal)
                        }
                    }
                }
                .padding()
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .background(Color.appSecondarySystemBackground)
                .cornerRadius(30)
                .shadow(color: Color.black.opacity(0.1), radius: 10, y: 5)
                .rotation3DEffect(.degrees(180), axis: (x: 0, y: 1, z: 0))
            } else {
                // Front Side
                VStack(spacing: 24) {
                    Text("Cấp bậc \(word.level)")
                        .font(.caption2)
                        .fontWeight(.black)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 5)
                        .background(levelColor.opacity(0.12))
                        .foregroundColor(levelColor)
                        .cornerRadius(8)
                    
                    ZStack {
                        Circle()
                            .fill(levelColor.opacity(0.12))
                            .frame(width: 90, height: 90)
                        Image(systemName: word.symbolName)
                            .font(.system(size: 40))
                            .foregroundColor(levelColor)
                    }
                    
                    VStack(spacing: 8) {
                        Text(word.word)
                            .font(.system(size: 32, weight: .black, design: .rounded))
                            .multilineTextAlignment(.center)
                        
                        Text(word.ipa)
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                }
                .padding()
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .background(Color.appSecondarySystemBackground)
                .cornerRadius(30)
                .shadow(color: Color.black.opacity(0.1), radius: 10, y: 5)
            }
        }
        .rotation3DEffect(.degrees(degrees), axis: (x: 0, y: 1, z: 0))
    }
}

#Preview {
    FlashcardView(deckWords: [
        Word(word: "Acquaintance", ipa: "/əˈkweɪn.təns/", vietnameseMeaning: "Người quen", exampleEnglish: "He is not a close friend, just an acquaintance.", exampleVietnamese: "Anh ấy không phải bạn thân, chỉ là một người quen.", topic: "Family & Relationships", level: "C1", symbolName: "person.2.fill")
    ])
    .environmentObject(VocabularyStore())
}
