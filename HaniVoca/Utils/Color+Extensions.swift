import SwiftUI

extension Color {
    /// Premium vibrant emerald green color
    static let emeraldColor = Color(red: 16/255, green: 185/255, blue: 129/255)
    
    /// Cross-platform secondary system background color
    static var appSecondarySystemBackground: Color {
        #if os(macOS)
        return Color(NSColor.windowBackgroundColor)
        #else
        return Color(UIColor.secondarySystemBackground)
        #endif
    }
    
    /// Cross-platform secondary system grouped background color
    static var appSecondarySystemGroupedBackground: Color {
        #if os(macOS)
        return Color(NSColor.controlBackgroundColor)
        #else
        return Color(UIColor.secondarySystemGroupedBackground)
        #endif
    }
    
    /// Cross-platform system background color
    static var appSystemBackground: Color {
        #if os(macOS)
        return Color(NSColor.windowBackgroundColor)
        #else
        return Color(UIColor.systemBackground)
        #endif
    }
}

extension View {
    /// Cross-platform disabled autocapitalization helper
    func appDisableAutocapitalization() -> some View {
        #if os(iOS)
        return self.textInputAutocapitalization(.never)
        #else
        return self
        #endif
    }
    
    /// Cross-platform navigation bar hidden helper
    func appNavigationBarHidden() -> some View {
        #if os(iOS)
        return self.toolbar(.hidden, for: .navigationBar)
        #else
        return self
        #endif
    }
    
    /// Cross-platform inline navigation bar title helper
    func appInlineNavigationBarTitle() -> some View {
        #if os(iOS)
        return self.navigationBarTitleDisplayMode(.inline)
        #else
        return self
        #endif
    }
}
