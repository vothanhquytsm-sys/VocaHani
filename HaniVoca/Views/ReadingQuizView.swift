import SwiftUI

struct ReadingQuizView: View {
    @EnvironmentObject var store: VocabularyStore
    @Environment(\.dismiss) var dismiss
    
    let passage: ReadingPassage
    
    @State private var currentQuestionIndex = 0
    @State private var selectedOption: String? = nil
    @State private var hasSubmitted = false
    @State private var correctAnswersCount = 0
    @State private var showResults = false
    
    var body: some View {
        VStack(spacing: 20) {
            if !showResults {
                // Progress Bar & Header
                VStack(spacing: 10) {
                    HStack {
                        Button {
                            dismiss()
                        } label: {
                            Image(systemName: "xmark")
                                .foregroundColor(.secondary)
                                .font(.title3)
                                .padding(8)
                                .background(Color.secondary.opacity(0.12))
                                .clipShape(Circle())
                        }
                        .buttonStyle(.plain)
                        
                        Spacer()
                        
                        Text("Câu hỏi \(currentQuestionIndex + 1)/\(passage.questions.count)")
                            .font(.subheadline)
                            .fontWeight(.bold)
                            .foregroundColor(.secondary)
                        
                        Spacer()
                        
                        // Placeholder to balance back button
                        Color.clear.frame(width: 32, height: 32)
                    }
                    .padding(.horizontal)
                    
                    // ProgressBar Track
                    GeometryReader { geometry in
                        ZStack(alignment: .leading) {
                            Capsule()
                                .fill(Color.secondary.opacity(0.15))
                                .frame(height: 8)
                            
                            Capsule()
                                .fill(
                                    LinearGradient(colors: [Color.purple, Color.blue], startPoint: .leading, endPoint: .trailing)
                                )
                                .frame(width: geometry.size.width * CGFloat(currentQuestionIndex + 1) / CGFloat(passage.questions.count), height: 8)
                                .animation(.spring(), value: currentQuestionIndex)
                        }
                    }
                    .frame(height: 8)
                    .padding(.horizontal)
                }
                .padding(.top)
                
                // Question Card
                let currentQuestion = passage.questions[currentQuestionIndex]
                
                VStack(alignment: .leading, spacing: 20) {
                    Text(currentQuestion.questionText)
                        .font(.system(.title3, design: .rounded))
                        .fontWeight(.black)
                        .foregroundColor(.primary)
                        .lineSpacing(6)
                        .padding()
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(Color.appSecondarySystemBackground.opacity(0.4))
                        .cornerRadius(20)
                    
                    // Option Choices List
                    VStack(spacing: 12) {
                        ForEach(currentQuestion.options, id: \.self) { option in
                            Button {
                                if !hasSubmitted {
                                    selectedOption = option
                                }
                            } label: {
                                HStack {
                                    Text(option)
                                        .font(.body)
                                        .fontWeight(.semibold)
                                        .foregroundColor(textColor(for: option))
                                    
                                    Spacer()
                                    
                                    if hasSubmitted {
                                        if option == currentQuestion.correctOption {
                                            Image(systemName: "checkmark.circle.fill")
                                                .foregroundColor(Color.emeraldColor)
                                                .font(.title3)
                                        } else if selectedOption == option {
                                            Image(systemName: "xmark.circle.fill")
                                                .foregroundColor(.red)
                                                .font(.title3)
                                        }
                                    } else {
                                        Circle()
                                            .stroke(selectedOption == option ? Color.accentColor : Color.secondary.opacity(0.3), lineWidth: 2)
                                            .frame(width: 22, height: 22)
                                            .overlay(
                                                Circle()
                                                    .fill(selectedOption == option ? Color.accentColor : Color.clear)
                                                    .frame(width: 12, height: 12)
                                            )
                                    }
                                }
                                .padding(.horizontal, 20)
                                .padding(.vertical, 16)
                                .background(
                                    RoundedRectangle(cornerRadius: 16)
                                        .fill(backgroundColor(for: option))
                                )
                                .overlay(
                                    RoundedRectangle(cornerRadius: 16)
                                        .stroke(borderColor(for: option), lineWidth: 2)
                                )
                                .shadow(color: Color.black.opacity(0.02), radius: 5, y: 2)
                            }
                            .buttonStyle(.plain)
                            .disabled(hasSubmitted)
                        }
                    }
                }
                .padding()
                
                Spacer()
                
                // Submit & Next Controls
                VStack {
                    if !hasSubmitted {
                        Button {
                            submitAnswer(currentQuestion)
                        } label: {
                            Text("Kiểm tra")
                                .font(.headline)
                                .fontWeight(.bold)
                                .foregroundColor(.white)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 16)
                                .background(selectedOption == nil ? Color.gray : Color.accentColor)
                                .cornerRadius(16)
                                .shadow(color: (selectedOption == nil ? Color.clear : Color.accentColor).opacity(0.3), radius: 8, y: 4)
                        }
                        .buttonStyle(.plain)
                        .disabled(selectedOption == nil)
                        .padding()
                    } else {
                        Button {
                            nextQuestion()
                        } label: {
                            Text(currentQuestionIndex == passage.questions.count - 1 ? "Xem kết quả" : "Tiếp tục")
                                .font(.headline)
                                .fontWeight(.bold)
                                .foregroundColor(.white)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 16)
                                .background(Color.emeraldColor)
                                .cornerRadius(16)
                                .shadow(color: Color.emeraldColor.opacity(0.3), radius: 8, y: 4)
                        }
                        .buttonStyle(.plain)
                        .padding()
                    }
                }
            } else {
                // Results Screen
                VStack(spacing: 24) {
                    Spacer()
                    
                    ZStack {
                        Circle()
                            .fill(
                                LinearGradient(colors: correctAnswersCount >= 3 ? [Color.emeraldColor.opacity(0.12), Color.blue.opacity(0.12)] : [Color.orange.opacity(0.12), Color.red.opacity(0.12)],
                                               startPoint: .topLeading, endPoint: .bottomTrailing)
                            )
                            .frame(width: 180, height: 180)
                        
                        VStack(spacing: 8) {
                            Image(systemName: correctAnswersCount == passage.questions.count ? "crown.fill" : "checkmark.seal.fill")
                                .font(.system(size: 48))
                                .foregroundColor(correctAnswersCount >= 3 ? Color.emeraldColor : .orange)
                            
                            Text("\(correctAnswersCount)/\(passage.questions.count)")
                                .font(.system(size: 38, weight: .black, design: .rounded))
                                .foregroundColor(.primary)
                        }
                    }
                    
                    VStack(spacing: 12) {
                        Text(correctAnswersCount == passage.questions.count ? "Tuyệt hảo! 🎉" : (correctAnswersCount >= 3 ? "Khá tốt! 👍" : "Cần cố gắng thêm! 💪"))
                            .font(.title2)
                            .fontWeight(.black)
                        
                        Text("Bạn đã hoàn thành bài kiểm tra đọc vựng cho bài viết: \"\(passage.title)\".")
                            .font(.body)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 32)
                    }
                    
                    Spacer()
                    
                    Button {
                        dismiss()
                    } label: {
                        Text("Hoàn tất")
                            .font(.headline)
                            .fontWeight(.bold)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            .background(
                                LinearGradient(colors: [Color.purple, Color.blue], startPoint: .leading, endPoint: .trailing)
                            )
                            .cornerRadius(16)
                            .shadow(color: Color.purple.opacity(0.3), radius: 10, y: 5)
                    }
                    .buttonStyle(.plain)
                    .padding()
                }
            }
        }
        #if os(iOS)
        .navigationBarHidden(true)
        #endif
    }
    
    // MARK: - Answer Eval Helpers
    private func submitAnswer(_ question: ReadingQuestion) {
        hasSubmitted = true
        if selectedOption == question.correctOption {
            correctAnswersCount += 1
        }
    }
    
    private func nextQuestion() {
        if currentQuestionIndex < passage.questions.count - 1 {
            currentQuestionIndex += 1
            selectedOption = nil
            hasSubmitted = false
        } else {
            // Save results on completion
            store.saveReadingScore(passageId: passage.id, score: correctAnswersCount)
            showResults = true
        }
    }
    
    private func backgroundColor(for option: String) -> Color {
        guard hasSubmitted else {
            return selectedOption == option ? Color.accentColor.opacity(0.08) : Color.appSecondarySystemBackground.opacity(0.3)
        }
        
        let currentQuestion = passage.questions[currentQuestionIndex]
        if option == currentQuestion.correctOption {
            return Color.emeraldColor.opacity(0.12)
        }
        if selectedOption == option {
            return Color.red.opacity(0.1)
        }
        return Color.appSecondarySystemBackground.opacity(0.3)
    }
    
    private func borderColor(for option: String) -> Color {
        guard hasSubmitted else {
            return selectedOption == option ? Color.accentColor : Color.clear
        }
        
        let currentQuestion = passage.questions[currentQuestionIndex]
        if option == currentQuestion.correctOption {
            return Color.emeraldColor
        }
        if selectedOption == option {
            return Color.red
        }
        return Color.clear
    }
    
    private func textColor(for option: String) -> Color {
        guard hasSubmitted else {
            return selectedOption == option ? Color.accentColor : .primary
        }
        
        let currentQuestion = passage.questions[currentQuestionIndex]
        if option == currentQuestion.correctOption {
            return Color.emeraldColor
        }
        if selectedOption == option {
            return Color.red
        }
        return .primary
    }
}
