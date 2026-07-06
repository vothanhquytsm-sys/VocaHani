with open("HaniVoca.xcodeproj/project.pbxproj", "r", encoding="utf-8") as f:
    lines = f.readlines()

brace_stack = []
paren_stack = []

for idx, line in enumerate(lines):
    line_num = idx + 1
    # Strip comments
    clean_line = ""
    in_comment = False
    i = 0
    while i < len(line):
        if not in_comment and line[i:i+2] == "/*":
            in_comment = True
            i += 2
            continue
        if in_comment and line[i:i+2] == "*/":
            in_comment = False
            i += 2
            continue
        if not in_comment:
            if line[i:i+2] == "//":
                break
            clean_line += line[i]
        i += 1
        
    for char in clean_line:
        if char == "{":
            brace_stack.append(line_num)
        elif char == "}":
            if not brace_stack:
                print(f"Error: Excess closing brace '}}' at line {line_num}")
            else:
                brace_stack.pop()
        elif char == "(":
            paren_stack.append(line_num)
        elif char == ")":
            if not paren_stack:
                print(f"Error: Excess closing parenthesis ')' at line {line_num}")
            else:
                paren_stack.pop()

print("Scan finished.")
if brace_stack:
    print(f"Error: Unclosed braces starting at lines: {brace_stack}")
if paren_stack:
    print(f"Error: Unclosed parentheses starting at lines: {paren_stack}")
