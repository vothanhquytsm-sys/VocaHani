import SwiftUI

struct WordDetailView: View {
    @EnvironmentObject var store: VocabularyStore
    let wordsList: [Word]
    let lessonIndex: Int?
    @State private var currentIndex: Int
    
    @StateObject private var synthesizer = SpeechSynthesizer()
    @StateObject private var speechRecognizer = SpeechRecognizerManager()
    
    init(word: Word) {
        self.wordsList = [word]
        self.lessonIndex = nil
        self._currentIndex = State(initialValue: 0)
    }
    
    init(words: [Word], currentIndex: Int, lessonIndex: Int? = nil) {
        self.wordsList = words
        self.lessonIndex = lessonIndex
        self._currentIndex = State(initialValue: currentIndex)
    }
    
    var activeWord: Word {
        guard currentIndex >= 0 && currentIndex < wordsList.count else {
            return wordsList.first ?? Word(word: "", vietnameseMeaning: "")
        }
        let word = wordsList[currentIndex]
        return store.words.first(where: { $0.id == word.id }) ?? word
    }
    
    var allWordsLearned: Bool {
        guard let lessonIdx = lessonIndex else { return false }
        let topicWords = store.words.filter { $0.topic == activeWord.topic }
        let startIndex = lessonIdx * 10
        let endIndex = min(startIndex + 10, topicWords.count)
        guard startIndex < topicWords.count else { return false }
        let lessonWords = Array(topicWords[startIndex..<endIndex])
        
        return !lessonWords.isEmpty && lessonWords.allSatisfy { w in
            store.words.first(where: { $0.id == w.id })?.isLearned == true
        }
    }
    
    var levelColor: Color {
        switch activeWord.level {
        case "A1", "A2": return Color(red: 59/255, green: 130/255, blue: 246/255)
        case "B1", "B2": return Color(red: 245/255, green: 158/255, blue: 11/255)
        case "C1", "C2": return Color(red: 168/255, green: 85/255, blue: 247/255)
        default: return .gray
        }
    }
    
    var levelGradients: [Color] {
        switch activeWord.level {
        case "A1", "A2":
            return [Color(red: 59/255, green: 130/255, blue: 246/255), Color(red: 6/255, green: 182/255, blue: 212/255)]
        case "B1", "B2":
            return [Color(red: 245/255, green: 158/255, blue: 11/255), Color(red: 234/255, green: 179/255, blue: 8/255)]
        case "C1", "C2":
            return [Color(red: 168/255, green: 85/255, blue: 247/255), Color(red: 236/255, green: 72/255, blue: 153/255)]
        default:
            return [.gray, .secondary]
        }
    }
    
    var body: some View {
        ScrollView {
            VStack(spacing: 28) {
                // Card View Container (Frosted glass overlay feel)
                VStack(spacing: 0) {
                    // Level Badge & Favorite Header
                    HStack {
                        Text("Cấp bậc \(activeWord.level)")
                            .font(.system(.caption, design: .rounded))
                            .fontWeight(.black)
                            .padding(.horizontal, 14)
                            .padding(.vertical, 8)
                            .background(levelColor.opacity(0.12))
                            .foregroundColor(levelColor)
                            .cornerRadius(10)
                        
                        Spacer()
                        
                        Button {
                            store.toggleFavorite(for: activeWord)
                        } label: {
                            Image(systemName: activeWord.isFavorite ? "heart.fill" : "heart")
                                .foregroundColor(.red)
                                .font(.title3)
                                .padding(10)
                                .background(Color.red.opacity(0.08))
                                .clipShape(Circle())
                        }
                        .buttonStyle(.plain)
                    }
                    .padding()
                    
                    // Simple Native Illustration (SF Symbol in a large glowing sphere)
                    ZStack {
                        Circle()
                            .fill(
                                LinearGradient(colors: levelGradients.map { $0.opacity(0.25) },
                                               startPoint: .topLeading, endPoint: .bottomTrailing)
                            )
                            .frame(width: 150, height: 150)
                            .shadow(color: levelColor.opacity(0.3), radius: 18, x: 0, y: 8)
                        
                        Circle()
                            .fill(
                                LinearGradient(colors: levelGradients, startPoint: .topLeading, endPoint: .bottomTrailing)
                            )
                            .frame(width: 120, height: 120)
                            .shadow(color: levelColor.opacity(0.4), radius: 12, x: 0, y: 4)
                        
                        Image(systemName: activeWord.symbolName)
                            .font(.system(size: 52))
                            .foregroundColor(.white)
                    }
                    .padding(.bottom, 28)
                    
                    // Word and IPA Phonetics
                    VStack(spacing: 12) {
                        Text(activeWord.word)
                            .font(.system(size: 44, weight: .black, design: .rounded))
                            .multilineTextAlignment(.center)
                            .padding(.horizontal)
                        
                        HStack(spacing: 14) {
                            Text(activeWord.ipa)
                                .font(.title3)
                                .fontWeight(.medium)
                                .foregroundColor(.secondary)
                            
                            // Audio Button
                            Button {
                                synthesizer.speak(activeWord.word)
                            } label: {
                                Image(systemName: synthesizer.isSpeaking ? "speaker.wave.3.fill" : "speaker.wave.2.fill")
                                    .foregroundColor(.white)
                                    .font(.body)
                                    .padding(12)
                                    .background(
                                        LinearGradient(colors: levelGradients, startPoint: .top, endPoint: .bottom)
                                    )
                                    .clipShape(Circle())
                                    .shadow(color: levelColor.opacity(0.35), radius: 8, y: 4)
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .padding(.bottom, 24)
                    
                    Divider()
                        .padding(.horizontal)
                    
                    // Vietnamese Translation
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Ý NGHĨA TIẾNG VIỆT")
                            .font(.caption2)
                            .fontWeight(.black)
                            .foregroundColor(.secondary)
                            .tracking(1.2)
                        
                        Text(activeWord.vietnameseMeaning)
                            .font(.system(.title3, design: .rounded))
                            .fontWeight(.black)
                            .foregroundColor(.primary)
                            .frame(maxWidth: .infinity, alignment: .leading)
                    }
                    .padding(20)
                    
                    Divider()
                        .padding(.horizontal)
                    
                    // Examples Section
                    VStack(alignment: .leading, spacing: 18) {
                        HStack {
                            Text("VÍ DỤ MINH HỌA")
                                .font(.caption2)
                                .fontWeight(.black)
                                .foregroundColor(.secondary)
                                .tracking(1.2)
                            
                            Spacer()
                            
                            // Read example sentence button
                            Button {
                                synthesizer.speak(activeWord.exampleEnglish)
                            } label: {
                                Label("Đọc ví dụ", systemImage: "play.circle.fill")
                                    .font(.caption)
                                    .fontWeight(.bold)
                                    .foregroundColor(levelColor)
                            }
                            .buttonStyle(.plain)
                            .disabled(activeWord.exampleEnglish.isEmpty)
                        }
                        
                        VStack(alignment: .leading, spacing: 12) {
                            // English Sentence
                            HStack(alignment: .top, spacing: 8) {
                                Image(systemName: "quote.opening")
                                    .font(.caption)
                                    .foregroundColor(levelColor)
                                
                                Text(activeWord.exampleEnglish)
                                    .font(.body)
                                    .fontWeight(.bold)
                                    .italic()
                                    .lineSpacing(4)
                            }
                            
                            // Vietnamese Translation
                            Text(activeWord.exampleVietnamese)
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                                .padding(.leading, 20)
                        }
                    }
                    .padding(20)
                    
                    // Pronunciation Practice Section
                    if lessonIndex != nil {
                        Divider()
                            .padding(.horizontal)
                        
                        VStack(alignment: .leading, spacing: 14) {
                            Text("LUYỆN PHÁT ÂM")
                                .font(.caption2)
                                .fontWeight(.black)
                                .foregroundColor(.secondary)
                                .tracking(1.2)
                            
                            HStack(spacing: 16) {
                                // Microphone/Record Button
                                Button {
                                    if speechRecognizer.isRecording {
                                        speechRecognizer.stopRecording(targetWord: activeWord.word)
                                    } else {
                                        if !speechRecognizer.permissionGranted {
                                            speechRecognizer.requestPermissions()
                                        } else {
                                            speechRecognizer.startRecording(targetWord: activeWord.word)
                                        }
                                    }
                                } label: {
                                    HStack {
                                        Image(systemName: speechRecognizer.isRecording ? "stop.circle.fill" : "mic.circle.fill")
                                            .font(.system(size: 28))
                                            .foregroundColor(speechRecognizer.isRecording ? .red : levelColor)
                                        
                                        Text(speechRecognizer.isRecording ? "Đang ghi âm... Nhấn để dừng" : "Nhấn để bắt đầu nói")
                                            .font(.subheadline)
                                            .fontWeight(.bold)
                                            .foregroundColor(speechRecognizer.isRecording ? .red : .primary)
                                    }
                                    .padding(.horizontal, 16)
                                    .padding(.vertical, 12)
                                    .background(
                                        Capsule()
                                            .stroke(speechRecognizer.isRecording ? Color.red : levelColor.opacity(0.5), lineWidth: 1.5)
                                    )
                                }
                                .buttonStyle(.plain)
                                
                                Spacer()
                            }
                            
                            if speechRecognizer.isRecording {
                                HStack(spacing: 8) {
                                    Circle()
                                        .fill(Color.red)
                                        .frame(width: 8, height: 8)
                                        .scaleEffect(speechRecognizer.isRecording ? 1.4 : 1.0)
                                        .animation(.easeInOut(duration: 0.6).repeatForever(autoreverses: true), value: speechRecognizer.isRecording)
                                    
                                    Text("Đang nhận diện giọng nói...")
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                }
                                .transition(.opacity)
                            }
                            
                            if let score = speechRecognizer.pronunciationScore {
                                VStack(alignment: .leading, spacing: 8) {
                                    HStack(spacing: 8) {
                                        Text("Điểm phát âm:")
                                            .fontWeight(.bold)
                                            .foregroundColor(.secondary)
                                        
                                        Text("\(score)/100")
                                            .font(.title3)
                                            .fontWeight(.black)
                                            .foregroundColor(score >= 90 ? Color.emeraldColor : (score >= 70 ? .orange : .red))
                                    }
                                    
                                    if !speechRecognizer.recognizedWords.isEmpty {
                                        Text("Từ bạn đọc: \"\(speechRecognizer.recognizedWords)\"")
                                            .font(.caption)
                                            .foregroundColor(.secondary)
                                    }
                                    
                                    Text(speechRecognizer.feedbackMessage)
                                        .font(.subheadline)
                                        .fontWeight(.bold)
                                        .foregroundColor(score >= 90 ? Color.emeraldColor : (score >= 70 ? .orange : .red))
                                }
                                .padding()
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .background(
                                    RoundedRectangle(cornerRadius: 16)
                                        .fill((score >= 90 ? Color.emeraldColor : (score >= 70 ? Color.orange : Color.red)).opacity(0.08))
                                )
                                .transition(.opacity.combined(with: .scale))
                            }
                        }
                        .padding(20)
                    }
                }
                .background(Color.appSecondarySystemBackground.opacity(0.65))
                .cornerRadius(32)
                .shadow(color: Color.black.opacity(0.06), radius: 18, x: 0, y: 8)
                
                if (currentIndex == wordsList.count - 1 || allWordsLearned), let lessonIdx = lessonIndex {
                    NavigationLink(destination: TestView(topicName: activeWord.topic, lessonIndex: lessonIdx, lessonWords: wordsList)) {
                        HStack(spacing: 8) {
                            Image(systemName: "checkmark.seal.fill")
                                .font(.title3)
                            Text("Bắt đầu bài kiểm tra (\(wordsList.count) câu)")
                                .fontWeight(.black)
                        }
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 16)
                        .background(
                            LinearGradient(colors: [Color.purple, Color(red: 168/255, green: 85/255, blue: 247/255)],
                                           startPoint: .leading, endPoint: .trailing)
                        )
                        .cornerRadius(16)
                        .shadow(color: Color.purple.opacity(0.35), radius: 8, y: 4)
                    }
                    .buttonStyle(.plain)
                    .transition(.move(edge: .bottom).combined(with: .opacity))
                }
                
                // Done Learning & Spaced Navigation Button Group
                HStack(spacing: 16) {
                    // Previous Word Button
                    Button {
                        if currentIndex > 0 {
                            withAnimation(.easeInOut) {
                                currentIndex -= 1
                            }
                        }
                    } label: {
                        Image(systemName: "chevron.left")
                            .font(.title3)
                            .fontWeight(.black)
                            .foregroundColor(.accentColor)
                            .frame(width: 56, height: 56)
                            .background(Color.accentColor.opacity(0.08))
                            .cornerRadius(16)
                    }
                    .buttonStyle(.plain)
                    .disabled(currentIndex == 0)
                    .opacity(currentIndex == 0 ? 0.3 : 1.0)
                    
                    // Done Learning Toggle Button
                    Button {
                        store.toggleLearned(for: activeWord)
                        
                        // Automatically advance to the next word if marked as learned and there is a next word
                        if !activeWord.isLearned && currentIndex + 1 < wordsList.count {
                            DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                                withAnimation(.easeInOut) {
                                    currentIndex += 1
                                }
                            }
                        }
                    } label: {
                        HStack(spacing: 8) {
                            Image(systemName: activeWord.isLearned ? "checkmark.circle.fill" : "circle")
                                .font(.title3)
                            Text(activeWord.isLearned ? "Đã học xong" : "Đánh dấu là đã học")
                                .fontWeight(.black)
                        }
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .frame(height: 56)
                        .background(
                            LinearGradient(colors: activeWord.isLearned ? [Color.emeraldColor, Color(red: 34/255, green: 197/255, blue: 94/255)] : levelGradients,
                                           startPoint: .leading, endPoint: .trailing)
                        )
                        .cornerRadius(16)
                        .shadow(color: (activeWord.isLearned ? Color.emeraldColor : levelColor).opacity(0.35), radius: 10, y: 5)
                    }
                    .buttonStyle(.plain)
                    
                    // Next Word Button
                    Button {
                        if currentIndex + 1 < wordsList.count {
                            withAnimation(.easeInOut) {
                                currentIndex += 1
                            }
                        }
                    } label: {
                        Image(systemName: "chevron.right")
                            .font(.title3)
                            .fontWeight(.black)
                            .foregroundColor(.accentColor)
                            .frame(width: 56, height: 56)
                            .background(Color.accentColor.opacity(0.08))
                            .cornerRadius(16)
                    }
                    .buttonStyle(.plain)
                    .disabled(currentIndex + 1 >= wordsList.count)
                    .opacity(currentIndex + 1 >= wordsList.count ? 0.3 : 1.0)
                }
            }
            .padding()
        }
        .navigationTitle(activeWord.word)
        #if os(iOS)
        .navigationBarTitleDisplayMode(.inline)
        #endif
        .onDisappear {
            synthesizer.stop()
            speechRecognizer.stopRecording(targetWord: "")
        }
        .onChange(of: currentIndex) { oldValue, newValue in
            speechRecognizer.stopRecording(targetWord: "")
            speechRecognizer.pronunciationScore = nil
            speechRecognizer.recognizedWords = ""
            speechRecognizer.feedbackMessage = ""
        }
    }
}

#Preview {
    NavigationStack {
        WordDetailView(word: Word(
            word: "Breathtaking",
            ipa: "/ˈbreθˌteɪ.kɪŋ/",
            vietnameseMeaning: "Đẹp đến ngạt thở, ngoạn mục",
            exampleEnglish: "The view from the top of the mountain was breathtaking.",
            exampleVietnamese: "Tầm nhìn từ trên đỉnh núi đẹp đến ngạt thở.",
            topic: "Travel & Tourism",
            level: "C1",
            symbolName: "mountain.2.fill",
            isCustom: false
        ))
        .environmentObject(VocabularyStore())
    }
}
