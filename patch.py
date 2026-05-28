import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

replacement1 = """let colinLogs = [];
let activeColinFarm = 'gjacana';
let activeColinFarmName = 'Fazenda Jaçanã';
let activeColinPhone = null;

let seenColinMsgIds = new Set();
const TARGET_CONTACTS = ['marcos', 'rino', 'rodrigo', 'seu_numero_aqui'];

function showColinAlert(contactName, messageText) {
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
}"""

target1 = """let colinLogs = [];
let activeColinFarm = 'gjacana';
let activeColinFarmName = 'Fazenda Jaçanã';
let activeColinPhone = null;"""

content = content.replace(target1, replacement1, 1)

replacement2 = """    try { localStorage.setItem('colinLogs_' + activeColinFarm, JSON.stringify(colinLogs)); } catch(e){}
    
    let isFirstFetch = seenColinMsgIds.size === 0;
    let hasNewTargetMessage = false;
    let latestTargetName = '';
    let latestTargetMsg = '';

    colinLogs.forEach(log => {
      const logId = log.id || (log.created_at + log.phone);
      if (!seenColinMsgIds.has(logId)) {
        if (!isFirstFetch && log.event_type === 'message.received') {
          const contactName = (log.metadata && log.metadata.contact_name) ? log.metadata.contact_name : (log.phone || '');
          const contactNameLower = contactName.toLowerCase();
          
          const isTarget = TARGET_CONTACTS.some(tc => contactNameLower.includes(tc.toLowerCase()) || (log.phone && log.phone.includes(tc)));
          if (isTarget) {
            hasNewTargetMessage = true;
            latestTargetName = contactName;
            latestTargetMsg = log.text || '';
          }
        }
        seenColinMsgIds.add(logId);
      }
    });

    if (hasNewTargetMessage) {
      showColinAlert(latestTargetName, latestTargetMsg);
    }

    renderColinSidebar();"""

target2 = """    try { localStorage.setItem('colinLogs_' + activeColinFarm, JSON.stringify(colinLogs)); } catch(e){}
    renderColinSidebar();"""

content = content.replace(target2, replacement2, 1)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched index.html")
