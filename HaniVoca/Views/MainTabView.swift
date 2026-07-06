import SwiftUI

struct MainTabView: View {
    @State private var selectedTab = 0
    
    var body: some View {
        TabView(selection: $selectedTab) {
            NavigationStack {
                TopicListView()
            }
            .tabItem {
                Label("Chủ đề", systemImage: "square.grid.2x2.fill")
            }
            .tag(0)
            
            NavigationStack {
                PhrasesView()
            }
            .tabItem {
                Label("Cụm từ", systemImage: "bubble.left.and.bubble.right.fill")
            }
            .tag(1)
            
            NavigationStack {
                ReadingListView()
            }
            .tabItem {
                Label("Luyện đọc", systemImage: "book.fill")
            }
            .tag(2)
            
            NavigationStack {
                DictionaryView()
            }
            .tabItem {
                Label("Từ điển", systemImage: "character.book.closed.fill")
            }
            .tag(3)
            
            NavigationStack {
                CustomWordsView()
            }
            .tabItem {
                Label("Từ của tôi", systemImage: "pencil.and.outline")
            }
            .tag(4)
            
            NavigationStack {
                StatisticsView()
            }
            .tabItem {
                Label("Tiến độ", systemImage: "chart.bar.xaxis")
            }
            .tag(5)
        }
        .tint(.accentColor)
    }
}

#Preview {
    MainTabView()
        .environmentObject(VocabularyStore())
}
