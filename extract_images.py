import re
import base64
import os

html_path = 'index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

if not os.path.exists('images'):
    os.makedirs('images')

# Match pattern: key: "data:image/ext;base64,..."
pattern = re.compile(r'([a-zA-Z0-9_]+)\s*:\s*["\'](data:image/([a-zA-Z0-9]+);base64,([^"\']+))["\']')

count = 0

def replacer(match):
    global count
    key = match.group(1)
    ext = match.group(3)
    if ext == 'jpeg':
        ext = 'jpg'
    b64_data = match.group(4)
    
    file_path = f'images/{key}.{ext}'
    
    try:
        binary_data = base64.b64decode(b64_data)
        with open(file_path, 'wb') as img_file:
            img_file.write(binary_data)
        print(f"Extracted {key} to {file_path} ({len(binary_data)} bytes)")
        count += 1
    except Exception as e:
        print(f"Failed to decode {key}: {e}")
        return match.group(0) # don't replace if failed
        
    return f'{key}: "{file_path}"'

new_content = pattern.sub(replacer, content)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(new_content)
    
print(f"Done extracting {count} images.")
