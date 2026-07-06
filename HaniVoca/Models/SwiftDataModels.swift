import Foundation
import SwiftData

@Model
final class Topic {
    var id: UUID = UUID()
    var name: String = ""
    var orderIndex: Int = 0
    
    // One-to-many relationship to Vocabulary, with cascade delete rule
    @Relationship(deleteRule: .cascade, originalName: "vocabularies")
    var vocabularies: [Vocabulary]? = []
    
    init(name: String, orderIndex: Int) {
        self.id = UUID()
        self.name = name
        self.orderIndex = orderIndex
        self.vocabularies = []
    }
}

@Model
final class Vocabulary {
    var id: UUID = UUID()
    var word: String = ""
    var pos: String = "" // Part of speech: Noun, Verb, Adjective...
    var vietnameseMeaning: String = ""
    var usPronunciation: String? = nil
    var exampleSentence: String? = nil
    var cefrLevel: String = "" // Levels: A1, A2, B1, B2
    var isUserAdded: Bool = false
    var createdAt: Date = Date()
    var isFavorite: Bool = false
    
    // Large image data marked as external storage to prevent database bloat
    @Attribute(.externalStorage)
    var illustrationImageData: Data? = nil
    
    // Inverse relationship to Topic
    @Relationship(inverse: \Topic.vocabularies)
    var topic: Topic? = nil
    
    // One-to-one relationship to spaced repetition metadata
    @Relationship(deleteRule: .cascade, originalName: "srsData")
    var srsData: SRSData? = nil
    
    init(word: String, pos: String, vietnameseMeaning: String, cefrLevel: String, isUserAdded: Bool = false, isFavorite: Bool = false) {
        self.id = UUID()
        self.word = word
        self.pos = pos
        self.vietnameseMeaning = vietnameseMeaning
        self.cefrLevel = cefrLevel
        self.isUserAdded = isUserAdded
        self.createdAt = Date()
        self.isFavorite = isFavorite
        self.illustrationImageData = nil
        self.topic = nil
        self.srsData = nil
    }
}

@Model
final class SRSData {
    var id: UUID = UUID()
    var easinessFactor: Double = 2.5 // Default initial EF of 2.5
    var repetitions: Int = 0
    var intervalDays: Int = 1
    var nextReviewDate: Date = Date()
    
    // Inverse relationship to Vocabulary
    @Relationship(inverse: \Vocabulary.srsData)
    var vocabulary: Vocabulary? = nil
    
    init() {
        self.id = UUID()
        self.easinessFactor = 2.5
        self.repetitions = 0
        self.intervalDays = 1
        self.nextReviewDate = Date()
        self.vocabulary = nil
    }
}

@Model
final class PhraseGroup {
    var id: UUID = UUID()
    var category: String = "" // Academic & Work, Social Life, Emotion Expression
    var englishPhrase: String = ""
    var vietnameseMeaning: String = ""
    var usageContext: String? = nil
    var isFavorite: Bool = false
    
    init(category: String, englishPhrase: String, vietnameseMeaning: String, usageContext: String? = nil, isFavorite: Bool = false) {
        self.id = UUID()
        self.category = category
        self.englishPhrase = englishPhrase
        self.vietnameseMeaning = vietnameseMeaning
        self.usageContext = usageContext
        self.isFavorite = isFavorite
    }
}
