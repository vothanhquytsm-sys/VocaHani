log_path = "/Users/voquy/.gemini/antigravity/brain/30b75604-0a17-44d0-9b3b-9e3756f6f7b0/.system_generated/logs/transcript_full.jsonl"

print("Searching log file for 'ZIM ACADEMY' or 'ZIM'...")
found = False

with open(log_path, "r", encoding="utf-8") as f:
    for idx, line in enumerate(f):
        if "ZIM" in line:
            print(f"Line {idx} matches! Size of line: {len(line)}")
            # print a sample of where it matches
            pos = line.find("ZIM")
            print("Preview:", line[max(0, pos-50):pos+150])
            found = True
            break

if not found:
    print("Could not find 'ZIM' or 'ZIM ACADEMY' in the log file.")
