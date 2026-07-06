import json
from collections import Counter

file_path = "HaniVoca/Resources/words.json"

with open(file_path, "r", encoding="utf-8") as f:
    words = json.load(f)

print(f"Total words in JSON: {len(words)}")

topics = [w.get("topic") for w in words]
counts = Counter(topics)

print("\nWord counts per topic in JSON:")
for topic, count in counts.items():
    print(f" - '{topic}': {count} words")
