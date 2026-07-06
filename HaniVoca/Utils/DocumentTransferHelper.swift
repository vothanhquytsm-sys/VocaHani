import Foundation
import SwiftUI
import UniformTypeIdentifiers

// Custom FileDocument conformers for JSON and CSV exports
struct JSONDocument: FileDocument {
    static var readableContentTypes: [UTType] { [.json] }
    
    var data: Data
    
    init(data: Data) {
        self.data = data
    }
    
    init(configuration: ReadConfiguration) throws {
        if let data = configuration.file.regularFileContents {
            self.data = data
        } else {
            throw CocoaError(.fileReadCorruptFile)
        }
    }
    
    func fileWrapper(configuration: WriteConfiguration) throws -> FileWrapper {
        return FileWrapper(regularFileWithContents: data)
    }
}

struct CSVDocument: FileDocument {
    static var readableContentTypes: [UTType] { [.commaSeparatedText] }
    
    var csvText: String
    
    init(text: String) {
        self.csvText = text
    }
    
    init(configuration: ReadConfiguration) throws {
        if let data = configuration.file.regularFileContents,
           let text = String(data: data, encoding: .utf8) {
            self.csvText = text
        } else {
            throw CocoaError(.fileReadCorruptFile)
        }
    }
    
    func fileWrapper(configuration: WriteConfiguration) throws -> FileWrapper {
        let data = Data(csvText.utf8)
        return FileWrapper(regularFileWithContents: data)
    }
}

class DocumentTransferHelper {
    
    /// Parse CSV content string into Word objects
    static func parseCSV(text: String) -> [Word] {
        var words: [Word] = []
        let lines = text.components(separatedBy: .newlines)
        
        for line in lines {
            let trimmed = line.trimmingCharacters(in: .whitespacesAndNewlines)
            if trimmed.isEmpty { continue }
            
            // Basic CSV parsing splitting by comma, respecting quotes
            let fields = parseCSVLine(line: trimmed)
            if fields.isEmpty { continue }
            
            // Expected headers/order: word, ipa, meaning, exampleEn, exampleVi, level, topic
            let wordText = fields.count > 0 ? fields[0] : ""
            if wordText.isEmpty || wordText.lowercased() == "word" { continue } // Skip header row
            
            let ipaText = fields.count > 1 ? fields[1] : ""
            let meaningText = fields.count > 2 ? fields[2] : ""
            let exampleEnText = fields.count > 3 ? fields[3] : ""
            let exampleViText = fields.count > 4 ? fields[4] : ""
            let levelText = fields.count > 5 ? fields[5] : "A1"
            let topicText = fields.count > 6 ? fields[6] : "Custom"
            
            let wordObj = Word(
                word: wordText,
                ipa: ipaText,
                vietnameseMeaning: meaningText,
                exampleEnglish: exampleEnText,
                exampleVietnamese: exampleViText,
                topic: topicText.isEmpty ? "Custom" : topicText,
                level: levelText.isEmpty ? "A1" : levelText,
                symbolName: "pencil.circle.fill",
                isCustom: true
            )
            words.append(wordObj)
        }
        return words
    }
    
    /// Generate CSV text string from Word list
    static func generateCSV(words: [Word]) -> String {
        var csv = "word,ipa,vietnameseMeaning,exampleEnglish,exampleVietnamese,level,topic\n"
        for w in words {
            let fields = [
                escapeCSVField(w.word),
                escapeCSVField(w.ipa),
                escapeCSVField(w.vietnameseMeaning),
                escapeCSVField(w.exampleEnglish),
                escapeCSVField(w.exampleVietnamese),
                escapeCSVField(w.level),
                escapeCSVField(w.topic)
            ]
            csv += fields.joined(separator: ",") + "\n"
        }
        return csv
    }
    
    // Helper to safely parse a CSV line keeping items within double quotes together
    private static func parseCSVLine(line: String) -> [String] {
        var fields: [String] = []
        var currentField = ""
        var inQuotes = false
        
        let chars = Array(line)
        var idx = 0
        while idx < chars.count {
            let char = chars[idx]
            if char == "\"" {
                inQuotes.toggle()
            } else if char == "," && !inQuotes {
                fields.append(currentField.trimmingCharacters(in: .whitespaces))
                currentField = ""
            } else {
                currentField.append(char)
            }
            idx += 1
        }
        fields.append(currentField.trimmingCharacters(in: .whitespaces))
        return fields
    }
    
    // Helper to escape special characters like commas and double-quotes for CSV output
    private static func escapeCSVField(_ field: String) -> String {
        let escaped = field.replacingOccurrences(of: "\"", with: "\"\"")
        if escaped.contains(",") || escaped.contains("\"") || escaped.contains("\n") || escaped.contains("\r") {
            return "\"\(escaped)\""
        }
        return escaped
    }
}
