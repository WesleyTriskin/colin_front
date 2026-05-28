import sys

with open('/home/winover/Projetos/colin_front/index.html', 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Update reqGroups globally
old_reqGroups = '''  // Agrupar tools pelo request_id
  const reqGroups = {};'''
new_reqGroups = '''  // Agrupar tools pelo request_id
  window.agentToolsCache = {};
  const reqGroups = window.agentToolsCache;'''
c = c.replace(old_reqGroups, new_reqGroups)

# 2. Update tools rendering in openColinChat
old_tools_check = '''      if (!isInbound && it.event_type === 'gateway.reply_received') {
        const tools = reqGroups[it.request_id]?.tools || [];
        if (tools.length > 0) {
          cursorStyle = 'cursor:pointer;';
          clickAttr = 'onclick="const b = this.nextElementSibling; b.style.display = b.style.display===\\\'none\\\' ? \\\'block\\\' : \\\'none\\\';"';
          
          
const rightAlign = !isInbound ? 'right:0;' : 'left:0;';
toolsHtml = `<div class="colin-msg-tools-box" style="display:none; position:absolute; top:100%; ${rightAlign} z-index:100; background:rgba(20, 20, 20, 0.95); padding:12px; border-radius:8px; border-left:3px solid #34d399; box-shadow:0 8px 24px rgba(0,0,0,0.6); min-width:300px; max-width:400px; max-height:300px; overflow-y:auto; margin-top:4px; backdrop-filter: blur(4px);">`;

          
          tools.forEach(t => {
            let tName = t.tool_name || t.event_type;
            let tArgs = t.tool_args ? (typeof t.tool_args === 'object' ? JSON.stringify(t.tool_args, null, 2) : t.tool_args) : (t.sql_query || '');
            toolsHtml += `<div style="margin-bottom: 8px;"><strong>${tName}</strong><br><pre style="color:#a78bfa; font-size:0.75rem; background:rgba(255,255,255,0.05); padding:6px; border-radius:4px; margin-top:4px; white-space:pre-wrap;">${tArgs}</pre></div>`;
          });
          toolsHtml += `</div>`;
        }
      }'''

new_tools_check = '''      if (!isInbound && it.event_type === 'gateway.reply_received') {
        const tools = reqGroups[it.request_id]?.tools || [];
        if (tools.length > 0) {
          toolsHtml = `<span class="agent-tools-btn" onclick="openAgentToolsModal('${it.request_id}')" style="cursor:pointer; position:absolute; bottom:2px; right:60px; font-size:0.9rem; filter: grayscale(1); opacity:0.7; transition:all 0.2s;" onmouseover="this.style.opacity=1;this.style.filter='none'" onmouseout="this.style.opacity=0.7;this.style.filter='grayscale(1)'" title="Ver logs do agente (SQL/Ferramentas)">⚙️</span>`;
        }
      }'''
c = c.replace(old_tools_check, new_tools_check)

# 3. Add openAgentToolsModal function at the end
end_script = '''</script>
</body>
</html>'''

new_end_script = '''function openAgentToolsModal(reqId) {
  let modal = document.getElementById('tools-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'tools-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.backgroundColor = 'rgba(11, 20, 26, 0.9)';
    modal.style.zIndex = '99999';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.backdropFilter = 'blur(4px)';
    modal.style.opacity = '0';
    modal.style.transition = 'opacity 0.2s ease';
    
    const content = document.createElement('div');
    content.id = 'tools-modal-content';
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
    header.style.backgroundColor = 'rgba(0,0,0,0.2)';
    
    const title = document.createElement('h3');
    title.innerText = '⚙️ Auditoria do Agente';
    title.style.margin = '0';
    title.style.color = '#e9edef';
    
    const closeBtn = document.createElement('span');
    closeBtn.innerText = '✕';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.fontSize = '1.2rem';
    closeBtn.style.color = '#a0aec0';
    closeBtn.onclick = function() {
        modal.style.opacity = '0';
        setTimeout(() => { modal.style.display = 'none'; }, 200);
    };
    
    header.appendChild(title);
    header.appendChild(closeBtn);
    
    const body = document.createElement('div');
    body.id = 'tools-modal-body';
    body.style.padding = '20px';
    body.style.overflowY = 'auto';
    body.style.color = '#e9edef';
    body.style.flex = '1';
    
    content.appendChild(header);
    content.appendChild(body);
    modal.appendChild(content);
    
    // close when clicking outside
    modal.onclick = function(e) {
        if(e.target === modal) closeBtn.onclick();
    };
    
    document.body.appendChild(modal);
  }
  
  const body = document.getElementById('tools-modal-body');
  body.innerHTML = '';
  
  const reqData = window.agentToolsCache && window.agentToolsCache[reqId];
  if (!reqData || !reqData.tools || reqData.tools.length === 0) {
      body.innerHTML = '<div style="text-align:center; padding: 40px; color: #a0aec0;">Nenhum log de ferramenta encontrado para esta resposta.</div>';
  } else {
      let html = '<div style="margin-bottom: 15px; font-size: 0.85rem; color: #a0aec0;"><strong>Request ID:</strong> ' + reqId + '</div>';
      
      reqData.tools.forEach((t, index) => {
          let tName = t.tool_name || t.event_type;
          let tArgs = t.tool_args ? (typeof t.tool_args === 'object' ? JSON.stringify(t.tool_args, null, 2) : t.tool_args) : (t.sql_query || 'Sem argumentos adicionais');
          
          let color = '#34d399';
          if (tName.includes('error') || tName.includes('failed')) color = '#ef4444';
          else if (tName.includes('sql')) color = '#60a5fa';
          else if (tName.includes('tool')) color = '#a78bfa';
          
          html += `
            <div style="margin-bottom: 20px; background: rgba(0,0,0,0.3); border-radius: 8px; border-left: 4px solid ${color}; overflow: hidden;">
                <div style="padding: 10px 15px; background: rgba(255,255,255,0.02); border-bottom: 1px solid rgba(255,255,255,0.05); font-weight: bold; color: ${color}; display: flex; justify-content: space-between;">
                    <span>${index + 1}. ${tName}</span>
                    <span style="font-size: 0.8rem; font-weight: normal; color: #6b7280;">${new Date(t.created_at).toLocaleTimeString()}</span>
                </div>
                <div style="padding: 15px;">
                    <pre style="margin: 0; white-space: pre-wrap; font-family: 'Courier New', Courier, monospace; font-size: 0.85rem; color: #d1d5db; word-break: break-all;">${tArgs}</pre>
                </div>
            </div>
          `;
      });
      body.innerHTML = html;
  }
  
  modal.style.display = 'flex';
  setTimeout(() => { modal.style.opacity = '1'; }, 10);
}

</script>
</body>
</html>'''
c = c.replace(end_script, new_end_script)

# Also fix the previous bubble which still had clickAttr
c = c.replace('class="colin-bubble" title="${toolsHtml ? \'Clique para ver o processamento interno\' : \'\'}"', 'class="colin-bubble"')
c = c.replace('<div style="position:relative; ${cursorStyle}" ${clickAttr} class="colin-bubble"', '<div style="position:relative;" class="colin-bubble"')

with open('/home/winover/Projetos/colin_front/index.html', 'w', encoding='utf-8') as f:
    f.write(c)

print('Done Step 5 UI update')
