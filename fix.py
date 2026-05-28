import sys

with open('/home/winover/Projetos/colin_front/index.html', 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Update toolsHtml
old_tools_check = '''      if (!isInbound && it.event_type === 'gateway.reply_received') {
        toolsHtml = `<span class="agent-tools-btn" onclick="openAgentToolsModal('${it.request_id}')" style="cursor:pointer; margin-left: 12px; font-size:1.8rem; padding: 8px 12px; background: rgba(167, 139, 250, 0.25); color: #a78bfa; border: 2px solid #a78bfa; border-radius: 8px; transition:all 0.2s; vertical-align: middle; display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 0 10px rgba(167, 139, 250, 0.4);" onmouseover="this.style.background='rgba(167, 139, 250, 0.4)';this.style.transform='scale(1.1)';" onmouseout="this.style.background='rgba(167, 139, 250, 0.25)';this.style.transform='scale(1)';" title="Ver auditoria da IA (Ferramentas/SQL)">⚙️</span>`;
      }'''

new_tools_check = '''      if (!isInbound && it.event_type === 'gateway.reply_received') {
        toolsHtml = `<span class="agent-tools-btn" onclick="openAgentToolsModal('${it.request_id}')" style="cursor:pointer; margin-left: 8px; font-size:1.1rem; opacity: 0.6; transition:all 0.2s; vertical-align: middle; display: inline-flex; align-items: center; justify-content: center;" onmouseover="this.style.opacity=1;this.style.transform='scale(1.1)';" onmouseout="this.style.opacity=0.6;this.style.transform='scale(1)';" title="Ver auditoria da IA (Ferramentas/SQL)">⚙️</span>`;
      }'''

c = c.replace(old_tools_check, new_tools_check)

# 2. Update modal colors
old_modal = '''    content.id = 'tools-modal-content';
    content.style.backgroundColor = 'var(--panel)';
    content.style.width = '80%';
    content.style.maxWidth = '800px';
    content.style.maxHeight = '80vh';
    content.style.borderRadius = '12px';
    content.style.boxShadow = '0 15px 40px rgba(0,0,0,0.6)';
    content.style.display = 'flex';
    content.style.flexDirection = 'column';
    content.style.overflow = 'hidden';
    content.style.border = '1px solid #333';
    
    const header = document.createElement('div');
    header.style.padding = '16px 20px';
    header.style.borderBottom = '1px solid #333';
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.backgroundColor = 'rgba(0,0,0,0.2)';'''

new_modal = '''    content.id = 'tools-modal-content';
    content.style.backgroundColor = '#1e293b';
    content.style.width = '80%';
    content.style.maxWidth = '800px';
    content.style.maxHeight = '80vh';
    content.style.borderRadius = '12px';
    content.style.boxShadow = '0 15px 40px rgba(0,0,0,0.6)';
    content.style.display = 'flex';
    content.style.flexDirection = 'column';
    content.style.overflow = 'hidden';
    content.style.border = '1px solid #334155';
    
    const header = document.createElement('div');
    header.style.padding = '16px 20px';
    header.style.borderBottom = '1px solid #334155';
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.backgroundColor = 'rgba(0,0,0,0.25)';'''

c = c.replace(old_modal, new_modal)

with open('/home/winover/Projetos/colin_front/index.html', 'w', encoding='utf-8') as f:
    f.write(c)

print("Done replacing.")
