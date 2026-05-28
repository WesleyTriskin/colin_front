with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "const TARGET_CONTACTS = ['marcos', 'rino', 'rodrigo', 'seu_numero_aqui'];",
    "const TARGET_CONTACTS = ['marcos', 'rino', 'rodrigo', 'wesley', '11959640107'];",
    1
)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
