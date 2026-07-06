import SwiftUI

struct PhrasesView: View {
    @EnvironmentObject var store: VocabularyStore
    @StateObject private var synthesizer = SpeechSynthesizer()
    
    var groupedPhrases: [String: [Phrase]] {
        Dictionary(grouping: store.phrases, by: { $0.category })
    }
    
    var categories: [String] {
        groupedPhrases.keys.sorted()
    }
    
    var body: some View {
        List {
            ForEach(categories, id: \.self) { category in
                Section(header: Text(category)
                            .font(.system(.subheadline, design: .rounded))
                            .fontWeight(.black)
                            .foregroundColor(.accentColor)
                            .padding(.top, 16)
                            .padding(.bottom, 6)
                            .textCase(.uppercase)
                            .tracking(1.2)
                ) {
                    ForEach(groupedPhrases[category] ?? []) { phrase in
                        VStack(alignment: .leading, spacing: 10) {
                            HStack(alignment: .center, spacing: 16) {
                                // Conversation speech bubble style
                                VStack(alignment: .leading, spacing: 6) {
                                    Text(phrase.english)
                                        .font(.system(.body, design: .rounded))
                                        .fontWeight(.bold)
                                        .foregroundColor(.primary)
                                    
                                    Text(phrase.vietnamese)
                                        .font(.subheadline)
                                        .foregroundColor(.secondary)
                                }
                                
                                Spacer()
                                
                                HStack(spacing: 12) {
                                    // Favorite Button
                                    Button {
                                        store.toggleFavorite(for: phrase)
                                    } label: {
                                        Image(systemName: phrase.isFavorite ? "heart.fill" : "heart")
                                            .font(.system(size: 20))
                                            .foregroundColor(phrase.isFavorite ? .red : .secondary)
                                            .padding(8)
                                            .background(phrase.isFavorite ? Color.red.opacity(0.1) : Color.secondary.opacity(0.08))
                                            .clipShape(Circle())
                                    }
                                    .buttonStyle(.plain)
                                    
                                    // Play Audio Button
                                    Button {
                                        synthesizer.speak(phrase.english)
                                    } label: {
                                        Image(systemName: "speaker.wave.2.circle.fill")
                                            .font(.system(size: 28))
                                            .foregroundColor(.accentColor)
                                            .background(Color.accentColor.opacity(0.12))
                                            .clipShape(Circle())
                                            .shadow(color: Color.accentColor.opacity(0.15), radius: 4)
                                    }
                                    .buttonStyle(.plain)
                                }
                            }
                            
                            // Context note if available
                            if let note = phrase.contextNote, !note.isEmpty {
                                HStack(spacing: 8) {
                                    Image(systemName: "info.circle.fill")
                                        .font(.caption2)
                                        .foregroundColor(.accentColor)
                                    Text(note)
                                        .font(.system(size: 11, weight: .medium))
                                }
                                .foregroundColor(.secondary)
                                .padding(.horizontal, 10)
                                .padding(.vertical, 6)
                                .background(Color.accentColor.opacity(0.06))
                                .cornerRadius(8)
                            }
                        }
                        .padding(.vertical, 8)
                        .listRowSeparator(.visible)
                    }
                }
                .listRowBackground(Color.clear)
            }
        }
        .navigationTitle("Cụm từ giao tiếp")
        #if os(macOS)
        .listStyle(.inset)
        #endif
        .onDisappear {
            synthesizer.stop()
        }
    }
}

#Preview {
    NavigationStack {
        PhrasesView()
            .environmentObject(VocabularyStore())
    }
}
