import SwiftUI

enum QuestionType {
    case englishToVietnamese
    case vietnameseToEnglish
    case listening
}

struct QuizQuestion: Identifiable {
    let id = UUID()
    let type: QuestionType
    let word: Word
    let questionText: String
    let correctOption: String
    let options: [String]
    let hintText: String
}

struct TestView: View {
    @EnvironmentObject var store: VocabularyStore
    @Environment(\.dismiss) var dismiss
    
    let topicName: String
    let lessonIndex: Int
    let lessonWords: [Word]
    
    @State private var questions: [QuizQuestion] = []
    @State private var currentQuestionIndex = 0
    @State private var selectedOption: String? = nil
    @State private var isAnswered = false
    @State private var score = 0
    @State private var testFinished = false
    @State private var showAlert = false
    
    @State private var typedAnswer = ""
    @State private var isChecked = false
    @State private var isAnswerCorrect = false
    
    @StateObject private var synthesizer = SpeechSynthesizer()
    
    var body: some View {
        ZStack {
            Color.appSystemBackground
                .ignoresSafeArea()
            
            if testFinished {
                // Quiz Finish Screen
                VStack(spacing: 30) {
                    Spacer()
                    
                    let isPerfect = score == questions.count
                    
                    ZStack {
                        Circle()
                            .fill((isPerfect ? Color.emeraldColor : Color.red).opacity(0.12))
                            .frame(width: 150, height: 150)
                        
                        Image(systemName: isPerfect ? "checkmark.seal.fill" : "xmark.shield.fill")
                            .font(.system(size: 72))
                            .foregroundColor(isPerfect ? Color.emeraldColor : Color.red)
                            .shadow(color: (isPerfect ? Color.emeraldColor : Color.red).opacity(0.3), radius: 8)
                    }
                    
                    VStack(spacing: 8) {
                        Text(isPerfect ? "Chúc mừng!" : "Chưa đạt yêu cầu")
                            .font(.system(.title, design: .rounded))
                            .fontWeight(.black)
                        
                        Text(isPerfect ? "Bạn đã thuộc lòng bài học này!" : "Bạn cần trả lời đúng \(questions.count)/\(questions.count) để mở khóa bài học tiếp theo.")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 32)
                            .lineSpacing(4)
                    }
                    
                    // Score pill
                    Text("Điểm số: \(score) / \(questions.count)")
                        .font(.system(.title3, design: .monospaced))
                        .fontWeight(.black)
                        .padding(.horizontal, 24)
                        .padding(.vertical, 12)
                        .background(Color.appSecondarySystemBackground)
                        .cornerRadius(16)
                    
                    Spacer()
                    
                    VStack(spacing: 16) {
                        if isPerfect {
                            Button {
                                dismiss()
                            } label: {
                                Text("Hoàn thành & Mở bài mới")
                                    .font(.headline)
                                    .fontWeight(.black)
                                    .foregroundColor(.white)
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 16)
                                    .background(Color.emeraldColor)
                                    .cornerRadius(16)
                                    .shadow(color: Color.emeraldColor.opacity(0.3), radius: 8, y: 4)
                            }
                            .buttonStyle(.plain)
                        } else {
                            Button {
                                restartTest()
                            } label: {
                                Text("Làm lại bài kiểm tra")
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
                                Text("Quay lại tự học thêm")
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
                    }
                    .padding(.horizontal, 32)
                    .padding(.bottom, 40)
                }
            } else if !questions.isEmpty {
                // Interactive Question Screen
                let currentQuestion = questions[currentQuestionIndex]
                
                VStack(spacing: 24) {
                    // Quiz Progress Header
                    HStack {
                        ProgressView(value: Double(currentQuestionIndex + 1), total: Double(questions.count))
                            .progressViewStyle(.linear)
                            .tint(Color.accentColor)
                        
                        Text("\(currentQuestionIndex + 1) / \(questions.count)")
                            .font(.system(.subheadline, design: .monospaced))
                            .fontWeight(.black)
                            .foregroundColor(.secondary)
                            .padding(.leading, 12)
                    }
                    .padding(.horizontal)
                    .padding(.top)
                    
                    // Question Card
                    VStack(spacing: 24) {
                        Text("CÂU HỎI KIỂM TRA")
                            .font(.caption2)
                            .fontWeight(.black)
                            .foregroundColor(.secondary)
                            .tracking(1.5)
                        
                        if currentQuestion.type == .listening {
                            VStack(spacing: 16) {
                                Button {
                                    playQuestionAudio(for: currentQuestion.word.word)
                                } label: {
                                    ZStack {
                                        Circle()
                                            .fill(Color.accentColor.opacity(0.12))
                                            .frame(width: 80, height: 80)
                                        Image(systemName: "speaker.wave.3.fill")
                                            .font(.title)
                                            .foregroundColor(.accentColor)
                                    }
                                }
                                .buttonStyle(.plain)
                                
                                Text("Nghe từ và chọn nghĩa đúng")
                                    .font(.headline)
                                    .foregroundColor(.secondary)
                            }
                            .padding(.vertical, 12)
                        } else {
                            Text(currentQuestion.questionText)
                                .font(.system(size: 28, weight: .black, design: .rounded))
                                .multilineTextAlignment(.center)
                                .padding(.horizontal)
                                .frame(height: 100)
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 28)
                    .background(Color.appSecondarySystemBackground.opacity(0.6))
                    .cornerRadius(28)
                    .padding(.horizontal)
                    
                    // Spelling Input Field & Hint
                    VStack(spacing: 20) {
                        if !currentQuestion.hintText.isEmpty {
                            Text("Gợi ý: \(currentQuestion.hintText)")
                                .font(.subheadline)
                                .fontWeight(.bold)
                                .foregroundColor(.secondary)
                                .multilineTextAlignment(.center)
                                .padding(.horizontal)
                        }
                        
                        TextField("Nhập từ tiếng Anh...", text: $typedAnswer)
                            .textFieldStyle(.plain)
                            .font(.system(.title3, design: .rounded))
                            .fontWeight(.bold)
                            .padding(.horizontal, 20)
                            .padding(.vertical, 16)
                            .background(Color.appSecondarySystemBackground)
                            .cornerRadius(16)
                            .overlay(
                                RoundedRectangle(cornerRadius: 16)
                                    .stroke(isChecked ? (isAnswerCorrect ? Color.emeraldColor : Color.red) : Color.accentColor.opacity(0.3), lineWidth: 2)
                            )
                            .disabled(isChecked)
                            .autocorrectionDisabled()
                            #if os(iOS)
                            .textInputAutocapitalization(.never)
                            #endif
                            .onSubmit {
                                if !typedAnswer.isEmpty && !isChecked {
                                    checkSpelling()
                                }
                            }
                        
                        if isChecked {
                            // Feedback View
                            HStack(spacing: 12) {
                                Image(systemName: isAnswerCorrect ? "checkmark.circle.fill" : "xmark.circle.fill")
                                    .font(.title2)
                                    .foregroundColor(isAnswerCorrect ? .green : .red)
                                
                                VStack(alignment: .leading, spacing: 4) {
                                    Text(isAnswerCorrect ? "Chính xác! 🎉" : "Chưa chính xác")
                                        .fontWeight(.bold)
                                        .foregroundColor(isAnswerCorrect ? .green : .red)
                                    
                                    if !isAnswerCorrect {
                                        Text("Đáp án đúng: \(currentQuestion.correctOption)")
                                            .font(.subheadline)
                                            .foregroundColor(.secondary)
                                    }
                                }
                                Spacer()
                            }
                            .padding()
                            .background((isAnswerCorrect ? Color.emeraldColor : Color.red).opacity(0.08))
                            .cornerRadius(16)
                            .transition(.opacity.combined(with: .scale))
                        } else {
                            // Submit Button
                            Button {
                                checkSpelling()
                            } label: {
                                Text("Kiểm tra đáp án")
                                    .font(.headline)
                                    .fontWeight(.black)
                                    .foregroundColor(.white)
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 16)
                                    .background(typedAnswer.isEmpty ? Color.gray : Color.accentColor)
                                    .cornerRadius(16)
                                    .shadow(color: typedAnswer.isEmpty ? Color.clear : Color.accentColor.opacity(0.35), radius: 8, y: 4)
                            }
                            .buttonStyle(.plain)
                            .disabled(typedAnswer.isEmpty)
                        }
                    }
                    .padding(.horizontal)
                    
                    Spacer()
                    
                    // Next Question Button
                    if isAnswered {
                        Button {
                            goToNextQuestion()
                        } label: {
                            Text(currentQuestionIndex + 1 == questions.count ? "Xem kết quả" : "Câu tiếp theo")
                                .font(.headline)
                                .fontWeight(.black)
                                .foregroundColor(.white)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 16)
                                .background(Color.accentColor)
                                .cornerRadius(16)
                                .shadow(color: Color.accentColor.opacity(0.35), radius: 8, y: 4)
                        }
                        .padding(.horizontal, 32)
                        .padding(.bottom, 24)
                        .transition(.move(edge: .bottom).combined(with: .opacity))
                    }
                }
            } else {
                ProgressView("Đang thiết lập câu hỏi...")
                    .onAppear {
                        generateQuestions()
                    }
            }
        }
        .navigationTitle("Kiểm tra mở khóa")
        #if os(iOS)
        .navigationBarTitleDisplayMode(.inline)
        #endif
        .alert(isPresented: $showAlert) {
            Alert(
                title: Text("Bạn muốn thoát?"),
                message: Text("Tiến trình kiểm tra hiện tại sẽ không được lưu."),
                primaryButton: .destructive(Text("Thoát")) {
                    dismiss()
                },
                secondaryButton: .cancel(Text("Tiếp tục"))
            )
        }
        .onDisappear {
            synthesizer.stop()
        }
    }
    
    // MARK: - Options Styling Helper
    private func optionBackground(for option: String, question: QuizQuestion) -> Color {
        if isAnswered {
            if option == question.correctOption {
                return Color.emeraldColor.opacity(0.15)
            } else if option == selectedOption {
                return Color.red.opacity(0.15)
            }
            return Color.appSecondarySystemBackground
        } else {
            return selectedOption == option ? Color.accentColor.opacity(0.12) : Color.appSecondarySystemBackground
        }
    }
    
    private func optionForegroundColor(for option: String, question: QuizQuestion) -> Color {
        if isAnswered {
            if option == question.correctOption || option == selectedOption {
                return .white
            }
            return .secondary
        } else {
            return selectedOption == option ? Color.accentColor : .primary
        }
    }
    
    private func optionBorderColor(for option: String) -> Color {
        if !isAnswered && selectedOption == option {
            return Color.accentColor
        }
        return Color.clear
    }
    
    // MARK: - Actions & Game Logic
    private func generateQuestions() {
        var generated: [QuizQuestion] = []
        
        for (idx, word) in lessonWords.enumerated() {
            // Mix: even indexes get direct translation spelling, odd indexes get context blank fill-in spelling
            if idx % 2 == 0 {
                let type1 = QuestionType.vietnameseToEnglish
                let questionText1 = "Viết từ tiếng Anh có nghĩa là: \"\(word.vietnameseMeaning)\""
                let correctOption1 = word.word
                let hintText1 = word.ipa
                
                generated.append(QuizQuestion(
                    type: type1,
                    word: word,
                    questionText: questionText1,
                    correctOption: correctOption1,
                    options: [],
                    hintText: hintText1
                ))
            } else {
                let type2 = QuestionType.vietnameseToEnglish
                let blanked = makeBlankedExample(for: word)
                let questionText2 = blanked.isEmpty ? "Viết từ tiếng Anh: \"\(word.vietnameseMeaning)\"" : "Điền vào chỗ trống:\n\(blanked)"
                let correctOption2 = word.word
                let hintText2 = blanked.isEmpty ? word.ipa : "Nghĩa: \(word.vietnameseMeaning)"
                
                generated.append(QuizQuestion(
                    type: type2,
                    word: word,
                    questionText: questionText2,
                    correctOption: correctOption2,
                    options: [],
                    hintText: hintText2
                ))
            }
        }
        
        // Randomize questions sequence
        self.questions = generated.shuffled()
    }
    
    private func playQuestionAudio(for wordText: String) {
        synthesizer.speak(wordText)
    }
    
    private func makeBlankedExample(for word: Word) -> String {
        guard !word.exampleEnglish.isEmpty else { return "" }
        let pattern = "\\b" + NSRegularExpression.escapedPattern(for: word.word) + "\\b"
        do {
            let regex = try NSRegularExpression(pattern: pattern, options: .caseInsensitive)
            let range = NSRange(location: 0, length: word.exampleEnglish.utf16.count)
            let result = regex.stringByReplacingMatches(in: word.exampleEnglish, options: [], range: range, withTemplate: "_______")
            
            if result == word.exampleEnglish {
                let lowerSentence = word.exampleEnglish.lowercased()
                let lowerWord = word.word.lowercased()
                if let wordRange = lowerSentence.range(of: lowerWord) {
                    var finalSentence = word.exampleEnglish
                    let nsRange = NSRange(wordRange, in: lowerSentence)
                    if let stringRange = Range(nsRange, in: finalSentence) {
                        finalSentence.replaceSubrange(stringRange, with: "_______")
                        return finalSentence
                    }
                }
                return "Ví dụ: \(word.exampleEnglish)\n(Viết lại từ: \(word.word.replacingOccurrences(of: ".", with: "")))"
            }
            return result
        } catch {
            return word.exampleEnglish.replacingOccurrences(of: word.word, with: "_______", options: .caseInsensitive)
        }
    }
    
    private func checkSpelling() {
        let currentQuestion = questions[currentQuestionIndex]
        let cleanTyped = typedAnswer.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        let cleanCorrect = currentQuestion.correctOption.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        
        isAnswerCorrect = (cleanTyped == cleanCorrect)
        if isAnswerCorrect {
            score += 1
        }
        
        isChecked = true
        isAnswered = true
        
        // Speak the correct word pronunciation to reinforce auditory learning
        synthesizer.speak(currentQuestion.correctOption)
    }
    
    private func goToNextQuestion() {
        if currentQuestionIndex + 1 < questions.count {
            typedAnswer = ""
            isChecked = false
            isAnswerCorrect = false
            isAnswered = false
            currentQuestionIndex += 1
        } else {
            // Check if score is perfect to pass the lesson
            if score == questions.count {
                store.passLesson(topic: topicName, index: lessonIndex)
            }
            testFinished = true
        }
    }
    
    private func restartTest() {
        currentQuestionIndex = 0
        typedAnswer = ""
        isChecked = false
        isAnswerCorrect = false
        isAnswered = false
        score = 0
        testFinished = false
        generateQuestions()
    }
}
