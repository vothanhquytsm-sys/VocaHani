import Foundation

struct ReadingPassage: Codable, Identifiable, Hashable {
    var id: String
    var title: String
    var level: String
    var content: String
    var vocabulary: [String]
    var questions: [ReadingQuestion]
}

struct ReadingQuestion: Codable, Identifiable, Hashable {
    var id: String
    var questionText: String
    var options: [String]
    var correctOption: String
}
