import json
import re
import os

log_path = "/Users/voquy/.gemini/antigravity/brain/30b75604-0a17-44d0-9b3b-9e3756f6f7b0/.system_generated/logs/transcript_full.jsonl"

# Find the latest USER_INPUT content containing the OCR text
user_content = ""
with open(log_path, "r", encoding="utf-8") as f:
    for line in reversed(f.readlines()):
        try:
            data = json.loads(line)
            if data.get("type") == "USER_INPUT":
                user_content = data.get("content", "")
                break
        except Exception as e:
            continue

if not user_content:
    print("Error: Could not find user input in logs.")
    exit(1)

print(f"Loaded user prompt of size: {len(user_content)} characters.")

# Split the content by lines
raw_lines = user_content.split("\n")

current_topic = "General"
words_database = []
unparsed_lines = []

# Regex patterns for parsing entries
# Typically: Word [type] /IPA/ Meaning
# Example: Watercolour n /ˈwɔː.təˌkʌl.ər/ Màu nước
# Example: Test Tube n. phr /ˈtest ˌtjuːb/ Ống nghiệm
# Example: Clamp n klæmp/ Kẹp
type_pattern = r"\b(n|v|adj|adv|n\.\s*phr|v\.\s*phr|phrasal\s*v|pre|prep|pron|conj|n/v|adj/n|adj/v)\b"

# Let's clean and merge split lines first
merged_lines = []
temp_line = ""

for line in raw_lines:
    line = line.strip()
    if not line:
        continue
    
    # Check if this line is a page marker or OCR start/end
    if "==Screenshot" in line or "==Start of" in line or "==End of" in line:
        continue
        
    # Check if this is a topic header
    # Example: 1. Từ vựng về đồ dùng học tập
    topic_match = re.match(r"^\d+\.\s*Từ vựng về\s+(.+)$", line, re.IGNORECASE)
    if topic_match:
        if temp_line:
            merged_lines.append((current_topic, temp_line))
            temp_line = ""
        current_topic = topic_match.group(1).strip()
        # Clean topic name
        current_topic = current_topic.replace("...", "").strip()
        continue
        
    # Ignore index list page headers (like dot leaders "...................... 3")
    if re.search(r"\.{5,}\s*\d+", line):
        continue
        
    # If the line starts with a slash or doesn't have letters at start, it might be a continuation of the previous line's IPA/Meaning
    # Or if the previous line ended with a type and this line is an IPA or meaning
    is_continuation = False
    if temp_line:
        # If this line starts with / (IPA start)
        if line.startswith("/"):
            is_continuation = True
        # If the previous temp_line ends with a word type (e.g. "n. phr")
        elif re.search(r"\b(n|v|adj|adv|n\.\s*phr|v\.\s*phr|phrasal\s*v|pre|prep|pron|conj)\b$", temp_line):
            is_continuation = True
        # If the current line is just a meaning (all non-english chars, lowercase, etc.) and temp_line has no meaning yet
        elif not re.search(type_pattern, line) and not "/" in temp_line:
            is_continuation = True
            
    if is_continuation:
        temp_line += " " + line
    else:
        if temp_line:
            merged_lines.append((current_topic, temp_line))
        temp_line = line

if temp_line:
    merged_lines.append((current_topic, temp_line))

print(f"Grouped into {len(merged_lines)} merged candidates.")

# Parse candidates
word_counter = 1
parsed_words = []

for topic, line in merged_lines:
    # Skip column headers
    if line.lower().startswith("từ vựng từ loại") or line.lower().startswith("từ loại") or line.lower().startswith("từ vựng"):
        continue
        
    # Pattern matching
    # Word + Type + IPA + Meaning
    # We find the type token in the line
    type_match = re.search(type_pattern, line, re.IGNORECASE)
    if type_match:
        type_start, type_end = type_match.span()
        word = line[:type_start].strip()
        word_type = type_match.group(1).strip()
        
        rest = line[type_end:].strip()
        
        # Now find the IPA block in the rest of the line
        # Usually between slashes /.../ or starting with / and ending with /
        # Example: /ˈwɔː.təˌkʌl.ər/ or /pen/
        ipa_match = re.search(r"/?([^/]+)/", rest)
        if ipa_match:
            ipa = "/" + ipa_match.group(1).strip() + "/"
            ipa_start, ipa_end = ipa_match.span()
            meaning = rest[ipa_end:].strip()
            
            # Clean up meaning (remove leading commas, colons)
            meaning = re.sub(r"^[,\s:\-—]+", "", meaning).strip()
            
            # Map topic names to simplified categories if needed, or keep ZIM names
            parsed_words.append({
                "id": f"zim_{word_counter:04d}",
                "word": word,
                "ipa": ipa,
                "vietnameseMeaning": meaning,
                "exampleEnglish": "",
                "exampleVietnamese": "",
                "topic": topic,
                "level": "A1", # Will determine dynamically later
                "symbolName": "book.closed.fill",
                "isCustom": False,
                "isLearned": False,
                "isFavorite": False
            })
            word_counter += 1
        else:
            # Maybe the IPA is missing or formatted differently
            # E.g. Word type meaning
            meaning = rest.strip()
            parsed_words.append({
                "id": f"zim_{word_counter:04d}",
                "word": word,
                "ipa": "",
                "vietnameseMeaning": meaning,
                "exampleEnglish": "",
                "exampleVietnamese": "",
                "topic": topic,
                "level": "A1",
                "symbolName": "book.closed.fill",
                "isCustom": False,
                "isLearned": False,
                "isFavorite": False
            })
            word_counter += 1
    else:
        unparsed_lines.append((topic, line))

print(f"Successfully parsed: {len(parsed_words)} words.")
print(f"Unparsed lines count: {len(unparsed_lines)}")

# Save parsed words database to a preview JSON file
with open("zim_parsed_words.json", "w", encoding="utf-8") as f:
    json.dump(parsed_words, f, ensure_ascii=False, indent=4)

# Print a few samples
print("\nSample parsed words:")
for w in parsed_words[:5]:
    print(f" - [{w['topic']}] {w['word']} ({w['ipa']}): {w['vietnameseMeaning']}")

if unparsed_lines:
    print("\nSample unparsed lines:")
    for t, l in unparsed_lines[:5]:
        print(f" - [{t}] {l}")
