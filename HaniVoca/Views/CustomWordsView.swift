import SwiftUI
import UniformTypeIdentifiers

struct CustomWordsView: View {
    @EnvironmentObject var store: VocabularyStore
    
    @State private var showingAddSheet = false
    @State private var showingImporter = false
    @State private var showingJSONExporter = false
    @State private var showingCSVExporter = false
    @State private var jsonDoc: JSONDocument? = nil
    @State private var csvDoc: CSVDocument? = nil
    
    // Form fields
    @State private var newWord = ""
    @State private var newIpa = ""
    @State private var newMeaning = ""
    @State private var newExampleEn = ""
    @State private var newExampleVi = ""
    @State private var selectedTopic = "Custom"
    @State private var selectedLevel = "A1"
    @State private var newSymbolName = "pencil.circle.fill"
    
    // Search & Fetch states
    @State private var isSearching = false
    @State private var lookupError: String? = nil
    @State private var searchText = ""
    @State private var selectedFilter = 0
    @StateObject private var synthesizer = SpeechSynthesizer()
    
    let levels = ["A1", "A2", "B1", "B2", "C1", "C2"]
    
    var isLookupDisabled: Bool {
        newWord.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }
    
    var isSaveDisabled: Bool {
        newWord.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ||
        newMeaning.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }
    
    var filteredCustomWords: [Word] {
        var words = store.customWords
        
        // Filter by tab status
        if selectedFilter == 1 {
            words = words.filter { !$0.isLearned }
        } else if selectedFilter == 2 {
            words = words.filter { $0.isLearned }
        }
        
        // Filter by search text query
        if !searchText.isEmpty {
            let query = searchText.trimmingCharacters(in: .whitespacesAndNewlines)
            words = words.filter {
                $0.word.localizedCaseInsensitiveContains(query) ||
                $0.vietnameseMeaning.localizedCaseInsensitiveContains(query)
            }
        }
        
        return words
    }
    
    var body: some View {
        VStack(spacing: 0) {
            // Mockup Header Bar
            HStack {
                Text("Từ của tôi")
                    .font(.system(size: 34, weight: .black, design: .rounded))
                    .foregroundColor(.primary)
                
                Spacer()
                
                // Import & Export Group
                HStack(spacing: 12) {
                    Button {
                        showingImporter = true
                    } label: {
                        Image(systemName: "square.and.arrow.down")
                            .font(.system(size: 15, weight: .bold))
                            .foregroundColor(.primary.opacity(0.7))
                    }
                    
                    if !store.customWords.isEmpty {
                        Menu {
                            Button("Xuất file JSON (.json)") {
                                prepareJSONExport()
                            }
                            Button("Xuất file CSV (.csv)") {
                                prepareCSVExport()
                            }
                        } label: {
                            Image(systemName: "square.and.arrow.up")
                                .font(.system(size: 15, weight: .bold))
                                .foregroundColor(.primary.opacity(0.7))
                        }
                    }
                    
                    Button {
                        showingAddSheet = true
                    } label: {
                        Image(systemName: "plus")
                            .font(.system(size: 16, weight: .bold))
                            .foregroundColor(.primary)
                            .padding(10)
                            .background(Color.appSecondarySystemBackground)
                            .clipShape(Circle())
                    }
                }
            }
            .padding(.horizontal)
            .padding(.top, 16)
            .padding(.bottom, 12)
            
            // Custom Mockup Search Bar
            HStack {
                HStack {
                    TextField("Search", text: $searchText)
                        .padding(.leading, 16)
                        .font(.body)
                        .autocorrectionDisabled()
                        .appDisableAutocapitalization()
                    
                    Spacer()
                    
                    Button {
                        // Reactive text search
                    } label: {
                        Image(systemName: "magnifyingglass")
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(.white)
                            .padding(10)
                            .background(Color(.darkGray))
                            .clipShape(Circle())
                    }
                    .padding(.trailing, 4)
                }
                .frame(height: 48)
                .background(Color.appSecondarySystemBackground.opacity(0.8))
                .cornerRadius(24)
            }
            .padding(.horizontal)
            .padding(.bottom, 14)
            
            // Custom Mockup Filter Pills
            HStack(spacing: 10) {
                FilterPill(title: "Tất cả", isActive: selectedFilter == 0) {
                    selectedFilter = 0
                }
                FilterPill(title: "Cần học", isActive: selectedFilter == 1) {
                    selectedFilter = 1
                }
                FilterPill(title: "Đã thuộc", isActive: selectedFilter == 2) {
                    selectedFilter = 2
                }
                Spacer()
            }
            .padding(.horizontal)
            .padding(.bottom, 16)
            
            // Scrollable list of cards
            if store.customWords.isEmpty {
                VStack(spacing: 24) {
                    Spacer()
                    ZStack {
                        Circle()
                            .fill(Color.accentColor.opacity(0.1))
                            .frame(width: 120, height: 120)
                        
                        Image(systemName: "pencil.and.scribble")
                            .font(.system(size: 50))
                            .foregroundColor(.accentColor)
                    }
                    
                    Text("Danh sách từ vựng trống")
                        .font(.title3)
                        .fontWeight(.bold)
                    
                    Text("Nhấn nút '+' ở góc trên bên phải để thêm từ. Nhập từ tiếng Anh, hệ thống sẽ tự động tra cứu nghĩa, ví dụ và tạo hình minh họa cho bạn!")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 40)
                        .lineSpacing(4)
                    
                    Spacer()
                }
            } else if filteredCustomWords.isEmpty {
                VStack(spacing: 20) {
                    Spacer()
                    Image(systemName: "magnifyingglass.circle")
                        .font(.system(size: 60))
                        .foregroundColor(.secondary)
                    Text("Không tìm thấy kết quả phù hợp")
                        .foregroundColor(.secondary)
                    Spacer()
                }
            } else {
                ScrollView {
                    VStack(spacing: 16) {
                        ForEach(filteredCustomWords) { word in
                            WordCardView(word: word) {
                                // Dynamic reload handled automatically by VocabularyStore publishers
                            }
                        }
                    }
                    .padding()
                }
            }
            
            // Bottom stats row
            let learnedCount = store.customWords.filter { $0.isLearned }.count
            HStack {
                Text("Đã thuộc \(learnedCount)")
                    .font(.system(size: 14, weight: .semibold, design: .rounded))
                    .foregroundColor(.secondary)
                Spacer()
                Image(systemName: "chevron.down")
                    .font(.footnote)
                    .foregroundColor(.secondary)
            }
            .padding(.horizontal)
            .padding(.vertical, 12)
            .background(Color.appSecondarySystemBackground.opacity(0.5))
        }
        .navigationTitle("")
        .appNavigationBarHidden()
        .fileImporter(isPresented: $showingImporter, allowedContentTypes: [.json, .commaSeparatedText]) { result in
            switch result {
            case .success(let url):
                let _ = store.importCustomWords(from: url)
            case .failure(let error):
                print("Failed to select file: \(error.localizedDescription)")
            }
        }
        .fileExporter(
            isPresented: $showingJSONExporter,
            document: jsonDoc,
            contentType: .json,
            defaultFilename: "FluentFlow_CustomWords.json"
        ) { result in
            switch result {
            case .success(let url):
                print("Exported JSON successfully to \(url)")
            case .failure(let error):
                print("Failed to export JSON: \(error.localizedDescription)")
            }
        }
        .fileExporter(
            isPresented: $showingCSVExporter,
            document: csvDoc,
            contentType: .commaSeparatedText,
            defaultFilename: "FluentFlow_CustomWords.csv"
        ) { result in
            switch result {
            case .success(let url):
                print("Exported CSV successfully to \(url)")
            case .failure(let error):
                print("Failed to export CSV: \(error.localizedDescription)")
            }
        }
        .sheet(isPresented: $showingAddSheet) {
            NavigationStack {
                Form {
                    Section(header: Text("TỪ TIẾNG ANH")) {
                        HStack {
                            TextField("Ví dụ: Rainbow", text: $newWord)
                                .autocorrectionDisabled()
                                .appDisableAutocapitalization()
                            
                            if isSearching {
                                ProgressView()
                                    .padding(.horizontal, 4)
                            } else {
                                Button {
                                    performLookup()
                                } label: {
                                    HStack(spacing: 4) {
                                        Image(systemName: "sparkles")
                                        Text("Tra nhanh")
                                    }
                                    .font(.caption)
                                    .fontWeight(.bold)
                                }
                                .tint(.accentColor)
                                .buttonStyle(.bordered)
                                .disabled(isLookupDisabled)
                            }
                        }
                        
                        if let error = lookupError {
                            Text(error)
                                .font(.caption)
                                .foregroundColor(.red)
                        }
                    }
                    
                    Section(header: Text("THÔNG TIN CHI TIẾT (TỰ ĐỘNG ĐIỀN)")) {
                        TextField("Phiên âm IPA", text: $newIpa)
                        TextField("Nghĩa tiếng Việt", text: $newMeaning)
                    }
                    
                    Section(header: Text("CÂU VÍ DỤ MINH HỌA")) {
                        TextField("Ví dụ tiếng Anh", text: $newExampleEn)
                        TextField("Dịch nghĩa tiếng Việt", text: $newExampleVi)
                    }
                    
                    Section(header: Text("PHÂN LOẠI")) {
                        Picker("Trình độ", selection: $selectedLevel) {
                            ForEach(levels, id: \.self) { level in
                                Text(level).tag(level)
                            }
                        }
                        
                        TextField("Chủ đề (Mặc định: Custom)", text: $selectedTopic)
                    }
                }
                .navigationTitle("Thêm từ vựng mới")
                #if os(iOS)
                .navigationBarTitleDisplayMode(.inline)
                #endif
                .toolbar {
                    ToolbarItem(placement: .cancellationAction) {
                        Button("Hủy") {
                            showingAddSheet = false
                            clearForm()
                        }
                    }
                    
                    ToolbarItem(placement: .confirmationAction) {
                        Button("Lưu") {
                            store.addCustomWord(
                                word: newWord,
                                ipa: newIpa,
                                meaning: newMeaning,
                                exampleEn: newExampleEn,
                                exampleVi: newExampleVi,
                                topic: selectedTopic.isEmpty ? "Custom" : selectedTopic,
                                level: selectedLevel,
                                symbolName: newSymbolName
                            )
                            showingAddSheet = false
                            clearForm()
                        }
                        .disabled(isSaveDisabled)
                    }
                }
            }
            #if os(macOS)
            .frame(width: 480, height: 480)
            #endif
        }
    }
    
    private func performLookup() {
        let query = newWord.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !query.isEmpty else { return }
        
        isSearching = true
        lookupError = nil
        
        Task {
            do {
                let result = try await DictionaryLookupService.lookup(word: query)
                await MainActor.run {
                    newWord = result.word
                    newIpa = result.ipa
                    newMeaning = result.vietnameseMeaning
                    newExampleEn = result.exampleEnglish
                    newExampleVi = result.exampleVietnamese
                    newSymbolName = result.symbolName
                    isSearching = false
                }
            } catch {
                await MainActor.run {
                    lookupError = "Không thể tra cứu tự động. Hãy tự điền nghĩa."
                    isSearching = false
                }
            }
        }
    }
    private func prepareJSONExport() {
        do {
            let data = try JSONEncoder().encode(store.customWords)
            self.jsonDoc = JSONDocument(data: data)
            self.showingJSONExporter = true
        } catch {
            print("Failed to encode JSON: \(error)")
        }
    }
    
    private func prepareCSVExport() {
        let csvText = DocumentTransferHelper.generateCSV(words: store.customWords)
        self.csvDoc = CSVDocument(text: csvText)
        self.showingCSVExporter = true
    }
    
    private func clearForm() {
        newWord = ""
        newIpa = ""
        newMeaning = ""
        newExampleEn = ""
        newExampleVi = ""
        selectedTopic = "Custom"
        selectedLevel = "A1"
        newSymbolName = "pencil.circle.fill"
        lookupError = nil
    }
}

struct WordCardView: View {
    @EnvironmentObject var store: VocabularyStore
    let word: Word
    let onAction: () -> Void
    @StateObject private var synthesizer = SpeechSynthesizer()
    @State private var showingEditSheet = false
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(alignment: .center) {
                // Word Title
                Text(word.word)
                    .font(.system(size: 24, weight: .bold, design: .rounded))
                    .foregroundColor(.primary)
                
                Spacer()
                
                // Ellipsis Context Action Button
                Menu {
                    Button {
                        showingEditSheet = true
                    } label: {
                        Label("Sửa từ này", systemImage: "pencil")
                    }
                    
                    Button {
                        store.toggleLearned(for: word)
                        onAction()
                    } label: {
                        Label(word.isLearned ? "Đánh dấu Cần học" : "Đánh dấu Đã thuộc",
                              systemImage: word.isLearned ? "circle" : "checkmark.circle")
                    }
                    
                    Button(role: .destructive) {
                        store.deleteCustomWord(id: word.id)
                        onAction()
                    } label: {
                        Label("Xóa từ này", systemImage: "trash")
                    }
                } label: {
                    Image(systemName: "ellipsis")
                        .font(.body)
                        .foregroundColor(.secondary)
                        .padding(6)
                        .background(Color.appSecondarySystemBackground)
                        .clipShape(Circle())
                }
            }
            
            // Subtitle: IPA and Speaker Button
            HStack(spacing: 8) {
                if !word.ipa.isEmpty {
                    Text(word.ipa)
                        .font(.system(.subheadline, design: .monospaced))
                        .foregroundColor(.secondary)
                }
                
                Button {
                    synthesizer.speak(word.word)
                } label: {
                    Image(systemName: "speaker.wave.2.fill")
                        .font(.caption)
                        .foregroundColor(.blue)
                        .padding(6)
                        .background(Color.blue.opacity(0.12))
                        .clipShape(Circle())
                }
                .buttonStyle(.plain)
            }
            
            // Definition Meaning
            Text(word.vietnameseMeaning)
                .font(.system(size: 16, weight: .medium, design: .rounded))
                .foregroundColor(.primary.opacity(0.8))
                .padding(.top, 4)
            
            // Examples display matching screen 5 mockup
            if !word.exampleEnglish.isEmpty {
                Divider()
                    .padding(.vertical, 4)
                
                VStack(alignment: .leading, spacing: 8) {
                    HStack(alignment: .top, spacing: 8) {
                        Image(systemName: "speaker.wave.2")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                            .padding(.top, 2)
                        
                        VStack(alignment: .leading, spacing: 4) {
                            Text(word.exampleEnglish)
                                .font(.system(size: 14, weight: .medium, design: .rounded))
                                .foregroundColor(.secondary)
                            
                            if !word.exampleVietnamese.isEmpty {
                                Text(word.exampleVietnamese)
                                    .font(.system(size: 13, design: .rounded))
                                    .foregroundColor(.secondary.opacity(0.7))
                            }
                        }
                    }
                    
                    // Example Bordered Capsule Button
                    HStack {
                        Text("Example")
                            .font(.system(size: 11, weight: .bold, design: .rounded))
                            .foregroundColor(.blue)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 4)
                            .overlay(
                                Capsule()
                                    .stroke(Color.blue.opacity(0.5), lineWidth: 1)
                            )
                        Spacer()
                    }
                }
            }
        }
        .padding(18)
        .background(Color.appSecondarySystemGroupedBackground)
        .cornerRadius(20)
        .shadow(color: Color.black.opacity(0.04), radius: 8, x: 0, y: 4)
        .sheet(isPresented: $showingEditSheet) {
            EditWordSheet(word: word, onSave: onAction)
        }
    }
}

struct FilterPill: View {
    let title: String
    let isActive: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.system(size: 14, weight: .bold, design: .rounded))
                .foregroundColor(isActive ? .white : .primary)
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(isActive ? Color.black : Color.appSecondarySystemBackground)
                .cornerRadius(18)
        }
        .buttonStyle(.plain)
    }
}

#Preview {
    NavigationStack {
        CustomWordsView()
            .environmentObject(VocabularyStore())
    }
}

struct EditWordSheet: View {
    @EnvironmentObject var store: VocabularyStore
    @Environment(\.dismiss) var dismiss
    
    let word: Word
    let onSave: () -> Void
    
    @State private var editedWord: String
    @State private var editedIpa: String
    @State private var editedMeaning: String
    @State private var editedExampleEn: String
    @State private var editedExampleVi: String
    @State private var selectedLevel: String
    @State private var selectedTopic: String
    
    let levels = ["A1", "A2", "B1", "B2", "C1", "C2"]
    
    init(word: Word, onSave: @escaping () -> Void) {
        self.word = word
        self.onSave = onSave
        
        _editedWord = State(initialValue: word.word)
        _editedIpa = State(initialValue: word.ipa)
        _editedMeaning = State(initialValue: word.vietnameseMeaning)
        _editedExampleEn = State(initialValue: word.exampleEnglish)
        _editedExampleVi = State(initialValue: word.exampleVietnamese)
        _selectedLevel = State(initialValue: word.level)
        _selectedTopic = State(initialValue: word.topic)
    }
    
    var isSaveDisabled: Bool {
        editedWord.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ||
        editedMeaning.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }
    
    var body: some View {
        NavigationStack {
            Form {
                Section(header: Text("TỪ TIẾNG ANH")) {
                    TextField("Từ vựng", text: $editedWord)
                        .autocorrectionDisabled()
                        .appDisableAutocapitalization()
                }
                
                Section(header: Text("THÔNG TIN CHI TIẾT")) {
                    TextField("Phiên âm IPA", text: $editedIpa)
                    TextField("Nghĩa tiếng Việt", text: $editedMeaning)
                }
                
                Section(header: Text("CÂU VÍ DỤ MINH HỌA")) {
                    TextField("Ví dụ tiếng Anh", text: $editedExampleEn)
                    TextField("Dịch nghĩa tiếng Việt", text: $editedExampleVi)
                }
                
                Section(header: Text("PHÂN LOẠI")) {
                    Picker("Trình độ", selection: $selectedLevel) {
                        ForEach(levels, id: \.self) { level in
                            Text(level).tag(level)
                        }
                    }
                    
                    TextField("Chủ đề", text: $selectedTopic)
                }
            }
            .navigationTitle("Sửa từ vựng")
            #if os(iOS)
            .navigationBarTitleDisplayMode(.inline)
            #endif
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Hủy") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .confirmationAction) {
                    Button("Lưu") {
                        store.updateCustomWord(
                            id: word.id,
                            word: editedWord,
                            ipa: editedIpa,
                            meaning: editedMeaning,
                            exampleEn: editedExampleEn,
                            exampleVi: editedExampleVi,
                            topic: selectedTopic.isEmpty ? "Custom" : selectedTopic,
                            level: selectedLevel
                        )
                        onSave()
                        dismiss()
                    }
                    .disabled(isSaveDisabled)
                }
            }
        }
        #if os(macOS)
        .frame(width: 480, height: 480)
        #endif
    }
}
