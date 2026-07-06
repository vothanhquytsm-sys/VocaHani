import SwiftUI
import WebKit

struct DictionaryView: View {
    @EnvironmentObject var store: VocabularyStore
    
    @State private var searchText = ""
    @State private var suggestions: [String] = []
    @State private var selectedWord: String? = nil
    @State private var selectedDefinition: String? = nil
    
    @StateObject private var synthesizer = SpeechSynthesizer()
    
    // Auto-save feedback message
    @State private var showSavedToast = false
    
    @State private var showingAddWordSheet = false
    
    // Custom sheets fields
    @State private var newWord = ""
    @State private var newMeaning = ""
    
    var body: some View {
        VStack(spacing: 0) {
            // Mockup Header Bar
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text("VocaHani - Từ điển")
                        .font(.system(size: 13, weight: .bold, design: .rounded))
                        .foregroundColor(.secondary)
                        .tracking(0.5)
                }
                Spacer()
                
                Button {
                    showingAddWordSheet = true
                } label: {
                    Image(systemName: "plus")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(.primary)
                        .padding(10)
                        .background(Color.appSecondarySystemBackground)
                        .clipShape(Circle())
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
                        // Reactive, but this mimics a trigger action
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
            .padding(.bottom, 16)
            
            if let word = selectedWord, let definition = selectedDefinition {
                // Word Definition Display Screen
                VStack(alignment: .leading, spacing: 0) {
                    // Definition Header Bar
                    HStack(spacing: 16) {
                        Button {
                            selectedWord = nil
                            selectedDefinition = nil
                        } label: {
                            HStack(spacing: 6) {
                                Image(systemName: "chevron.left")
                                    .fontWeight(.bold)
                                Text("Quay lại")
                                    .font(.subheadline)
                                    .fontWeight(.semibold)
                            }
                        }
                        .foregroundColor(.accentColor)
                        
                        Spacer()
                        
                        // Speak word
                        Button {
                            synthesizer.speak(word)
                        } label: {
                            Image(systemName: "speaker.wave.3.fill")
                                .font(.body)
                                .foregroundColor(.white)
                                .padding(10)
                                .background(Color.accentColor)
                                .clipShape(Circle())
                        }
                        .buttonStyle(.plain)
                        
                        // Quick Save to Custom Words
                        Button {
                            saveToCustomWords(word: word, definition: definition)
                        } label: {
                            Image(systemName: "plus.circle.fill")
                                .font(.body)
                                .foregroundColor(.white)
                                .padding(10)
                                .background(Color.purple)
                                .clipShape(Circle())
                        }
                        .buttonStyle(.plain)
                    }
                    .padding()
                    .background(Color.appSecondarySystemBackground.opacity(0.5))
                    
                    // Word details header
                    VStack(alignment: .leading, spacing: 4) {
                        Text(word)
                            .font(.system(size: 32, weight: .black, design: .rounded))
                            .foregroundColor(.primary)
                    }
                    .padding(.horizontal)
                    .padding(.top, 16)
                    
                    // Rich HTML Renderer
                    HTMLView(htmlContent: definition)
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                }
                .overlay(
                    // Saved toast popup
                    VStack {
                        if showSavedToast {
                            Text("Đã lưu vào Từ của tôi! 📝")
                                .font(.subheadline)
                                .fontWeight(.bold)
                                .foregroundColor(.white)
                                .padding(.horizontal, 20)
                                .padding(.vertical, 12)
                                .background(Color.purple)
                                .cornerRadius(12)
                                .shadow(radius: 6)
                                .transition(.move(edge: .top).combined(with: .opacity))
                                .padding(.top, 24)
                            Spacer()
                        }
                    }
                    .animation(.spring(response: 0.3, dampingFraction: 0.6), value: showSavedToast)
                )
            } else {
                // Word Suggestions List Screen
                VStack(spacing: 0) {
                    if searchText.isEmpty {
                        // Empty Search State - Premium Mockup Style
                        VStack(spacing: 24) {
                            Spacer()
                            
                            // Frosted card container
                            VStack(spacing: 28) {
                                ZStack {
                                    // Glowing neon circular ring
                                    Circle()
                                        .stroke(
                                            LinearGradient(
                                                colors: [Color.blue.opacity(0.7), Color.purple.opacity(0.8), Color.cyan.opacity(0.7)],
                                                startPoint: .topLeading,
                                                endPoint: .bottomTrailing
                                            ),
                                            lineWidth: 5
                                        )
                                        .frame(width: 140, height: 140)
                                        .shadow(color: Color.purple.opacity(0.4), radius: 10)
                                    
                                    // Frosted glass background
                                    Circle()
                                        .fill(Color.white.opacity(0.12))
                                        .frame(width: 120, height: 120)
                                    
                                    // 3D-like Book icon
                                    ZStack {
                                        Image(systemName: "character.book.closed.fill")
                                            .font(.system(size: 65))
                                            .foregroundStyle(
                                                LinearGradient(
                                                    colors: [Color(red: 49/255, green: 70/255, blue: 229/255), Color.blue],
                                                    startPoint: .top,
                                                    endPoint: .bottom
                                                )
                                            )
                                        
                                        Text("A")
                                            .font(.system(size: 24, weight: .black, design: .rounded))
                                            .foregroundColor(.white)
                                            .offset(x: 2, y: -4)
                                    }
                                }
                                .padding(.top, 10)
                                
                                Text("Từ Điển Anh - Việt\nOffline")
                                    .font(.system(size: 24, weight: .bold, design: .rounded))
                                    .multilineTextAlignment(.center)
                                    .foregroundColor(.primary)
                            }
                            .padding(.horizontal, 30)
                            .padding(.vertical, 40)
                            .background(
                                RoundedRectangle(cornerRadius: 32)
                                    .fill(Color.appSecondarySystemBackground.opacity(0.35))
                                    .background(
                                        RoundedRectangle(cornerRadius: 32)
                                            .stroke(Color.white.opacity(0.4), lineWidth: 1.5)
                                    )
                            )
                            .shadow(color: .black.opacity(0.04), radius: 15, x: 0, y: 10)
                            .padding(.horizontal, 34)
                            
                            Spacer()
                        }
                    } else {
                        // Suggestions List
                        List(suggestions, id: \.self) { suggestion in
                            Button {
                                selectWord(suggestion)
                            } label: {
                                HStack {
                                    Image(systemName: "magnifyingglass")
                                        .foregroundColor(.secondary)
                                        .font(.subheadline)
                                    
                                    Text(suggestion)
                                        .fontWeight(.medium)
                                        .foregroundColor(.primary)
                                    
                                    Spacer()
                                    
                                    Image(systemName: "arrow.up.left")
                                        .foregroundColor(.secondary.opacity(0.5))
                                        .font(.caption2)
                                }
                                .padding(.vertical, 4)
                            }
                            .buttonStyle(.plain)
                        }
                        #if os(macOS)
                        .listStyle(.inset)
                        #endif
                    }
                }
            }
        }
        .sheet(isPresented: $showingAddWordSheet) {
            NavigationStack {
                Form {
                    Section(header: Text("Thông tin từ vựng")) {
                        TextField("Từ tiếng Anh", text: $newWord)
                        TextField("Nghĩa tiếng Việt", text: $newMeaning)
                    }
                }
                .navigationTitle("Thêm từ mới")
                .toolbar {
                    ToolbarItem(placement: .cancellationAction) {
                        Button("Hủy") {
                            showingAddWordSheet = false
                            newWord = ""
                            newMeaning = ""
                        }
                    }
                    ToolbarItem(placement: .confirmationAction) {
                        Button("Thêm") {
                            if !newWord.isEmpty && !newMeaning.isEmpty {
                                store.addCustomWord(
                                    word: newWord,
                                    ipa: "",
                                    meaning: newMeaning,
                                    exampleEn: "",
                                    exampleVi: "",
                                    topic: "Từ của tôi",
                                    level: "A1",
                                    symbolName: "pencil.circle.fill"
                                )
                                showingAddWordSheet = false
                                newWord = ""
                                newMeaning = ""
                            }
                        }
                        .disabled(newWord.isEmpty || newMeaning.isEmpty)
                    }
                }
            }
        }
        .onChange(of: searchText) { newValue in
            if newValue.isEmpty {
                suggestions = []
            } else {
                suggestions = DictionaryDatabase.shared.searchWords(prefix: newValue.trimmingCharacters(in: .whitespacesAndNewlines))
            }
        }
    }
    
    // MARK: - Helper Actions
    private func selectWord(_ word: String) {
        selectedWord = word
        selectedDefinition = DictionaryDatabase.shared.getDefinition(for: word)
    }
    
    private func saveToCustomWords(word: String, definition: String) {
        // Strip basic html tags to make a clean meaning representation
        let cleanMeaning = stripHTML(from: definition)
        
        // Add to active custom database
        store.addCustomWord(
            word: word,
            ipa: "",
            meaning: cleanMeaning,
            exampleEn: "",
            exampleVi: "",
            topic: "Dictionary Lookup",
            level: "A1",
            symbolName: "character.book.closed.fill"
        )
        
        // Trigger Toast HUD feedback animation
        showSavedToast = true
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
            showSavedToast = false
        }
    }
    
    private func stripHTML(from html: String) -> String {
        // Simple regex or scanner to fetch first few lines of text
        let clean = html.replacingOccurrences(of: "<[^>]+>", with: "", options: .regularExpression, range: nil)
        let lines = clean.components(separatedBy: .newlines)
            .map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }
            .filter { !$0.isEmpty }
        
        // Return first 2 non-empty lines joined together
        return lines.prefix(2).joined(separator: "; ")
    }
}

// MARK: - HTML WebKit Renderer View (Cross-Platform compatibility)
#if os(macOS)
struct HTMLView: NSViewRepresentable {
    let htmlContent: String
    
    func makeNSView(context: Context) -> WKWebView {
        let webView = WKWebView()
        return webView
    }
    
    func updateNSView(_ nsView: WKWebView, context: Context) {
        let styled = wrapHtmlInStyles(htmlContent)
        nsView.loadHTMLString(styled, baseURL: nil)
    }
}
#else
struct HTMLView: UIViewRepresentable {
    let htmlContent: String
    
    func makeUIView(context: Context) -> WKWebView {
        let webView = WKWebView()
        webView.isOpaque = false
        webView.backgroundColor = .clear
        return webView
    }
    
    func updateUIView(_ uiView: WKWebView, context: Context) {
        let styled = wrapHtmlInStyles(htmlContent)
        uiView.loadHTMLString(styled, baseURL: nil)
    }
}
#endif

// Wrap the StarDict definitions HTML nicely with Inter-style system fonts & margins
private func wrapHtmlInStyles(_ html: String) -> String {
    let brHtml = html.replacingOccurrences(of: "\n", with: "<br>")
    let css = """
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            padding: 16px;
            color: #1F2937;
            background-color: transparent;
        }
        @media (prefers-color-scheme: dark) {
            body {
                color: #F3F4F6;
            }
        }
        ul, ol {
            padding-left: 20px;
            margin-top: 8px;
        }
        li {
            margin-bottom: 8px;
        }
        br {
            margin-bottom: 6px;
        }
        /* Style standard keys */
        strong, b {
            color: #4F46E5;
        }
        @media (prefers-color-scheme: dark) {
            strong, b {
                color: #818CF8;
            }
        }
    </style>
    """
    return "<html><head><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\(css)</head><body>\(brHtml)</body></html>"
}
