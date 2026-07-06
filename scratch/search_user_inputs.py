import json

log_path = "/Users/voquy/.gemini/antigravity/brain/30b75604-0a17-44d0-9b3b-9e3756f6f7b0/.system_generated/logs/transcript_full.jsonl"

with open(log_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

print(f"Total lines in log: {len(lines)}")

count = 0
for idx, line in enumerate(lines):
    try:
        data = json.loads(line)
        if data.get("type") == "USER_INPUT":
            content = data.get("content", "")
            preview = content[:80].replace("\n", " ")
            print(f"Line {idx}: size={len(content)}, preview={preview}")
            count += 1
    except Exception as e:
        continue

print(f"Found {count} USER_INPUT lines.")
