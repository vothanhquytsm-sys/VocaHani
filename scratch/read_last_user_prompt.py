import json

log_path = "/Users/voquy/.gemini/antigravity/brain/30b75604-0a17-44d0-9b3b-9e3756f6f7b0/.system_generated/logs/transcript_full.jsonl"

with open(log_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

print(f"Total steps in log: {len(lines)}")

# Let's inspect the last line (the user prompt for the current step)
last_line = lines[-1]
try:
    data = json.loads(last_line)
    print("Keys in step:")
    print(list(data.keys()))
    print(f"Type: {data.get('type')}")
    print(f"Source: {data.get('source')}")
    content = data.get("content", "")
    print(f"Content length: {len(content)}")
    print("Content preview:")
    print(content[:500])
except Exception as e:
    print(f"Error parsing last line: {e}")
