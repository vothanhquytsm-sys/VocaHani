import Foundation

struct Phrase: Codable, Identifiable, Hashable {
    var id: String
    var english: String
    var vietnamese: String
    var category: String // Greetings, Dining, Travel, etc.
    var contextNote: String? // Optional cultural or contextual note
    var isFavorite: Bool = false
}
