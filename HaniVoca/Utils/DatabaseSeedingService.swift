import Foundation
import SwiftData

struct BuiltInWord: Codable {
    let id: String
    let word: String
    let ipa: String
    let vietnameseMeaning: String
    let exampleEnglish: String
    let exampleVietnamese: String
    let topic: String
    let level: String
    let symbolName: String
}

struct BuiltInPhrase: Codable {
    let id: String
    let english: String
    let vietnamese: String
    let category: String
    let contextNote: String?
}

@MainActor
class DatabaseSeedingService {
    static func seedIfNeeded(modelContext: ModelContext) {
        do {
            // 1. Check if seeding is already complete
            let topicDescriptor = FetchDescriptor<Topic>()
            let topicCount = try modelContext.fetchCount(topicDescriptor)
            
            if topicCount > 0 {
                print("Database already seeded. Skipping seeding.")
                return
            }
            
            print("Starting Database Seeding...")
            
            // 2. Load & Seed Words
            if let wordsURL = Bundle.main.url(forResource: "words", withExtension: "json") {
                let data = try Data(contentsOf: wordsURL)
                let builtInWords = try JSONDecoder().decode([BuiltInWord].self, from: data)
                
                // Group words by topic name
                let groupedWords = Dictionary(grouping: builtInWords, by: { $0.topic })
                
                var topicIndex = 0
                for (topicName, words) in groupedWords.sorted(by: { $0.key < $1.key }) {
                    let topic = Topic(name: topicName, orderIndex: topicIndex)
                    modelContext.insert(topic)
                    topicIndex += 1
                    
                    for w in words {
                        let vocab = Vocabulary(
                            word: w.word,
                            pos: "", // Default part of speech is empty as it's not present in words.json
                            vietnameseMeaning: w.vietnameseMeaning,
                            cefrLevel: w.level,
                            isUserAdded: false
                        )
                        vocab.usPronunciation = w.ipa
                        vocab.exampleSentence = w.exampleEnglish
                        // Note: in the PDF illustration, example English and Vietnamese translation are stored inside vocabulary attributes
                        // Let's store exampleEnglish and exampleVietnamese translations using model properties
                        // Vocabulary model in PDF has exampleSentence. We can use format "example | translation" or append translation in a separate attribute.
                        // Wait, let's verify if Vocabulary model has exampleVietnamese or if we store it together.
                        // In SwiftDataModels, we defined: var exampleSentence: String?
                        // Let's store it as "English example | Vietnamese translation" so we keep both!
                        if !w.exampleEnglish.isEmpty {
                            vocab.exampleSentence = "\(w.exampleEnglish) | \(w.exampleVietnamese)"
                        }
                        
                        vocab.topic = topic
                        modelContext.insert(vocab)
                    }
                }
            }
            
            // 3. Load & Seed Phrases
            if let phrasesURL = Bundle.main.url(forResource: "phrases", withExtension: "json") {
                let data = try Data(contentsOf: phrasesURL)
                let builtInPhrases = try JSONDecoder().decode([BuiltInPhrase].self, from: data)
                
                for p in builtInPhrases {
                    // Map categories: Greetings & Basics, Shopping & Dining, Travel & Directions, Social Interactions -> Đời sống xã hội
                    let phraseGroup = PhraseGroup(
                        category: "Đời sống xã hội",
                        englishPhrase: p.english,
                        vietnameseMeaning: p.vietnamese,
                        usageContext: p.contextNote
                    )
                    modelContext.insert(phraseGroup)
                }
            }
            
            // 4. Inject supplementary premium phrases for remaining categories to meet PDF requirements
            let workPhrases = [
                PhraseGroup(
                    category: "Giao tiếp học thuật và công việc",
                    englishPhrase: "In my opinion, we should focus on optimizing our database queries.",
                    vietnameseMeaning: "Theo tôi, chúng ta nên tập trung tối ưu hóa các truy vấn cơ sở dữ liệu.",
                    usageContext: "Trình bày quan điểm cá nhân trong cuộc họp kỹ thuật."
                ),
                PhraseGroup(
                    category: "Giao tiếp học thuật và công việc",
                    englishPhrase: "Could you please elaborate on the system architecture?",
                    vietnameseMeaning: "Bạn có thể giải thích chi tiết hơn về kiến trúc hệ thống được không?",
                    usageContext: "Yêu cầu đồng nghiệp nói rõ hơn về thiết kế kỹ thuật."
                ),
                PhraseGroup(
                    category: "Giao tiếp học thuật và công việc",
                    englishPhrase: "Let's wrap up this meeting and align on the next steps.",
                    vietnameseMeaning: "Hãy kết thúc cuộc họp tại đây và thống nhất về các bước tiếp theo.",
                    usageContext: "Lời kết luận cuộc họp của quản lý dự án."
                )
            ]
            
            let emotionPhrases = [
                PhraseGroup(
                    category: "Diễn đạt cảm xúc",
                    englishPhrase: "I'm absolutely thrilled with our progress!",
                    vietnameseMeaning: "Tôi vô cùng phấn khích với tiến độ của chúng ta!",
                    usageContext: "Thể hiện niềm vui và phấn khởi về kết quả công việc."
                ),
                PhraseGroup(
                    category: "Diễn đạt cảm xúc",
                    englishPhrase: "Please accept my sincerest apologies for the delay.",
                    vietnameseMeaning: "Xin vui lòng nhận lời xin lỗi chân thành nhất của tôi về sự chậm trễ này.",
                    usageContext: "Cách xin lỗi trang trọng, chân thành."
                ),
                PhraseGroup(
                    category: "Diễn đạt cảm xúc",
                    englishPhrase: "I really appreciate your support during this difficult time.",
                    vietnameseMeaning: "Tôi thực sự trân trọng sự hỗ trợ của bạn trong thời gian khó khăn này.",
                    usageContext: "Thể hiện lòng biết ơn chân thành."
                )
            ]
            
            for p in workPhrases + emotionPhrases {
                modelContext.insert(p)
            }
            
            // 5. Save changes
            try modelContext.save()
            print("Successfully completed Database Seeding.")
        } catch {
            print("Error occurred during database seeding: \(error)")
        }
    }
}
