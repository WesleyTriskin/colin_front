with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

dup = """let seenColinMsgIds = new Set();
const TARGET_CONTACTS = ['marcos', 'rino', 'rodrigo', 'seu_numero_aqui'];

function showColinAlert(contactName, messageText) {
  // Toca o alerta sonoro (pode ser bloqueado pelo navegador se não houve interação prévia)
  const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
  audio.play().catch(e => console.warn('Audio play blocked by browser:', e));

  let alertBox = document.getElementById('colin-alert-toast');
  if (!alertBox) {
    alertBox = document.createElement('div');
    alertBox.id = 'colin-alert-toast';
    alertBox.style.cssText = 'position: fixed; top: 20px; right: 20px; background: var(--blue); color: white; padding: 15px 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); z-index: 9999; transform: translateX(120%); transition: transform 0.3s ease-out; max-width: 300px; cursor: pointer;';
    document.body.appendChild(alertBox);
    alertBox.onclick = () => { alertBox.style.transform = 'translateX(120%)'; };
  }
  
  alertBox.innerHTML = `<strong>Nova mensagem de ${contactName}</strong><br><span style="font-size:0.85em; opacity:0.9;">${messageText.substring(0, 50)}${messageText.length > 50 ? '...' : ''}</span>`;
  
  requestAnimationFrame(() => {
    alertBox.style.transform = 'translateX(0)';
  });
  
  setTimeout(() => {
    if(alertBox.style.transform === 'translateX(0px)' || alertBox.style.transform === 'translateX(0)') {
        alertBox.style.transform = 'translateX(120%)';
    }
  }, 5000);
}
"""

content = content.replace(dup, "", 1) # remove one instance of the duplicate if it exists exactly

# Also wait, the first one didn't have the comment. Let's look at the diff.
# I'll just remove the second one that has the comment.

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
