import json

def analyze_examples():
    file_path = "webapp/public/data/words.json"
    with open(file_path, "r", encoding="utf-8") as f:
        words = json.load(f)
    
    total = len(words)
    empty_examples = 0
    short_examples = 0
    
    for w in words:
        ex = w.get("exampleEnglish", "").strip()
        if not ex:
            empty_examples += 1
        elif len(ex.split()) < 4:
            short_examples += 1
            
    print(f"Total words: {total}")
    print(f"Empty examples: {empty_examples} ({empty_examples/total*100:.1f}%)")
    print(f"Short examples (< 4 words): {short_examples} ({short_examples/total*100:.1f}%)")

if __name__ == "__main__":
    analyze_examples()
