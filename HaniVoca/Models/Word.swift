import Foundation

struct Word: Codable, Identifiable, Hashable {
    var id: String
    var word: String
    var ipa: String
    var vietnameseMeaning: String
    var exampleEnglish: String
    var exampleVietnamese: String
    var topic: String
    var level: String // A1, A2, B1, B2, C1, C2
    var symbolName: String // Name of SF Symbol for illustration
    var isCustom: Bool
    var isLearned: Bool
    var isFavorite: Bool
    
    // Helper to initialize custom words
    init(id: String = UUID().uuidString,
         word: String,
         ipa: String = "",
         vietnameseMeaning: String,
         exampleEnglish: String = "",
         exampleVietnamese: String = "",
         topic: String = "Custom",
         level: String = "A1",
         symbolName: String = "pencil.circle.fill",
         isCustom: Bool = true,
         isLearned: Bool = false,
         isFavorite: Bool = false) {
        self.id = id
        self.word = word
        self.ipa = ipa
        self.vietnameseMeaning = vietnameseMeaning
        self.exampleEnglish = exampleEnglish
        self.exampleVietnamese = exampleVietnamese
        self.topic = topic
        self.level = level
        self.symbolName = symbolName
        self.isCustom = isCustom
        self.isLearned = isLearned
        self.isFavorite = isFavorite
    }
}
