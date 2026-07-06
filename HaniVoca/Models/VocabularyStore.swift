import Foundation
import SwiftData
import Combine
import SwiftUI

@MainActor
class VocabularyStore: ObservableObject {
    @Published var words: [Word] = []
    @Published var phrases: [Phrase] = []
    @Published var customWords: [Word] = []
    
    // Legacy tracking sets to maintain compatibility with existing Views
    @Published var learnedWordIds: Set<String> = []
    @Published var favoriteWordIds: Set<String> = []
    @Published var passedLessons: Set<String> = []
    @Published var readings: [ReadingPassage] = []
    @Published var completedReadings: [String: Int] = [:]
    
    var modelContainer: ModelContainer
    var modelContext: ModelContext
    
    init() {
        do {
            let schema = Schema([Topic.self, Vocabulary.self, SRSData.self, PhraseGroup.self])
            let config = ModelConfiguration(schema: schema, isStoredInMemoryOnly: false)
            self.modelContainer = try ModelContainer(for: schema, configurations: [config])
            self.modelContext = ModelContext(modelContainer)
            
            // Seed database
            DatabaseSeedingService.seedIfNeeded(modelContext: self.modelContext)
            
            // Load status sets from UserDefaults
            if let passed = UserDefaults.standard.stringArray(forKey: "passedLessons") {
                self.passedLessons = Set(passed)
            }
            
            // Load readings database
            if let readingsUrl = Bundle.main.url(forResource: "readings", withExtension: "json") {
                do {
                    let data = try Data(contentsOf: readingsUrl)
                    self.readings = try JSONDecoder().decode([ReadingPassage].self, from: data)
                } catch {
                    print("Error loading readings database: \(error)")
                }
            }
            
            // Load completed readings from UserDefaults
            self.completedReadings = UserDefaults.standard.dictionary(forKey: "completedReadings") as? [String: Int] ?? [:]

            loadData()
        } catch {
            fatalError("Failed to initialize SwiftData model container: \(error)")
        }
    }
    
    // MARK: - Load data from SwiftData
    func loadData() {
        do {
            // Fetch Vocabularies
            let vocabDescriptor = FetchDescriptor<Vocabulary>()
            let vocabularies = try modelContext.fetch(vocabDescriptor)
            
            // Fetch PhraseGroups
            let phraseDescriptor = FetchDescriptor<PhraseGroup>()
            let phraseGroups = try modelContext.fetch(phraseDescriptor)
            
            // Re-sync local sets
            var learnedIds: Set<String> = []
            var favoriteIds: Set<String> = []
            
            // Map SwiftData entities to legacy Word structs
            let mappedWords = vocabularies.map { v -> Word in
                let wordId = v.id.uuidString
                let isLearned = v.srsData != nil
                
                if isLearned {
                    learnedIds.insert(wordId)
                }
                if v.isFavorite {
                    favoriteIds.insert(wordId)
                }
                
                // Parse example sentences
                var exEn = ""
                var exVi = ""
                if let ex = v.exampleSentence {
                    let parts = ex.components(separatedBy: " | ")
                    if parts.count >= 2 {
                        exEn = parts[0]
                        exVi = parts[1]
                    } else {
                        exEn = ex
                    }
                }
                
                return Word(
                    id: wordId,
                    word: v.word,
                    ipa: v.usPronunciation ?? "",
                    vietnameseMeaning: v.vietnameseMeaning,
                    exampleEnglish: exEn,
                    exampleVietnamese: exVi,
                    topic: v.topic?.name ?? "Custom",
                    level: v.cefrLevel,
                    symbolName: "pencil.circle.fill",
                    isCustom: v.isUserAdded,
                    isLearned: isLearned,
                    isFavorite: v.isFavorite
                )
            }
            
            // Map PhraseGroups to Phrase structs
            let mappedPhrases = phraseGroups.map { pg -> Phrase in
                return Phrase(
                    id: pg.id.uuidString,
                    english: pg.englishPhrase,
                    vietnamese: pg.vietnameseMeaning,
                    category: pg.category,
                    contextNote: pg.usageContext,
                    isFavorite: pg.isFavorite
                )
            }
            
            // Publish properties
            self.words = mappedWords
            self.phrases = mappedPhrases
            self.customWords = mappedWords.filter { $0.isCustom }
            self.learnedWordIds = learnedIds
            self.favoriteWordIds = favoriteIds
            
            // Sync legacy defaults
            UserDefaults.standard.set(Array(learnedIds), forKey: "learnedWordIds")
            UserDefaults.standard.set(Array(favoriteIds), forKey: "favoriteWordIds")
        } catch {
            print("Error loading data from SwiftData: \(error)")
        }
    }
    
    // MARK: - Word State Modification (Mapping back to SwiftData)
    func toggleLearned(for word: Word) {
        do {
            guard let uuid = UUID(uuidString: word.id) else { return }
            let descriptor = FetchDescriptor<Vocabulary>(predicate: #Predicate { $0.id == uuid })
            if let vocab = try modelContext.fetch(descriptor).first {
                if vocab.srsData != nil {
                    // Remove learning progress (delete SRSData)
                    if let srs = vocab.srsData {
                        modelContext.delete(srs)
                    }
                    vocab.srsData = nil
                } else {
                    // Start learning (create SRSData)
                    let newSRS = SRSData()
                    newSRS.vocabulary = vocab
                    vocab.srsData = newSRS
                    modelContext.insert(newSRS)
                }
                try modelContext.save()
                loadData()
            }
        } catch {
            print("Error toggling learned state: \(error)")
        }
    }
    
    func toggleFavorite(for word: Word) {
        do {
            guard let uuid = UUID(uuidString: word.id) else { return }
            let descriptor = FetchDescriptor<Vocabulary>(predicate: #Predicate { $0.id == uuid })
            if let vocab = try modelContext.fetch(descriptor).first {
                vocab.isFavorite.toggle()
                try modelContext.save()
                loadData()
            }
        } catch {
            print("Error toggling favorite state: \(error)")
        }
    }
    
    func toggleFavorite(for phrase: Phrase) {
        do {
            guard let uuid = UUID(uuidString: phrase.id) else { return }
            let descriptor = FetchDescriptor<PhraseGroup>(predicate: #Predicate { $0.id == uuid })
            if let pg = try modelContext.fetch(descriptor).first {
                pg.isFavorite.toggle()
                try modelContext.save()
                loadData()
            }
        } catch {
            print("Error toggling phrase favorite state: \(error)")
        }
    }
    
    // MARK: - Spaced Repetition (SM-2 updates)
    func rateWordQuality(wordId: String, quality: Int) {
        do {
            guard let uuid = UUID(uuidString: wordId) else { return }
            let descriptor = FetchDescriptor<Vocabulary>(predicate: #Predicate { $0.id == uuid })
            if let vocab = try modelContext.fetch(descriptor).first {
                let srs = vocab.srsData ?? SRSData()
                
                // Apply SM-2 calculation
                let sm2 = SM2SpacedRepetition.calculate(
                    quality: quality,
                    currentEF: srs.easinessFactor,
                    currentRepetitions: srs.repetitions,
                    currentIntervalDays: srs.intervalDays
                )
                
                // Update properties
                srs.easinessFactor = sm2.easinessFactor
                srs.repetitions = sm2.repetitions
                srs.intervalDays = sm2.intervalDays
                srs.nextReviewDate = sm2.nextReviewDate
                
                if vocab.srsData == nil {
                    srs.vocabulary = vocab
                    vocab.srsData = srs
                    modelContext.insert(srs)
                }
                
                try modelContext.save()
                loadData()
                print("SM-2 updated for \(vocab.word): EF=\(srs.easinessFactor), Reps=\(srs.repetitions), Next Review=\(srs.nextReviewDate)")
            }
        } catch {
            print("Error updating SM-2 score: \(error)")
        }
    }
    
    // MARK: - Custom Word Operations
    func addCustomWord(word: String, ipa: String, meaning: String, exampleEn: String, exampleVi: String, topic: String, level: String, symbolName: String = "pencil.circle.fill") {
        do {
            let topicName = topic.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? "Custom" : topic.trimmingCharacters(in: .whitespacesAndNewlines)
            
            // Find or create topic
            let topicDescriptor = FetchDescriptor<Topic>(predicate: #Predicate { $0.name == topicName })
            var topicObj = try modelContext.fetch(topicDescriptor).first
            
            if topicObj == nil {
                // Find highest orderIndex
                let allTopicsDescriptor = FetchDescriptor<Topic>()
                let count = try modelContext.fetchCount(allTopicsDescriptor)
                topicObj = Topic(name: topicName, orderIndex: count)
                modelContext.insert(topicObj!)
            }
            
            let vocab = Vocabulary(
                word: word.trimmingCharacters(in: .whitespacesAndNewlines),
                pos: "",
                vietnameseMeaning: meaning.trimmingCharacters(in: .whitespacesAndNewlines),
                cefrLevel: level,
                isUserAdded: true
            )
            vocab.usPronunciation = ipa.trimmingCharacters(in: .whitespacesAndNewlines)
            
            let exEn = exampleEn.trimmingCharacters(in: .whitespacesAndNewlines)
            let exVi = exampleVi.trimmingCharacters(in: .whitespacesAndNewlines)
            if !exEn.isEmpty {
                vocab.exampleSentence = "\(exEn) | \(exVi)"
            }
            
            vocab.topic = topicObj
            modelContext.insert(vocab)
            
            try modelContext.save()
            loadData()
        } catch {
            print("Error adding custom word: \(error)")
        }
    }
    
    func updateCustomWord(id: String, word: String, ipa: String, meaning: String, exampleEn: String, exampleVi: String, topic: String, level: String) {
        do {
            guard let uuid = UUID(uuidString: id) else { return }
            let descriptor = FetchDescriptor<Vocabulary>(predicate: #Predicate { $0.id == uuid })
            if let vocab = try modelContext.fetch(descriptor).first {
                vocab.word = word.trimmingCharacters(in: .whitespacesAndNewlines)
                vocab.vietnameseMeaning = meaning.trimmingCharacters(in: .whitespacesAndNewlines)
                vocab.cefrLevel = level
                vocab.usPronunciation = ipa.trimmingCharacters(in: .whitespacesAndNewlines)
                
                let exEn = exampleEn.trimmingCharacters(in: .whitespacesAndNewlines)
                let exVi = exampleVi.trimmingCharacters(in: .whitespacesAndNewlines)
                if !exEn.isEmpty {
                    vocab.exampleSentence = "\(exEn) | \(exVi)"
                } else {
                    vocab.exampleSentence = nil
                }
                
                let topicName = topic.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? "Custom" : topic.trimmingCharacters(in: .whitespacesAndNewlines)
                
                if vocab.topic?.name != topicName {
                    let topicDescriptor = FetchDescriptor<Topic>(predicate: #Predicate { $0.name == topicName })
                    var topicObj = try modelContext.fetch(topicDescriptor).first
                    if topicObj == nil {
                        let allTopicsDescriptor = FetchDescriptor<Topic>()
                        let count = try modelContext.fetchCount(allTopicsDescriptor)
                        topicObj = Topic(name: topicName, orderIndex: count)
                        modelContext.insert(topicObj!)
                    }
                    vocab.topic = topicObj
                }
                
                try modelContext.save()
                loadData()
            }
        } catch {
            print("Error updating custom word: \(error)")
        }
    }

    func deleteCustomWord(id: String) {
        do {
            guard let uuid = UUID(uuidString: id) else { return }
            let descriptor = FetchDescriptor<Vocabulary>(predicate: #Predicate { $0.id == uuid })
            if let vocab = try modelContext.fetch(descriptor).first {
                modelContext.delete(vocab)
                try modelContext.save()
                loadData()
            }
        } catch {
            print("Error deleting custom word: \(error)")
        }
    }
    
    func saveReadingScore(passageId: String, score: Int) {
        completedReadings[passageId] = max(completedReadings[passageId] ?? 0, score)
        UserDefaults.standard.set(completedReadings, forKey: "completedReadings")
        objectWillChange.send()
    }
    
    // MARK: - Export and Import (Sandbox Compliant)
    func exportCustomWords() -> URL? {
        do {
            // Retrieve custom vocabularies
            let descriptor = FetchDescriptor<Vocabulary>(predicate: #Predicate { $0.isUserAdded == true })
            let customVocabs = try modelContext.fetch(descriptor)
            
            let mappedWords = customVocabs.map { v -> Word in
                var exEn = ""
                var exVi = ""
                if let ex = v.exampleSentence {
                    let parts = ex.components(separatedBy: " | ")
                    if parts.count >= 2 {
                        exEn = parts[0]
                        exVi = parts[1]
                    } else {
                        exEn = ex
                    }
                }
                return Word(
                    id: v.id.uuidString,
                    word: v.word,
                    ipa: v.usPronunciation ?? "",
                    vietnameseMeaning: v.vietnameseMeaning,
                    exampleEnglish: exEn,
                    exampleVietnamese: exVi,
                    topic: v.topic?.name ?? "Custom",
                    level: v.cefrLevel,
                    symbolName: "pencil.circle.fill",
                    isCustom: true
                )
            }
            
            let data = try JSONEncoder().encode(mappedWords)
            let tempDir = FileManager.default.temporaryDirectory
            let exportURL = tempDir.appendingPathComponent("HaniVoca_CustomWords.json")
            try data.write(to: exportURL, options: [.atomicWrite])
            return exportURL
        } catch {
            print("Error exporting custom words: \(error)")
            return nil
        }
    }
    
    func importCustomWords(from url: URL) -> Bool {
        do {
            // Sandbox-compliant resource access
            let shouldAccess = url.startAccessingSecurityScopedResource()
            defer {
                if shouldAccess {
                    url.stopAccessingSecurityScopedResource()
                }
            }
            
            let data = try Data(contentsOf: url)
            var importedList: [Word] = []
            
            // Check extension to decide JSON or CSV parsing
            if url.pathExtension.lowercased() == "csv" {
                if let csvString = String(data: data, encoding: .utf8) {
                    importedList = DocumentTransferHelper.parseCSV(text: csvString)
                }
            } else {
                importedList = try JSONDecoder().decode([Word].self, from: data)
            }
            
            guard !importedList.isEmpty else { return false }
            
            // Insert each imported word into modelContext
            for w in importedList {
                let topicName = w.topic.isEmpty ? "Custom" : w.topic
                
                // Find or create topic
                let topicDescriptor = FetchDescriptor<Topic>(predicate: #Predicate { $0.name == topicName })
                var topicObj = try modelContext.fetch(topicDescriptor).first
                if topicObj == nil {
                    let allTopicsDescriptor = FetchDescriptor<Topic>()
                    let count = try modelContext.fetchCount(allTopicsDescriptor)
                    topicObj = Topic(name: topicName, orderIndex: count)
                    modelContext.insert(topicObj!)
                }
                
                let vocab = Vocabulary(
                    word: w.word,
                    pos: "",
                    vietnameseMeaning: w.vietnameseMeaning,
                    cefrLevel: w.level,
                    isUserAdded: true
                )
                vocab.usPronunciation = w.ipa
                if !w.exampleEnglish.isEmpty {
                    vocab.exampleSentence = "\(w.exampleEnglish) | \(w.exampleVietnamese)"
                }
                vocab.topic = topicObj
                modelContext.insert(vocab)
            }
            
            try modelContext.save()
            loadData()
            return true
        } catch {
            print("Failed to import custom words: \(error)")
            return false
        }
    }
    
    // MARK: - Lesson Lock & Quiz Helpers
    func isLessonUnlocked(topic: String, index: Int) -> Bool {
        if index == 0 || topic == "Custom" {
            return true
        }
        let key = "\(topic)_\(index - 1)"
        return passedLessons.contains(key)
    }
    
    func passLesson(topic: String, index: Int) {
        let key = "\(topic)_\(index)"
        passedLessons.insert(key)
        
        UserDefaults.standard.set(Array(passedLessons), forKey: "passedLessons")
        
        // Find vocabulary items in this topic and CEFR index block to mark them as learned
        let wordsInTopic = words.filter { $0.topic == topic }
        let startIndex = index * 10
        let endIndex = min(startIndex + 10, wordsInTopic.count)
        if startIndex < wordsInTopic.count {
            let lessonWords = Array(wordsInTopic[startIndex..<endIndex])
            for word in lessonWords {
                if !word.isLearned {
                    toggleLearned(for: word)
                }
            }
        }
    }
    
    func resetLessonProgress() {
        passedLessons.removeAll()
        UserDefaults.standard.removeObject(forKey: "passedLessons")
        
        do {
            // Delete all learning progress records (SRSData) in modelContext
            let srsDescriptor = FetchDescriptor<SRSData>()
            let srsList = try modelContext.fetch(srsDescriptor)
            for srs in srsList {
                modelContext.delete(srs)
            }
            
            // Clear favorite status
            let vocabDescriptor = FetchDescriptor<Vocabulary>()
            let vocabs = try modelContext.fetch(vocabDescriptor)
            for v in vocabs {
                v.isFavorite = false
            }
            
            try modelContext.save()
            loadData()
        } catch {
            print("Error resetting lesson progress: \(error)")
        }
    }
}
