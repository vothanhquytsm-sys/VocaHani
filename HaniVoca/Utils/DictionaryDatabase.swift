import Foundation
import SQLite3

class DictionaryDatabase {
    static let shared = DictionaryDatabase()
    private var db: OpaquePointer?
    
    private init() {
        openDatabase()
    }
    
    private func openDatabase() {
        guard let dbPath = Bundle.main.path(forResource: "tudien", ofType: "db") else {
            print("tudien.db not found in app bundle!")
            return
        }
        
        if sqlite3_open(dbPath, &db) != SQLITE_OK {
            print("Error opening tudien.db database")
        } else {
            print("Successfully opened tudien.db")
        }
    }
    
    /// Searches for words matching the prefix (case-insensitive autocomplete)
    func searchWords(prefix: String, limit: Int = 30) -> [String] {
        guard let db = db, !prefix.isEmpty else { return [] }
        
        let query = "SELECT word FROM dictionary WHERE word LIKE ? LIMIT ?"
        var statement: OpaquePointer?
        var results: [String] = []
        
        if sqlite3_prepare_v2(db, query, -1, &statement, nil) == SQLITE_OK {
            let wildCardPrefix = "\(prefix)%"
            sqlite3_bind_text(statement, 1, (wildCardPrefix as NSString).utf8String, -1, nil)
            sqlite3_bind_int(statement, 2, Int32(limit))
            
            while sqlite3_step(statement) == SQLITE_ROW {
                if let cString = sqlite3_column_text(statement, 0) {
                    results.append(String(cString: cString))
                }
            }
        } else {
            print("SQLite search query prepare failed")
        }
        
        sqlite3_finalize(statement)
        return results
    }
    
    /// Retrieves the full dictionary definition for a word
    func getDefinition(for word: String) -> String? {
        guard let db = db else { return nil }
        
        let query = "SELECT definition FROM dictionary WHERE word = ? LIMIT 1"
        var statement: OpaquePointer?
        var definition: String? = nil
        
        if sqlite3_prepare_v2(db, query, -1, &statement, nil) == SQLITE_OK {
            sqlite3_bind_text(statement, 1, (word as NSString).utf8String, -1, nil)
            
            if sqlite3_step(statement) == SQLITE_ROW {
                if let cString = sqlite3_column_text(statement, 0) {
                    definition = String(cString: cString)
                }
            }
        } else {
            print("SQLite definition query prepare failed")
        }
        
        sqlite3_finalize(statement)
        return definition
    }
    
    deinit {
        if db != nil {
            sqlite3_close(db)
        }
    }
}
