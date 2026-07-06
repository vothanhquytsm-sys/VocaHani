import SwiftUI

struct ContentView: View {
    #if os(iOS)
    @Environment(\.horizontalSizeClass) var sizeClass
    #endif
    
    var body: some View {
        #if os(macOS)
        SidebarView()
        #else
        if sizeClass == .compact {
            MainTabView()
        } else {
            SidebarView()
        }
        #endif
    }
}

#Preview {
    ContentView()
        .environmentObject(VocabularyStore())
}
