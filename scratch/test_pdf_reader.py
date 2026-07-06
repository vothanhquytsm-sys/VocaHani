from pypdf import PdfReader

pdf_path = "/Users/voquy/.gemini/antigravity/brain/30b75604-0a17-44d0-9b3b-9e3756f6f7b0/media__1782950321825.pdf"

reader = PdfReader(pdf_path)
print(f"Total pages: {len(reader.pages)}")

# Print text of first 5 pages
for i in range(5):
    print(f"\n--- PAGE {i+1} ---")
    text = reader.pages[i].extract_text()
    print(text[:800])
