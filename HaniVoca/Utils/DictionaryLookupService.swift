import Foundation

// MARK: - API Decodable Structs
struct DictEntry: Codable {
    let word: String
    let phonetic: String?
    let phonetics: [DictPhonetic]?
    let meanings: [DictMeaning]?
    
    var resolvedIpa: String? {
        if let phonetic = phonetic, !phonetic.isEmpty {
            return phonetic
        }
        return phonetics?.first(where: { $0.text != nil && !$0.text!.isEmpty })?.text
    }
    
    var firstExample: String? {
        guard let meanings = meanings else { return nil }
        for meaning in meanings {
            if let definitions = meaning.definitions {
                for definition in definitions {
                    if let example = definition.example, !example.isEmpty {
                        return example
                    }
                }
            }
        }
        return nil
    }
}

struct DictPhonetic: Codable {
    let text: String?
}

struct DictMeaning: Codable {
    let partOfSpeech: String?
    let definitions: [DictDefinition]?
}

struct DictDefinition: Codable {
    let definition: String?
    let example: String?
}

// MARK: - Lookup Result Struct
struct LookupResult: Hashable {
    let word: String
    let ipa: String
    let vietnameseMeaning: String
    let exampleEnglish: String
    let exampleVietnamese: String
    let symbolName: String
}

// MARK: - Dictionary Lookup Service
class DictionaryLookupService {
    
    /// Auto-lookup details for an English word
    static func lookup(word: String) async throws -> LookupResult {
        let cleanedWord = word.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !cleanedWord.isEmpty else {
            throw NSError(domain: "DictionaryLookup", code: 400, userInfo: [NSLocalizedDescriptionKey: "Từ khóa không hợp lệ"])
        }
        
        // 1. Fetch from Dictionary API for IPA & English example sentence
        var ipa = ""
        var exampleEn = ""
        
        let dictUrlString = "https://api.dictionaryapi.dev/api/v2/entries/en/\(cleanedWord.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed) ?? cleanedWord)"
        if let dictUrl = URL(string: dictUrlString) {
            do {
                let (data, response) = try await URLSession.shared.data(from: dictUrl)
                if let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 {
                    let entries = try JSONDecoder().decode([DictEntry].self, from: data)
                    if let firstEntry = entries.first {
                        ipa = firstEntry.resolvedIpa ?? ""
                        exampleEn = firstEntry.firstExample ?? ""
                    }
                }
            } catch {
                print("Dictionary API error (word may not exist in database): \(error.localizedDescription)")
            }
        }
        
        // 2. Translate word to Vietnamese using free Google Translate endpoint
        let vietnameseMeaning = await translate(text: cleanedWord) ?? ""
        
        // 3. Translate example sentence to Vietnamese
        var exampleVi = ""
        if !exampleEn.isEmpty {
            exampleVi = await translate(text: exampleEn) ?? ""
        } else {
            // Generate fallback simple example if no example found in dictionary
            exampleEn = "I want to learn the word \(cleanedWord.lowercased())."
            exampleVi = "Tôi muốn học từ \(vietnameseMeaning.lowercased())."
        }
        
        // 4. Resolve a suitable SF Symbol illustration
        let symbol = resolveSymbol(for: cleanedWord)
        
        return LookupResult(
            word: cleanedWord.capitalized,
            ipa: ipa.isEmpty ? "/\(cleanedWord.lowercased())/" : ipa,
            vietnameseMeaning: vietnameseMeaning,
            exampleEnglish: exampleEn,
            exampleVietnamese: exampleVi,
            symbolName: symbol
        )
    }
    
    /// Translate English text to Vietnamese using public Google Translate endpoint
    private static func translate(text: String) async -> String? {
        guard let encodedText = text.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) else { return nil }
        let urlString = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=\(encodedText)"
        
        guard let url = URL(string: urlString) else { return nil }
        
        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            if let json = try JSONSerialization.jsonObject(with: data, options: []) as? [Any],
               let outerArray = json.first as? [Any] {
                
                var fullTranslation = ""
                for part in outerArray {
                    if let partArray = part as? [Any],
                       let translationSegment = partArray.first as? String {
                        fullTranslation += translationSegment
                    }
                }
                
                let cleanedTranslation = fullTranslation.trimmingCharacters(in: .whitespacesAndNewlines)
                return cleanedTranslation.isEmpty ? nil : cleanedTranslation
            }
        } catch {
            print("Translation error: \(error.localizedDescription)")
        }
        
        return nil
    }
    
    /// Resolve SF Symbol based on keyword semantics
    private static func resolveSymbol(for word: String) -> String {
        let w = word.lowercased()
        
        // Semantic keyword mappings
        if w.contains("car") || w.contains("bus") || w.contains("train") || w.contains("drive") || w.contains("road") || w.contains("traffic") {
            return "car.fill"
        }
        if w.contains("food") || w.contains("eat") || w.contains("cook") || w.contains("apple") || w.contains("bread") || w.contains("cake") || w.contains("restaurant") || w.contains("rice") || w.contains("meat") || w.contains("fruit") {
            return "fork.knife"
        }
        if w.contains("book") || w.contains("read") || w.contains("learn") || w.contains("study") || w.contains("school") || w.contains("lesson") || w.contains("write") {
            return "book.fill"
        }
        if w.contains("home") || w.contains("house") || w.contains("room") || w.contains("bed") {
            return "house.fill"
        }
        if w.contains("cat") || w.contains("dog") || w.contains("animal") || w.contains("bird") || w.contains("fish") || w.contains("paw") {
            return "pawprint.fill"
        }
        if w.contains("music") || w.contains("song") || w.contains("sing") || w.contains("audio") || w.contains("melody") {
            return "music.note"
        }
        if w.contains("run") || w.contains("sport") || w.contains("game") || w.contains("play") || w.contains("exercise") || w.contains("swim") || w.contains("ball") {
            return "figure.run"
        }
        if w.contains("money") || w.contains("bank") || w.contains("cash") || w.contains("price") || w.contains("cost") || w.contains("buy") || w.contains("pay") || w.contains("dollar") {
            return "dollarsign.circle.fill"
        }
        if w.contains("computer") || w.contains("phone") || w.contains("device") || w.contains("tech") || w.contains("internet") || w.contains("web") || w.contains("network") {
            return "desktopcomputer"
        }
        if w.contains("weather") || w.contains("sun") || w.contains("rain") || w.contains("cloud") || w.contains("snow") || w.contains("wind") || w.contains("storm") {
            return "cloud.sun.fill"
        }
        if w.contains("heart") || w.contains("love") || w.contains("friend") || w.contains("marry") || w.contains("kiss") {
            return "heart.fill"
        }
        if w.contains("doctor") || w.contains("nurse") || w.contains("hospital") || w.contains("medicine") || w.contains("sick") || w.contains("health") {
            return "medical.thermometer.fill"
        }
        
        // Default pencil icon for custom entries
        return "pencil.circle.fill"
    }
}
