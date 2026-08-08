import sys

def balance_brackets(text, start_index):
    count = 0
    in_str = False
    str_char = ''
    for i in range(start_index, len(text)):
        char = text[i]
        
        # Handle strings
        if char in ["'", '"', '`'] and text[i-1] != '\\':
            if not in_str:
                in_str = True
                str_char = char
            elif str_char == char:
                in_str = False
                
        if not in_str:
            if char == '{': count += 1
            elif char == '}': 
                count -= 1
                if count == 0: return i
    return -1

with open('src/pages/UserDashboard.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

start_str = "{projectTab === 'assets' && ("
start_idx = code.find(start_str)

if start_idx == -1:
    print('Could not find start block')
    sys.exit(1)

outer_end = balance_brackets(code, start_idx)

block = code[start_idx : outer_end + 1]
with open('assets_block.txt', 'w', encoding='utf-8') as f:
    f.write(block)
print(f'Extracted {len(block)} characters.')
