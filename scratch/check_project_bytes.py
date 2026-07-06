with open("HaniVoca.xcodeproj/project.pbxproj", "rb") as f:
    data = f.read(100)
    print("First 100 bytes:", data)
    print("As string:", data.decode("utf-8", errors="replace"))
