import json

log_path = "/Users/voquy/.gemini/antigravity/brain/30b75604-0a17-44d0-9b3b-9e3756f6f7b0/.system_generated/logs/transcript_full.jsonl"

with open(log_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

print(f"Total lines in log: {len(lines)}")

# Look at the last 10 lines, print the line index, type, source, and size of content
for idx in range(max(0, len(lines)-10), len(lines)):
    try:
        data = json.loads(lines[idx])
        content_preview = data.get("content", "")[:100].replace("\n", " ")
        print(f"Line {idx}: type={data.get('type')}, source={data.get('source')}, status={data.get('status')}, size={len(data.get('content', ''))}, preview={content_preview}")
    except Exception as e:
        print(f"Line {idx}: Error: {e}")
