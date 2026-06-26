const FARMS_DATA = [
  { key: 'gjacana', name: 'Fazenda Jaçanã', wallet: '5683', phone: '5511963065709' },
  { key: 'fazenda_ws', name: 'Fazenda WS', wallet: '5702', phone: '5511962678385' },
  { key: 'apoloni', name: 'Grupo Apoloni', wallet: '6153', phone: '554431011106' },
  { key: 'piccini', name: 'Grupo Piccini', wallet: '6084', phone: '556631840130' }
];

const TOKENS = {
  'gjacana':    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmYXJtbmFtZSI6ImdqYWNhbmEiLCJkYm5hbWUiOiJ3YXJpbiIsInNjaGVtYW5hbWUiOiJnamFjYW5hIiwidGFibGVuYW1lIjoiaGlzdG9yaWNfbWFjaGluZV9zdW1tYXJ5X3ZpZXcifQ.roXyPCfZqINIr5kr__hw6HofFvEVlvviJOz1M-Q9ZLU',
  'fazenda_ws': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmYXJtbmFtZSI6ImZhemVuZGFfd3MiLCJkYm5hbWUiOiJ3YXJpbiIsInNjaGVtYW5hbWUiOiJmYXplbmRhX3dzIiwidGFibGVuYW1lIjoiaGlzdG9yaWNfbWFjaGluZV9zdW1tYXJ5X3ZpZXcifQ.Z6VdmyY2po001zDKItCO81aTDMH8Udk1nMrh7GW0kVs',
  'apoloni': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmYXJtbmFtZSI6IkJvYSBzb3J0ZSIsImRibmFtZSI6ImFncm9fc3RhZ2luZyIsInNjaGVtYW5hbWUiOiJhcG9sb25pIiwidGFibGVuYW1lIjoiaGlzdG9yaWNfbWFjaGluZV9zdW1tYXJ5X3ZpZXcifQ.i4PhmVsHP8yTLJK9N06TuLixUNN6p_clqFdJN9BMxTU',
  'piccini':  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmYXJtbmFtZSI6IlBpY2NpbmkiLCJkYm5hbWUiOiJhZ3JvX3N0YWdpbmciLCJzY2hlbWFuYW1lIjoicGljY2luaSIsInRhYmxlbmFtZSI6Imhpc3RvcmljX21hY2hpbmVfc3VtbWFyeV92aWV3In0.MTDfwyO9btEzOrxSaZPdHsa4fWT5VTbtjlOJqb3d4-o',
};
const BASE = 'https://prx.triskin.tech/api_data/v1';
let farm = 'gjacana';
let allLogs = [];
try {
  const cachedAllLogs = localStorage.getItem('cached_allLogs');
  if (cachedAllLogs) allLogs = JSON.parse(cachedAllLogs);
} catch (e) {}

const fmt = (d, key) => {
  const now = new Date();
  if (!d) {
    if (key === 'd1') return { text: '—', status: now.getHours() < 6 ? 'white' : 'red' };
    if (key === 'daily') return { text: '—', status: now.getHours() < 18 ? 'white' : 'red' };
    if (key === 'hour') return { text: '—', status: now.getHours() < 8 ? 'white' : 'red' };
    if (key === 'cotacoes' || key === 'noticias' || key === 'economia') return { text: '—', status: now.getHours() < 8 ? 'white' : 'red' };
    return { text: '—', status: 'red' };
  }

  const dateObj = new Date(d);
  const formatted = dateObj.toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});
  const isToday = dateObj.getDate() === now.getDate() && dateObj.getMonth() === now.getMonth() && dateObj.getFullYear() === now.getFullYear();
  const diffMs = now - dateObj;
  const diffHours = diffMs / (1000 * 60 * 60);

  if (key === 'd1') {
    // Regra para D-1: deve enviar até às 06:00 do dia atual.
    // Se hoje ainda não passou de 06:00, está em dia (verde) se o último envio foi ontem ou hoje.
    if (now.getHours() < 6) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const isYesterday = dateObj.getDate() === yesterday.getDate() && dateObj.getMonth() === yesterday.getMonth() && dateObj.getFullYear() === yesterday.getFullYear();
      const isSentYesterdayOrToday = isToday || isYesterday;
      return { text: formatted, status: isSentYesterdayOrToday ? 'green' : 'red' };
    } else {
      // Se já passou das 06:00, o envio tem que ter sido hoje
      return { text: formatted, status: isToday ? 'green' : 'red' };
    }
  }

  if (key === 'daily') {
    // Regra para Daily: deve enviar até às 18:00 do dia atual.
    if (isToday) {
      return { text: formatted, status: 'green' };
    } else {
      return { text: formatted, status: now.getHours() < 18 ? 'white' : 'red' };
    }
  }

  if (key === 'hour') {
    // Regra para Hour: a partir das 08:00, envios de 1 em 1 hora.
    if (now.getHours() < 8) {
      return { text: formatted, status: diffHours <= 1 ? 'green' : 'white' };
    } else {
      if (diffHours <= 1) {
        return { text: formatted, status: 'green' };
      } else if (diffHours <= 48) {
        return { text: formatted, status: 'yellow' };
      } else {
        return { text: formatted, status: 'red' };
      }
    }
  }

  if (key === 'hidrico') {
    // Regra para Hídrico: 1 envio a cada 15 dias.
    const diffDays = diffHours / 24;
    return { text: formatted, status: diffDays <= 15 ? 'green' : 'red' };
  }

  if (key === 'cotacoes' || key === 'noticias' || key === 'economia') {
    // Regra para Cotações / Notícias / Economia: disparam a partir das 08:00.
    if (isToday) {
      return { text: formatted, status: 'green' };
    } else {
      return { text: formatted, status: now.getHours() < 8 ? 'white' : 'red' };
    }
  }

  // Regra padrão
  return { text: formatted, status: isToday ? 'green' : 'red' };
};
// Parser de markdown WhatsApp → HTML premium
function parseWhatsApp(text) {
  if (!text) return '';
  return text
    // Escapa HTML perigoso
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    // *negrito*
    .replace(/\*([^*\n]+)\*/g, '<strong>$1</strong>')
    // _itálico_
    .replace(/_([^_\n]+)_/g, '<em>$1</em>')
    // ~tachado~
    .replace(/~([^~\n]+)~/g, '<s>$1</s>')
    // Links clicáveis
    .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank">$1</a>')
    // Quebras de linha
    .replace(/\n/g, '<br>');
}

function closeModal(){ 
  document.getElementById('modal').classList.remove('open'); 
  const m = document.getElementById('modal-body');
  m.style.background = '';
  m.style.backgroundImage = '';
  m.style.backgroundBlendMode = '';
  m.style.padding = '';
  m.style.border = '';
  m.style.maxHeight = '';
  m.style.overflow = '';
  m.style.overflowY = '';
  m.style.display = '';
  m.style.flexDirection = '';
  m.style.alignItems = '';
  const modalBox = document.querySelector('.modal-box');
  if (modalBox) modalBox.style.maxWidth = '';
}
document.getElementById('modal').addEventListener('click', e => { if(e.target===e.currentTarget) closeModal(); });
document.addEventListener('keydown', e => { 
  if(e.key === 'Escape') {
    try { closeModal(); } catch(err){}
    const toolsModal = document.getElementById('tools-modal');
    if (toolsModal && toolsModal.style.display === 'flex') {
        toolsModal.style.opacity = '0';
        setTimeout(() => { toolsModal.style.display = 'none'; }, 200);
    }
    const avatarModal = document.getElementById('avatar-modal');
    if (avatarModal && avatarModal.style.display === 'flex') {
        avatarModal.style.opacity = '0';
        setTimeout(() => { avatarModal.style.display = 'none'; }, 200);
    }
  } 
});

function switchTab(id){
  document.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('.tabcontent').forEach(c=>c.classList.remove('active'));
  
  if (id === 'overview') {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
  
  const testBtn = document.getElementById('btn-test-api');
  if(id==='api'){
    if(testBtn) testBtn.style.display = 'flex';
  } else {
    if(testBtn) testBtn.style.display = 'none';
  }

  localStorage.setItem('active_tab', id);

  if(id==='overview') {
    const btn = Array.from(document.querySelectorAll('.tab')).find(b => b.getAttribute('onclick').includes('overview'));
    if (btn) btn.classList.add('active');
    document.getElementById('tab-overview').classList.add('active');
    updateOverviewDashboard();
  } else if(id==='dashboard'){
    const btn = Array.from(document.querySelectorAll('.tab')).find(b => b.getAttribute('onclick').includes('dashboard'));
    if (btn) btn.classList.add('active');
    document.getElementById('tab-dashboard').classList.add('active');
  } else if(id==='api') {
    const btn = Array.from(document.querySelectorAll('.tab')).find(b => b.getAttribute('onclick').includes('api'));
    if (btn) btn.classList.add('active');
    document.getElementById('tab-api').classList.add('active');
    buildEndpoints(false);
  } else if(id==='colin') {
    const btn = Array.from(document.querySelectorAll('.tab')).find(b => b.getAttribute('onclick').includes('colin'));
    if (btn) btn.classList.add('active');
    document.getElementById('tab-colin').classList.add('active');
    if (colinLogs.length === 0) {
      selectColinFarm('gjacana', 'Fazenda Jaçanã');
    }
  }
}

let isDark = false;
let farmPhone = ''; // numero principal da fazenda ativa

function formatPhone(phone) {
  if (!phone) return 'Sem número';
  let p = phone.toString().replace(/\D/g, '');
  if (p.startsWith('55') && p.length > 11) p = p.substring(2);
  if (p.length === 11) return `(${p.substring(0,2)}) ${p.substring(2,7)}-${p.substring(7)}`;
  if (p.length === 10) return `(${p.substring(0,2)}) ${p.substring(2,6)}-${p.substring(6)}`;
  return phone;
}

function toggleTheme(){
  isDark = !isDark;
  document.body.classList.toggle('light', !isDark);
  document.getElementById('theme-btn').innerText = isDark ? '☀️ Modo Claro' : '🌙 Modo Escuro';
}

// Atualiza a bolinha de status no botão de cada fazenda
function setFarmDot(farmKey, status) {
  const dot = document.getElementById('dot-' + farmKey);
  if (!dot) return;
  dot.className = 'farm-dot ' + (status || 'none');
}



// Salva o status da fazenda em localStorage (sem depender de VPN/banco)
function getFarmStatus(farmKey) {
  return localStorage.getItem('farm_status_' + farmKey) || 'ok';
}

const SVG_PLACEHOLDER = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='420' viewBox='0 0 600 420'><rect width='100%' height='100%' fill='%231a2238'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Outfit, sans-serif' font-size='22' font-weight='800' fill='%234b5563'>SEM IMAGEM DISPONÍVEL</text></svg>";
const SVG_NO_ACCESS = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='420' viewBox='0 0 600 420'><rect width='100%' height='100%' fill='%231a2238'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Outfit, sans-serif' font-size='22' font-weight='800' fill='%23ef4444'>SEM ACESSO AO TOKEN JWT</text></svg>";

let slowEndpoints = [];
try {
  const cachedSlow = localStorage.getItem('slow_endpoints');
  if(cachedSlow) slowEndpoints = JSON.parse(cachedSlow);
} catch(e){}

function updateTicker() {
  const ticker = document.getElementById('ticker-content');
  let msgs = [];
  
  // O warning de tokens vazios não é mais necessário
  if (getFarmStatus('fazenda_ws') === 'ban') {
    msgs.push(`<span class="ticker-item danger">🚫 O número principal da Fazenda WS está BANIDO.</span>`);
  }

  let airflowDown = false;
  slowEndpoints.forEach(ep => {
    if (ep.ms === -1) {
      msgs.push(`<span class="ticker-item danger">🔴 Endpoint ${ep.name} está FORA DO AR ou ERRO.</span>`);
      if (ep.name.includes('Airflow')) airflowDown = true;
    } else {
      msgs.push(`<span class="ticker-item danger">🐢 Endpoint ${ep.name} demorando (${ep.ms}ms)</span>`);
    }
  });

  if (airflowDown) {
    document.body.classList.add('critical-error');
  } else {
    document.body.classList.remove('critical-error');
  }

  if (msgs.length === 0) msgs.push(`<span class="ticker-item info">✅ Todos os sistemas e endpoints operacionais.</span>`);
  
  const content = msgs.join('<span style="color:var(--muted); margin: 0 40px;"> • </span>') + '<span style="color:var(--muted); margin: 0 40px;"> • </span>';
  document.getElementById('ticker-content').innerHTML = content;
  document.getElementById('ticker-content-clone').innerHTML = content;

  // Ajusta a velocidade da barra dinamicamente para não correr
  const textContent = msgs.join(' ').replace(/<[^>]*>?/gm, '');
  const duration = Math.max(30, textContent.length * 0.35);
  document.querySelectorAll('.ticker').forEach(t => t.style.animationDuration = duration + 's');
  
  try {
    localStorage.setItem('slow_endpoints', JSON.stringify(slowEndpoints));
  } catch(e){}
}



// Carrega os dots de todas as fazendas do localStorage
function loadAllFarmDots() {
  ['gjacana','fazenda_ws','apoloni','piccini'].forEach(fk => {
    setFarmDot(fk, getFarmStatus(fk));
  });
  updateTicker();
}

function selectFarm(key, name, wallet, phone){
  farm = key;
  document.querySelectorAll('.fbtn').forEach(b=>b.classList.remove('active'));
  document.getElementById('btn-'+key).classList.add('active');
  
  document.getElementById('farm-wallet-info').innerHTML = `Fazenda: <b style="color:var(--text)">${name}</b> &nbsp;&nbsp;|&nbsp;&nbsp; Carteira: <b style="color:var(--text)">${wallet}</b> &nbsp;&nbsp;|&nbsp;&nbsp; Disparo: <b style="color:var(--text)">${formatPhone(phone)}</b>`;
  
  farmPhone = phone;
  fetchLogs();
}

function findNearestImage(logs, textLog){
  if (!textLog) return null;
  const textTime = new Date(textLog.sent_at).getTime();
  let closestImg = null;
  let minDiff = Infinity;

  logs.forEach(l => {
    if (l.message_type === 'image' && l.phone_number === textLog.phone_number) {
      const imgTime = new Date(l.sent_at).getTime();
      const diff = Math.abs(textTime - imgTime);
      // Garante que a imagem foi enviada em até 5 minutos (300.000 ms) do texto do relatório
      if (diff < minDiff && diff < 5 * 60 * 1000) {
        minDiff = diff;
        closestImg = l.message_content;
      }
    }
  });
  return closestImg;
}


function setImg(id, src){
  const el = document.getElementById(id);
  el.src = src || SVG_PLACEHOLDER;
}

const logsCache = {};
const contactsCache = {};

async function fetchLogs(){
  const activeFarmAtStart = farm;
  const token = TOKENS[activeFarmAtStart];
  
  const processAndApplyLogs = (logs, targetFarm) => {
    // Sincroniza logs no allLogs global
    allLogs = allLogs.filter(l => l.farm_key !== targetFarm).concat(logs);

    // Se o usuário mudou de fazenda durante a requisição, ignora para evitar tab bleeding
    if (farm !== targetFarm) return;

    const fl = logs.filter(l => l.farm_key === targetFarm);
    const findByType = (type) => fl.find(l => (l.report_type === type || getReportType(l.message_content) === type) && l.message_type === 'text');

    const d1txt    = findByType('d1') || fl.find(l => l.message_type === 'text' && getReportType(l.message_content) === 'D-1');
    const dailytxt = findByType('daily') || fl.find(l => l.message_type === 'text' && getReportType(l.message_content) === 'Daily');
    const hourtxt  = findByType('hour') || fl.find(l => l.message_type === 'text' && getReportType(l.message_content) === 'Hour');
    const hidrtxt  = findByType('irrigacao') || fl.find(l => l.message_type === 'text' && getReportType(l.message_content) === 'Hídrico');
    const idletxt  = findByType('idle') || fl.find(l => l.message_type === 'text' && getReportType(l.message_content) === 'idle');
    const margintxt  = findByType('margin') || fl.find(l => l.message_type === 'text' && getReportType(l.message_content) === 'margin');
    const productivitytxt  = findByType('productivity') || fl.find(l => l.message_type === 'text' && getReportType(l.message_content) === 'productivity');
    const revenuetxt  = findByType('revenue') || fl.find(l => l.message_type === 'text' && getReportType(l.message_content) === 'revenue');
    const topratestxt  = findByType('top_rates') || fl.find(l => l.message_type === 'text' && getReportType(l.message_content) === 'top_rates');
    
    const marketLogs = fl.filter(l => (l.report_type === 'market' || getReportType(l.message_content) === 'Market') && l.message_type === 'text');
    const cotqtxt  = marketLogs.find(l => l.message_content.toUpperCase().includes('COTAÇÕES'));
    const notixtxt = marketLogs.find(l => l.message_content.toUpperCase().includes('SÍNTESE'));
    const ecotxt   = marketLogs.find(l => l.message_content.toUpperCase().includes('ECONOMIA'));

    const apply = (key, log) => {
      const msgEl = document.getElementById('msg-'+key);
      msgEl.style.opacity = '0';
      msgEl.innerHTML = log
        ? parseWhatsApp(log.message_content)
        : `<i style="color:var(--muted)">Nenhum envio encontrado nos logs.</i>`;
      requestAnimationFrame(() => {
        msgEl.style.transition = 'opacity 0.25s ease';
        msgEl.style.opacity = '1';
      });
      const timeEl = document.getElementById('time-'+key);
      const res = fmt(log ? log.sent_at : null, key);
      timeEl.innerText = res.text;
      
      // Reseta estilos de borda e cor
      timeEl.style.borderColor = "";
      timeEl.style.color = "";
      timeEl.style.background = "";
      
      if (res.status === 'red') {
        timeEl.style.borderColor = "var(--red)";
        timeEl.style.color = "var(--red)";
        timeEl.style.background = "rgba(248, 113, 113, 0.1)";
      } else if (res.status === 'green') {
        timeEl.style.borderColor = "var(--green)";
        timeEl.style.color = "var(--green)";
        timeEl.style.background = "rgba(34, 211, 160, 0.1)";
      } else if (res.status === 'yellow') {
        timeEl.style.borderColor = "var(--yellow)";
        timeEl.style.color = "var(--yellow)";
        timeEl.style.background = "rgba(251, 191, 36, 0.1)";
      }
    };

    apply('d1',       d1txt);
    apply('daily',    dailytxt);
    apply('hour',     hourtxt);
    apply('hidrico',  hidrtxt);
    apply('idle',     idletxt);
    apply('margin',   margintxt);
    apply('productivity', productivitytxt);
    apply('revenue',  revenuetxt);
    apply('top_rates',topratestxt);
    apply('cotacoes', cotqtxt);
    apply('noticias', notixtxt);
    apply('economia', ecotxt);

    const getImgFor = (type, txtLog) => {
      const imgLog = fl.find(l => (l.report_type === type || getReportType(l.message_content) === type) && l.message_type === 'image');
      if (imgLog) return imgLog.message_content.startsWith('data:') ? imgLog.message_content : `data:image/jpeg;base64,${imgLog.message_content}`;
      return txtLog ? findNearestImage(fl, txtLog) : null;
    };

    setImg('img-d1',     getImgFor('d1', d1txt));
    setImg('img-daily',  getImgFor('daily', dailytxt));
    setImg('img-hour',   getImgFor('hour', hourtxt));
    setImg('img-hidrico',getImgFor('irrigacao', hidrtxt));
    setImg('img-idle',   getImgFor('idle', idletxt));
    setImg('img-margin', getImgFor('margin', margintxt));
    setImg('img-productivity', getImgFor('productivity', productivitytxt));
    setImg('img-revenue',getImgFor('revenue', revenuetxt));
    setImg('img-top_rates', getImgFor('top_rates', topratestxt));
  };

  // Se não tem token, exibe mensagem apropriada
  if(!token){
    ['d1','daily','hour','hidrico','cotacoes','noticias','economia'].forEach(k=>{
      document.getElementById('msg-'+k).innerHTML = '<i style="color:var(--yellow)">Token JWT não cadastrado para esta fazenda.</i>';
      document.getElementById('time-'+k).innerHTML = '—';
      const imgEl = document.getElementById('img-'+k);
      if(imgEl) imgEl.src = SVG_NO_ACCESS;
    });
    loadContacts();
    return;
  }

  // Se já temos os logs em cache para esta fazenda, aplica IMEDIATAMENTE!
  if (logsCache[activeFarmAtStart]) {
    processAndApplyLogs(logsCache[activeFarmAtStart], activeFarmAtStart);
    loadContacts();
  } else {
    // Se não está no cache, exibe "Carregando..." temporariamente para evitar piscada vazia
    ['d1','daily','hour','hidrico','cotacoes','noticias','economia'].forEach(k=>{
      document.getElementById('msg-'+k).innerText = 'Carregando...';
      document.getElementById('time-'+k).innerHTML = '—';
    });
  }

  // Sincroniza em background
  try {
    const r = await fetch(`${BASE}/chat/logs?limit=200`, {headers:{'X-Encrypted-Token':token}});
    if(!r.ok) throw new Error('API retornou '+r.status);
    const freshLogs = await r.json();
    
    // Atualiza cache e aplica dados na tela
    logsCache[activeFarmAtStart] = freshLogs;
    processAndApplyLogs(freshLogs, activeFarmAtStart);
    loadContacts();
  } catch(e){
    console.error("Erro ao atualizar logs:", e);
    if (!logsCache[activeFarmAtStart] && farm === activeFarmAtStart) {
      ['d1','daily','hour','hidrico','cotacoes','noticias','economia'].forEach(k=>{
        document.getElementById('msg-'+k).innerHTML = `<span style="color:var(--red)">Erro: ${e.message}</span>`;
      });
    }
  }
}

// ── SISTEMA DE AUDITORIA DE LOGS DE ENVIOS ──────────────────────────────
let currentLogs = [];
let allFarmsContacts = [];
const contactMap = {};

function getCalendarDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
}

function getReportType(content) {
  if (!content) return null;
  const c = content.toUpperCase();
  if (c.includes('RELATÓRIO OPERACIONAL')) return 'D-1';
  if (c.includes('FECHAMENTO DIÁRIO')) return 'Daily';
  if (c.includes('RELATÓRIO HORÁRIO')) return 'Hour';
  if (c.includes('BALANÇO HÍDRICO') || c.includes('BALANÇO DE ÁGUA') || c.includes('IRRIGAÇÃO') || c.includes('PIVÔ') || c.includes('PIVOS')) return 'Hídrico';
  if (c.includes('COTAÇÕES DO DIA') || c.includes('SÍNTESE GERAL') || c.includes('ECONOMIA & POLÍTICA') || c.includes('ECONOMIA &AMP; POLÍTICA')) return 'Market';
  if (c.includes('MÁQUINAS INATIVAS') || c.includes('IDLE')) return 'idle';
  if (c.includes('MARGEM') || c.includes('RENTABILIDADE')) return 'margin';
  if (c.includes('PRODUTIVIDADE') || c.includes('COLHEITA')) return 'productivity';
  if (c.includes('RECEITA') || c.includes('VENDAS')) return 'revenue';
  if (c.includes('TOP RATES') || c.includes('TAXAS')) return 'top_rates';
  return null;
}

function formatPhone(num) {
  if (!num) return '—';
  let clean = num.replace(/\D/g, '');
  if (clean.startsWith('55') && clean.length >= 12) {
    const ddd = clean.substring(2, 4);
    const rest = clean.substring(4);
    if (rest.length === 9) {
      return `+55 (${ddd}) ${rest.substring(0, 5)}-${rest.substring(5)}`;
    } else {
      return `+55 (${ddd}) ${rest.substring(0, 4)}-${rest.substring(4)}`;
    }
  }
  return `+${clean}`;
}

async function loadContacts() {
  const activeFarmAtStart = farm;
  const tbody = document.getElementById('tbody');
  const token = TOKENS[activeFarmAtStart] || TOKENS['gjacana'];
  
  const processAndApplyContacts = (contacts, targetFarm) => {
    // Se o usuário mudou de fazenda durante a requisição, ignora
    if (farm !== targetFarm) return;

    // Limpa dicionário anterior para evitar vazamento entre fazendas
    for (const key in contactMap) delete contactMap[key];
    
    const contactsList = Array.isArray(contacts) ? contacts : (contacts.contacts || []);
    contactsList.forEach(c => {
      if (c.phone_number) {
        contactMap[c.phone_number] = c.contact_name;
      }
    });

    const activeFarmLogs = allLogs.filter(l => l.farm_key === targetFarm);
    currentLogs = activeFarmLogs;

    populateFilterSelects(activeFarmLogs);
    renderLogsTable();
  };

  // Se já temos contatos em cache, aplica IMEDIATAMENTE!
  if (contactsCache[activeFarmAtStart]) {
    processAndApplyContacts(contactsCache[activeFarmAtStart], activeFarmAtStart);
  }

  try {
    const r = await fetch(`${BASE}/farms/contacts`, {headers:{'X-Encrypted-Token':token}});
    if (r.ok) {
      const freshContacts = await r.json();
      contactsCache[activeFarmAtStart] = freshContacts;
      processAndApplyContacts(freshContacts, activeFarmAtStart);
    }
  } catch(e) {
    console.warn("Erro ao buscar contatos da API:", e);
    if (!contactsCache[activeFarmAtStart] && farm === activeFarmAtStart) {
      tbody.innerHTML = `<tr><td colspan="7" style="color:var(--red);text-align:center;padding:20px">Erro ao carregar contatos: ${e.message}</td></tr>`;
    }
  }
}

function populateFilterSelects(logs) {
  const filterName = document.getElementById('filter-name');
  const filterPhone = document.getElementById('filter-phone');
  const filterDay = document.getElementById('filter-day');

  const selectedName = filterName.value;
  const selectedPhone = filterPhone.value;
  const selectedDay = filterDay.value;

  const names = new Set();
  const phones = new Set();
  const days = new Set();

  logs.forEach(l => {
    if (l.phone_number) {
      phones.add(l.phone_number);
      const name = contactMap[l.phone_number] || 'Contato Externo';
      names.add(name);
    }
    if (l.sent_at) {
      days.add(getCalendarDate(l.sent_at));
    }
  });

  const sortedNames = Array.from(names).sort();
  const sortedPhones = Array.from(phones).sort();
  const sortedDays = Array.from(days).sort((a, b) => {
    const parseDate = s => {
      const [d, m] = s.split('/');
      return new Date(2026, parseInt(m) - 1, parseInt(d));
    };
    return parseDate(b) - parseDate(a);
  });

  filterName.innerHTML = '<option value="">Todos os Nomes</option>';
  sortedNames.forEach(n => {
    filterName.innerHTML += `<option value="${n}">${n}</option>`;
  });

  filterPhone.innerHTML = '<option value="">Todos os Telefones</option>';
  sortedPhones.forEach(p => {
    filterPhone.innerHTML += `<option value="${p}">${formatPhone(p)}</option>`;
  });

  filterDay.innerHTML = '<option value="">Todos os Dias</option>';
  sortedDays.forEach(d => {
    filterDay.innerHTML += `<option value="${d}">${d}</option>`;
  });

  if (sortedNames.includes(selectedName)) filterName.value = selectedName;
  if (sortedPhones.includes(selectedPhone)) filterPhone.value = selectedPhone;
  if (sortedDays.includes(selectedDay)) filterDay.value = selectedDay;
}

function renderLogsTable() {
  const tbody = document.getElementById('tbody');
  const filterName = document.getElementById('filter-name').value;
  const filterPhone = document.getElementById('filter-phone').value;
  const filterDay = document.getElementById('filter-day').value;

  const activeFarmLogs = allLogs.filter(l => l.farm_key === farm);

  // Group by phone and day
  const groups = {};
  activeFarmLogs.forEach(l => {
    if (!l.phone_number) return;
    const day = getCalendarDate(l.sent_at);
    const key = `${l.phone_number}_${day}`;
    if (!groups[key]) {
      groups[key] = {
        phone_number: l.phone_number,
        name: contactMap[l.phone_number] || 'Contato Externo',
        day: day,
        logs: []
      };
    }
    groups[key].logs.push(l);
  });

  let rows = Object.values(groups);

  if (filterName) {
    rows = rows.filter(r => r.name === filterName);
  }
  if (filterPhone) {
    rows = rows.filter(r => r.phone_number === filterPhone);
  }
  if (filterDay) {
    rows = rows.filter(r => r.day === filterDay);
  }

  rows.sort((a, b) => {
    const parseDate = s => {
      const [d, m] = s.split('/');
      return new Date(2026, parseInt(m) - 1, parseInt(d));
    };
    const dateDiff = parseDate(b.day) - parseDate(a.day);
    if (dateDiff !== 0) return dateDiff;
    return a.phone_number.localeCompare(b.phone_number);
  });

  if (rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="12" style="text-align:center;color:var(--muted);padding:30px">Nenhum log de disparo atende aos filtros selecionados.</td></tr>`;
    return;
  }

  tbody.innerHTML = '';
  rows.forEach(r => {
    const phone = r.phone_number;
    const day = r.day;
    const name = r.name;

    const getColContent = (type) => {
      if (type === 'market') {
        const hasMarket = r.logs.some(l => l.message_type === 'text' && (l.report_type === 'market' || getReportType(l.message_content) === 'Market'));
        if (!hasMarket) return '<span style="color:var(--muted)">—</span>';
        return `<div style="display:flex; flex-direction:column; gap:4px; align-items:center;">
          <button class="btn-view-msg" style="width:100%; border:none; padding:4px 8px; border-radius:4px; font-size:0.75rem; font-weight:700; background:rgba(59,130,246,0.15); color:var(--blue); cursor:pointer;" onclick="openMessage('${phone}', '${day}', 'market', 'text')">💬 Texto</button>
        </div>`;
      }

      const textLog = r.logs.find(l => l.message_type === 'text' && (l.report_type === type || getReportType(l.message_content) === type));
      if (!textLog) return '<span style="color:var(--muted)">—</span>';

      const imgData = r.logs.find(l => l.message_type === 'image' && (l.report_type === type || (findNearestImage(activeFarmLogs, textLog) && findNearestImage(activeFarmLogs, textLog).id === l.id)));

      let html = '<div style="display:flex; flex-direction:column; gap:4px; align-items:center;">';
      html += `<button class="btn-view-msg" style="width:100%; border:none; padding:4px 8px; border-radius:4px; font-size:0.75rem; font-weight:700; background:rgba(59,130,246,0.15); color:var(--blue); cursor:pointer;" onclick="openMessage('${phone}', '${day}', '${type}', 'text')">💬 Texto</button>`;
      
      if (imgData || findNearestImage(activeFarmLogs, textLog)) {
        html += `<button class="btn-view-msg" style="width:100%; border:none; padding:4px 8px; border-radius:4px; font-size:0.75rem; font-weight:700; background:rgba(16,185,129,0.15); color:var(--green); cursor:pointer;" onclick="openMessage('${phone}', '${day}', '${type}', 'image')">🖼️ Mapa</button>`;
      }
      html += '</div>';
      return html;
    };

    tbody.innerHTML += `
      <tr>
        <td>
          <div style="font-weight:700; color:var(--text); font-size:0.95rem;">${name}</div>
          <div style="color:var(--muted); font-size:0.8rem; margin-top:2px;">${formatPhone(phone)}</div>
        </td>
        <td>
          <span style="font-weight:600; color:var(--primary); font-size:0.9rem;">${day}</span>
        </td>
        <td style="text-align:center;">${getColContent('d1')}</td>
        <td style="text-align:center;">${getColContent('daily')}</td>
        <td style="text-align:center;">${getColContent('hour')}</td>
        <td style="text-align:center;">${getColContent('irrigacao')}</td>
        <td style="text-align:center;">${getColContent('market')}</td>
        <td style="text-align:center;">${getColContent('productivity')}</td>
        <td style="text-align:center;">${getColContent('revenue')}</td>
        <td style="text-align:center;">${getColContent('margin')}</td>
        <td style="text-align:center;">${getColContent('top_rates')}</td>
        <td style="text-align:center;">${getColContent('idle_machine')}</td>
      </tr>
    `;
  });
}

function openMessage(phone, date, type, format) {
  const activeFarmLogs = allLogs.filter(l => l.farm_key === farm);
  const fl = activeFarmLogs.filter(l => l.phone_number === phone && getCalendarDate(l.sent_at) === date);

  const modal = document.getElementById('modal');
  const mTitle = document.getElementById('modal-title');
  const mBody = document.getElementById('modal-body');

  mBody.innerHTML = '';
  // Reseta estilos prévios
  mBody.style.background = '';
  mBody.style.backgroundImage = '';
  mBody.style.backgroundBlendMode = '';
  mBody.style.padding = '';
  mBody.style.border = '';
  mBody.style.maxHeight = '';
  mBody.style.overflow = '';
  mBody.style.overflowY = '';
  mBody.style.display = '';
  mBody.style.flexDirection = '';
  mBody.style.alignItems = '';

  const modalBox = document.querySelector('.modal-box');
  if (modalBox) {
    if (type === 'market') {
      modalBox.style.maxWidth = '1300px';
    } else {
      modalBox.style.maxWidth = ''; // Restaura o padrão de 820px do CSS
    }
  }

  if (format === 'image') {
    const imgDataLog = fl.find(l => l.message_type === 'image' && (l.report_type === type || getReportType(l.message_content) === type));
    if (!imgDataLog) {
      alert("Mapa correspondente não encontrado nos logs.");
      return;
    }

    mTitle.innerText = `${type.toUpperCase()} — Visualização do Mapa (${date})`;
    
    let formattedSrc = imgDataLog.message_content;
    if (!formattedSrc.startsWith('data:')) {
      formattedSrc = `data:image/jpeg;base64,${formattedSrc}`;
    }

    // Estilo premium para o visualizador de mapa
    mBody.style.background = 'transparent';
    mBody.style.border = 'none';
    mBody.style.padding = '0';
    mBody.style.maxHeight = 'none';
    mBody.style.overflow = 'visible';

    mBody.innerHTML = `
      <div style="display:flex; justify-content:center; align-items:center; background:#0e1117; padding:20px; border-radius:12px; border:1px solid var(--border); max-height:70vh; overflow:auto;">
        <img src="${formattedSrc}" style="max-width:100%; max-height:65vh; border-radius:8px; box-shadow:0 10px 40px rgba(0,0,0,0.5); object-fit:contain;" alt="Mapa do Relatório">
      </div>
    `;
    modal.classList.add('open');
  } else {
    if (type === 'market') {
      const marketLogs = fl.filter(l => l.message_type === 'text' && (l.report_type === 'market' || getReportType(l.message_content) === 'Market'));
      if (marketLogs.length === 0) {
        alert("Mensagens de mercado não encontradas.");
        return;
      }

      // Ordena por horário de envio
      marketLogs.sort((a, b) => new Date(a.sent_at) - new Date(b.sent_at));

      mTitle.innerText = `Market — Relatórios do Dia (${date})`;

      // Visual de chat do WhatsApp
      mBody.style.background = '#0b141a';
      mBody.style.backgroundImage = "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')";
      mBody.style.backgroundBlendMode = 'overlay';
      mBody.style.padding = '24px';
      mBody.style.border = '1px solid rgba(255,255,255,0.05)';
      mBody.style.maxHeight = '65vh';
      mBody.style.overflowY = 'auto';
      mBody.style.display = 'flex';
      mBody.style.flexDirection = 'row';
      mBody.style.flexWrap = 'wrap';
      mBody.style.gap = '20px';
      mBody.style.alignItems = 'stretch';
      mBody.style.justifyContent = 'center';

      let itemsHtml = '';
      marketLogs.forEach(log => {
        const parsedText = parseWhatsApp(log.message_content || '');
        const timeStr = new Date(log.sent_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        let title = 'Mercado';
        const txt = log.message_content || '';
        const uc = txt.toUpperCase();
        if (uc.includes('COTAÇÕES')) title = '📊 Cotações do Dia';
        else if (uc.includes('SÍNTESE')) title = '📰 Síntese Geral';
        else if (uc.includes('ECONOMIA')) title = '💼 Economia & Política';

        itemsHtml += `
          <div style="flex: 1 1 300px; min-width: 280px; max-width: 400px; background: #202c33; color: #e9edef; padding: 16px; border-radius: 10px; box-shadow: 0 1px 0.5px rgba(0,0,0,0.13); font-family: inherit; font-size: 0.95rem; line-height: 1.6; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="font-weight: 800; font-size: 1.05rem; color: var(--primary); margin-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 6px;">${title}</div>
              <div style="white-space: pre-wrap; word-break: break-word; text-align: left;">${parsedText}</div>
            </div>
            <div style="text-align: right; font-size: 0.72rem; color: #8696a0; margin-top: 12px;">${timeStr}</div>
          </div>
        `;
      });

      mBody.innerHTML = itemsHtml;
      modal.classList.add('open');
    } else {
      const textLog = fl.find(l => l.message_type === 'text' && (l.report_type === type || getReportType(l.message_content) === type));
      if (!textLog) {
        alert("Mensagem de texto não encontrada.");
        return;
      }
      mTitle.innerText = `${type.toUpperCase()} — Mensagem do WhatsApp (${date})`;
      const parsedText = parseWhatsApp(textLog.message_content || '');

      mBody.style.background = '#0b141a';
      mBody.style.backgroundImage = "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')";
      mBody.style.backgroundBlendMode = 'overlay';
      mBody.style.padding = '24px';
      mBody.style.border = '1px solid rgba(255,255,255,0.05)';
      mBody.style.maxHeight = '60vh';
      mBody.style.overflowY = 'auto';
      mBody.style.display = 'flex';
      mBody.style.flexDirection = 'column';
      mBody.style.alignItems = 'flex-start';

      mBody.innerHTML = `
        <div style="background: #202c33; color: #e9edef; padding: 12px 16px; border-radius: 0 10px 10px 10px; max-width: 85%; box-shadow: 0 1px 0.5px rgba(0,0,0,0.13); font-family: inherit; font-size: 1.05rem; line-height: 1.6; white-space: pre-wrap; word-break: break-word; text-align: left;">
          ${parsedText}
          <div style="text-align: right; font-size: 0.72rem; color: #8696a0; margin-top: 6px;">${new Date(textLog.sent_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
        </div>
      `;
      modal.classList.add('open');
    }
  }
}


// ── ENDPOINTS ──────────────────────────────────────────────
const ENDPOINTS = [
  {section:'Sistema & Chat'},
  {name:'Root / Status',          path:'/'},
  {name:'Chat Logs',              path:'/chat/logs'},
  {name:'Chat Contacts',          path:'/chat/contacts'},
  {section:'Commodities & Mercado'},
  {name:'Commodities Overview',   path:'/commodities/overview'},
  {name:'Commodities Quotes',     path:'/commodities/quotes'},
  {name:'Market News',            path:'/commodities/news'},
  {name:'Price Snapshot',         path:'/commodities/prices'},
  {section:'Clima & Irrigação'},
  {name:'Weather Forecast',       path:'/weather/forecast?city=sao_paulo&state=SP'},
  {name:'Weather History',        path:'/weather/history'},
  {name:'Farm Forecast',          path:'/weather/farm-forecast'},
  {name:'Valley History',         path:'/valley/history'},
  {section:'Máquinas'},
  {name:'Machine Alerts',         path:'/machines/alerts'},
  {name:'Alerts History',         path:'/machines/alerts_history'},
  {name:'Mechanization',          path:'/machines/mechanization'},
  {name:'Machine Summary',        path:'/machines/summary'},
  {name:'Summary History',        path:'/machines/summary_history'},
  {section:'Produção'},
  {name:'Profitability',          path:'/production/profitability'},
  {name:'Costs',                  path:'/production/costs'},
  {name:'Sales',                  path:'/production/sales'},
  {name:'Harvest',                path:'/production/harvest'},
  {name:'Profit View',            path:'/production/profit/view'},
  {name:'Rentabilidade Dashboard',path:'/production/rentabilidade-dash'},
  {section:'Infraestrutura Interna'},
  {name:'Airflow Status',         path:'/infra/ping?target=http://172.21.0.149:8080/health'},
  {name:'Agentes 147',            path:'/infra/ping?target=https://prx.triskin.tech/api_agents_new/docs'},
  {name:'Agentes 150',            path:'/infra/ping?target=https://prx.triskin.tech/api_data/docs'},
];

async function showPayload(path){
  document.getElementById('modal-title').innerText = 'GET '+path;
  document.getElementById('modal-body').innerText = 'Carregando payload...';
  document.getElementById('modal').classList.add('open');
  try {
    const token = TOKENS[farm] || TOKENS['gjacana'];
    let url, headers, fetchOpts = {};
    if(path.startsWith('http')) {
      url = path;
      headers = {};
      fetchOpts = { mode: 'no-cors' };
    } else {
      const sep = path.includes('?') ? '&' : '?';
      url = `${BASE}${path}${sep}limit=2`;
      headers = {'X-Encrypted-Token':token};
    }
    const r = await fetch(url, {headers, ...fetchOpts});
    if (r.type === 'opaque') {
      document.getElementById('modal-body').innerText = "Resposta opaca (no-cors). O serviço respondeu, mas o navegador bloqueou a leitura do corpo da resposta (CORS).";
      return;
    }
    let d;
    try { d = await r.json(); } catch(err) { d = await r.text(); }
    document.getElementById('modal-body').innerText = typeof d === 'string' ? d : JSON.stringify(d,null,2);
  } catch(e){
    document.getElementById('modal-body').innerText = 'Erro: '+e.message;
  }
}

let isTestingEndpoints = false;

function buildEndpoints(force = false){
  const grid = document.getElementById('api-grid');
  
  if(!grid.children.length){
    let html = '';
    let currentSectionClass = 'section-sistema';
    ENDPOINTS.forEach((ep, i) => {
      if(ep.section){
        html += `<div class="api-section-label">${ep.section}</div>`;
        if (ep.section.includes('Sistema')) currentSectionClass = 'section-sistema';
        else if (ep.section.includes('Commodities') || ep.section.includes('Mercado')) currentSectionClass = 'section-commodities';
        else if (ep.section.includes('Clima') || ep.section.includes('Irrigação')) currentSectionClass = 'section-clima';
        else if (ep.section.includes('Máquinas')) currentSectionClass = 'section-maquinas';
        else if (ep.section.includes('Produção')) currentSectionClass = 'section-producao';
      } else {
        html += `<div class="api-card ${currentSectionClass}" id="acard-${i}" onclick="showPayload('${ep.path}')">
          <div class="api-card-left">
            <span class="api-name">${ep.name}</span>
            <div class="api-path-wrapper">
              <span class="api-method-badge get">GET</span>
              <span class="api-path">${ep.path}</span>
            </div>
          </div>
          <div class="api-right">
            <span class="led checking" id="led-${i}"></span>
            <span class="lat" id="lat-${i}">...</span>
          </div>
        </div>`;
      }
    });
    grid.innerHTML = html;
  }

  // Caching de 30 minutos das requisições para poupar a API de sobrecarga
  const cacheKey = 'api_health_cache';
  const cacheTimeKey = 'api_health_cache_time';
  const cacheData = localStorage.getItem(cacheKey);
  const cacheTime = localStorage.getItem(cacheTimeKey);
  const isCacheValid = cacheData && cacheTime && (Date.now() - parseInt(cacheTime) < 60 * 60 * 1000);

  if(cacheData && !force) {
    try {
      const results = JSON.parse(cacheData);
      results.forEach(res => {
        const led = document.getElementById('led-'+res.index);
        const lat = document.getElementById('lat-'+res.index);
        if(led) led.className = 'led ' + res.status;
        if(lat) {
          lat.innerText = res.latency;
          lat.style.color = res.latency.includes('ms') && parseInt(res.latency) > 3000 ? 'var(--yellow)' : '';
        }
      });
    } catch(e){}
  }

  if(isCacheValid && !force) {
    updateOverviewDashboard();
    return;
  }

  if (isTestingEndpoints) return;
  isTestingEndpoints = true;

  const btn = document.getElementById('btn-test-api');
  if(btn) {
    btn.disabled = true;
    btn.innerHTML = '⏳ Testando Endpoints...';
  }

  // Prepara todos os leds como piscando (loading) se não houver cache
  if (!cacheData || force) {
    ENDPOINTS.forEach((ep, i) => {
      if(ep.section) return;
      const led = document.getElementById('led-'+i);
      const lat = document.getElementById('lat-'+i);
      if(led) led.className = 'led checking';
      if(lat) lat.innerText = '...';
    });
  }

  const cacheResults = [];
  let completed = 0;
  const targetEndpoints = ENDPOINTS.filter(e => e.path);

  // Health check em paralelo
  ENDPOINTS.forEach((ep, i) => {
    if(!ep.path) return;
    const token = TOKENS[farm] || TOKENS['gjacana'];
    const t0 = performance.now();
    let url, headers, fetchOpts = {};
    if(ep.path.startsWith('http')) {
      url = ep.path;
      headers = {};
      fetchOpts = { mode: 'no-cors' };
    } else {
      const sep = ep.path.includes('?') ? '&' : '?';
      url = `${BASE}${ep.path}${sep}limit=1`;
      headers = {'X-Encrypted-Token':token};
    }
    fetch(url, {headers, ...fetchOpts})
      .then(r => {
        const ms = Math.round(performance.now()-t0);
        const led = document.getElementById('led-'+i);
        const lat = document.getElementById('lat-'+i);
        let statusClass = 'down';
        let latText = ms+'ms';

        if(r.ok) {
          statusClass = ms > 5000 ? 'checking' : ''; // checking (amarelo) ou normal (verde)
        } else {
          latText = ms + 'ms (Erro ' + r.status + ')';
        }
        
        if(led) led.className = 'led ' + statusClass;
        if(lat) {
          lat.innerText = latText;
          if(ms > 5000 && r.ok) lat.style.color = 'var(--yellow)';
          if(!r.ok) lat.style.color = 'var(--red)';
        }

        // Registra lentidão extrema no Ticker, ou remove se o endpoint voltou a responder rápido
        const isError = (r.type === 'opaque') ? false : !r.ok;
        if(ms > 5000 || isError) {
          const existing = slowEndpoints.find(s => s.name === ep.name);
          if(!existing) {
            slowEndpoints.push({name: ep.name, ms: isError ? -1 : ms});
          } else {
            existing.ms = isError ? -1 : ms;
          }
          updateTicker();
        } else {
          const idx = slowEndpoints.findIndex(s => s.name === ep.name);
          if(idx !== -1) {
            slowEndpoints.splice(idx, 1);
            updateTicker();
          }
        }

        cacheResults.push({ index: i, status: statusClass, latency: latText });
      })
      .catch(() => {
        const led = document.getElementById('led-'+i);
        if(led) led.className = 'led down';
        const lat = document.getElementById('lat-'+i);
        if(lat) lat.innerText = 'err';
        cacheResults.push({ index: i, status: 'down', latency: 'err' });

        const existing = slowEndpoints.find(s => s.name === ep.name);
        if(!existing) {
          slowEndpoints.push({name: ep.name, ms: -1});
        } else {
          existing.ms = -1;
        }
        updateTicker();
      })
      .finally(() => {
        completed++;
        if(completed === targetEndpoints.length) {
          isTestingEndpoints = false;
          if(btn) {
            btn.disabled = false;
            btn.innerHTML = '🔄 Testar Todos Agora';
          }
          localStorage.setItem(cacheKey, JSON.stringify(cacheResults));
          localStorage.setItem(cacheTimeKey, Date.now().toString());
          updateOverviewDashboard();
        }
      });
  });
}

function forceCheckEndpoints() {
  buildEndpoints(true);
}



function backgroundHealthCheck() {
  ENDPOINTS.forEach(ep => {
    if(!ep.path) return;
    const token = TOKENS['gjacana'];
    const t0 = performance.now();
    let url, headers, fetchOpts = {};
    if(ep.path.startsWith('http')) {
      url = ep.path;
      headers = {};
      fetchOpts = { mode: 'no-cors' };
    } else {
      const sep = ep.path.includes('?') ? '&' : '?';
      url = `${BASE}${ep.path}${sep}limit=1`;
      headers = {'X-Encrypted-Token':token};
    }
    fetch(url, {headers, ...fetchOpts})
      .then(r => {
        const ms = Math.round(performance.now()-t0);
        const isError = (r.type === 'opaque') ? false : !r.ok;
        if(ms > 5000 || isError) {
          const existing = slowEndpoints.find(s => s.name === ep.name);
          if(!existing) {
            slowEndpoints.push({name: ep.name, ms: isError ? -1 : ms});
          } else {
            existing.ms = isError ? -1 : ms;
          }
          updateTicker();
        } else {
          const idx = slowEndpoints.findIndex(s => s.name === ep.name);
          if(idx !== -1) {
            slowEndpoints.splice(idx, 1);
            updateTicker();
          }
        }
      }).catch(()=>{
        const existing = slowEndpoints.find(s => s.name === ep.name);
        if(!existing) {
          slowEndpoints.push({name: ep.name, ms: -1});
        } else {
          existing.ms = -1;
        }
        updateTicker();
      });
  });
}

// Funções da Visão Geral (Overview)
let farmAlertsCache = { gjacana: 0, fazenda_ws: 0, apoloni: 0, piccini: 0 };
try {
  const cachedAlerts = localStorage.getItem('cached_farmAlertsCache');
  if (cachedAlerts) farmAlertsCache = JSON.parse(cachedAlerts);
} catch (e) {}

function updateOverviewDashboard() {
  let alertsCount = 0;
  let recentAlertsHtml = '';
  
  // 1. Update Canais Ativos Status in bottom card and count bans
  FARMS_DATA.forEach(f => {
    const status = getFarmStatus(f.key);
    const miniDot = document.getElementById(`status-mini-${f.key}`);
    
    if (status === 'ban') {
      alertsCount++;
      recentAlertsHtml += `<div class="recent-alert-item" style="border-color: var(--red); color: var(--red);">
        <span class="circle-icon" style="background: var(--red); color: #fff;">!</span>
        O número da <strong>${f.name}</strong> está banido no WhatsApp.
      </div>`;
      if (miniDot) {
        miniDot.className = 'status-dot-mini danger';
      }
    } else if (status === 'checking' || status === 'slow') {
      if (miniDot) {
        miniDot.className = 'status-dot-mini warning';
      }
    } else {
      if (miniDot) {
        miniDot.className = 'status-dot-mini success';
      }
    }
  });

  // 2. Count slow/failing endpoint alerts from health checks
  const endpointAlerts = getEndpointAlerts();
  endpointAlerts.forEach(ep => {
    alertsCount++;
    const isRed = ep.status === 'red';
    const color = isRed ? 'var(--red)' : 'var(--yellow)';
    const bgColor = isRed ? 'var(--red)' : 'var(--yellow)';
    const textColor = isRed ? '#fff' : '#000';
    const text = isRed ? `Endpoint <strong>${ep.name}</strong> está offline/com erro.` : `Endpoint <strong>${ep.name}</strong> lento (${ep.latency}).`;
    
    recentAlertsHtml += `<div class="recent-alert-item" style="border-color: ${color}; color: ${color}; margin: 0; display: flex; align-items: center; gap: 10px; padding: 10px 14px;">
      <span class="circle-icon" style="background: ${bgColor}; color: ${textColor}; font-weight: bold; font-family: monospace;">!</span>
      <span>${text}</span>
    </div>`;
  });

  const alertCard = document.querySelector('.overview-card.green-theme');
  const alertMetricVal = document.getElementById('overview-alerts-count');
  const alertStatusBox = document.getElementById('overview-alerts-status');
  const alertRecentBox = document.getElementById('overview-endpoint-alerts');

  if (alertsCount > 0) {
    const hasRed = endpointAlerts.some(e => e.status === 'red') || FARMS_DATA.some(f => getFarmStatus(f.key) === 'ban');
    if (alertCard) alertCard.style.borderTopColor = hasRed ? 'var(--red)' : 'var(--yellow)';
    if (alertMetricVal) {
      alertMetricVal.innerText = alertsCount;
      alertMetricVal.style.color = hasRed ? 'var(--red)' : 'var(--yellow)';
    }
    if (alertStatusBox) {
      alertStatusBox.className = 'status-alert-box warning';
      alertStatusBox.style.color = hasRed ? 'var(--red)' : 'var(--yellow)';
      alertStatusBox.style.borderColor = hasRed ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)';
      alertStatusBox.style.backgroundColor = hasRed ? 'rgba(239,68,68,0.05)' : 'rgba(245,158,11,0.05)';
      alertStatusBox.innerHTML = `<span class="circle-icon" style="background: ${hasRed ? 'var(--red)' : 'var(--yellow)'}; color: ${hasRed ? '#fff' : '#000'}; font-weight: bold;">!</span> Atenção: ${alertsCount} pendências operacionais encontradas.`;
    }
    if (alertRecentBox) {
      alertRecentBox.innerHTML = recentAlertsHtml;
    }
  } else {
    if (alertCard) alertCard.style.borderTopColor = 'var(--green)';
    if (alertMetricVal) {
      alertMetricVal.innerText = '0';
      alertMetricVal.style.color = 'var(--green)';
    }
    if (alertStatusBox) {
      alertStatusBox.className = 'status-alert-box success';
      alertStatusBox.style.color = 'var(--green)';
      alertStatusBox.style.borderColor = 'rgba(16,185,129,0.2)';
      alertStatusBox.style.backgroundColor = 'rgba(16,185,129,0.05)';
      alertStatusBox.innerHTML = `<span class="circle-icon">✓</span> Tudo perfeito! Nenhum alerta no momento.`;
    }
    if (alertRecentBox) {
      alertRecentBox.innerHTML = `
        <div class="recent-alert-item" id="overview-recent-alert" style="border-color: var(--green); color: var(--green); margin: 0; display: flex; align-items: center; gap: 10px; padding: 10px 14px;">
          <span class="circle-icon" style="background: var(--green); color: #fff;">✓</span>
          <span>Nenhum alerta operacional ativo. Tudo funcionando dentro do esperado.</span>
        </div>`;
    }
  }

  const dateFilter = document.getElementById('overview-date-filter') ? document.getElementById('overview-date-filter').value : 'today';
  let targetLogs = allLogs;
  const now = new Date();

  if (dateFilter === 'today') {
    const todayStr = now.toDateString();
    targetLogs = allLogs.filter(l => new Date(l.sent_at).toDateString() === todayStr);
  } else if (dateFilter === '7days') {
    const limitDate = new Date();
    limitDate.setDate(now.getDate() - 7);
    targetLogs = allLogs.filter(l => new Date(l.sent_at) >= limitDate);
  } else if (dateFilter === '30days') {
    const limitDate = new Date();
    limitDate.setDate(now.getDate() - 30);
    targetLogs = allLogs.filter(l => new Date(l.sent_at) >= limitDate);
  }

  // Group target logs into submission blocks (reports) using a 5-minute window and track report types inside blocks
  const sortedLogs = [...targetLogs].sort((a, b) => new Date(a.sent_at) - new Date(b.sent_at));
  const blocks = [];
  sortedLogs.forEach(log => {
    const logTime = new Date(log.sent_at).getTime();
    const matchingBlockIndex = blocks.findIndex(b => {
      return b.farm_key === log.farm_key &&
             b.phone_number === log.phone_number &&
             Math.abs(b.time - logTime) < 5 * 60 * 1000;
    });
    
    const type = log.report_type || getReportType(log.message_content);
    
    if (matchingBlockIndex === -1) {
      blocks.push({
        farm_key: log.farm_key,
        phone_number: log.phone_number,
        time: logTime,
        types: type ? [type] : []
      });
    } else {
      if (type && !blocks[matchingBlockIndex].types.includes(type)) {
        blocks[matchingBlockIndex].types.push(type);
      }
    }
  });

  const totalDispatchesBlocks = blocks.length;

  // Update Card 2: Volume de Disparos (using grouped blocks)
  const dispatchesCountEl = document.getElementById('overview-dispatches-count');
  if (dispatchesCountEl) dispatchesCountEl.innerText = totalDispatchesBlocks.toLocaleString();

  const totalTexts = targetLogs.filter(l => l.message_type === 'text').length;
  const totalImages = targetLogs.filter(l => l.message_type === 'image').length;
  const avgChannel = Math.round(totalDispatchesBlocks / 4);

  const textsCountEl = document.getElementById('overview-texts-count');
  const imagesCountEl = document.getElementById('overview-images-count');
  const avgChannelEl = document.getElementById('overview-avg-channel');
  if (textsCountEl) textsCountEl.innerText = totalTexts;
  if (imagesCountEl) imagesCountEl.innerText = totalImages;
  if (avgChannelEl) avgChannelEl.innerText = avgChannel;

  // Calculate unique phone numbers per farm
  const uniquePhones = { gjacana: new Set(), fazenda_ws: new Set(), apoloni: new Set(), piccini: new Set() };
  targetLogs.forEach(l => {
    if (uniquePhones[l.farm_key] !== undefined && l.phone_number) {
      uniquePhones[l.farm_key].add(l.phone_number);
    }
  });

  const maxVal = Math.max(
    uniquePhones.gjacana.size,
    uniquePhones.fazenda_ws.size,
    uniquePhones.apoloni.size,
    uniquePhones.piccini.size,
    1
  );

  let clientBarsHtml = '';
  FARMS_DATA.forEach(f => {
    const val = uniquePhones[f.key].size || 0;
    const pct = Math.max(5, Math.round((val / maxVal) * 100));
    
    // Calculate grouped consolidated reports for each farm
    const farmBlocks = blocks.filter(b => b.farm_key === f.key);
    const totalReports = farmBlocks.length;

    const d1Count = farmBlocks.filter(b => b.types.includes('D-1') || b.types.includes('d1')).length;
    const dailyCount = farmBlocks.filter(b => b.types.includes('Daily') || b.types.includes('daily')).length;
    const hourCount = farmBlocks.filter(b => b.types.includes('Hour') || b.types.includes('hour')).length;
    const hidricoCount = farmBlocks.filter(b => b.types.includes('Hídrico') || b.types.includes('irrigacao')).length;
    const marketCount = farmBlocks.filter(b => b.types.includes('Market') || b.types.includes('market')).length;
    const prodCount = farmBlocks.filter(b => b.types.includes('productivity') || b.types.includes('Productivity')).length;
    const revCount = farmBlocks.filter(b => b.types.includes('revenue') || b.types.includes('Revenue')).length;
    const margCount = farmBlocks.filter(b => b.types.includes('margin') || b.types.includes('Margin')).length;
    const topCount = farmBlocks.filter(b => b.types.includes('top_rates') || b.types.includes('Top Rates')).length;
    const idleCount = farmBlocks.filter(b => b.types.includes('idle_machine') || b.types.includes('idle') || b.types.includes('Idle')).length;

    clientBarsHtml += `
      <div style="background: var(--sub); border: 1px solid var(--border); padding: 12px; border-radius: 8px; display: flex; flex-direction: column; gap: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 0.95rem; font-weight: 800; font-family: 'Outfit', sans-serif;">${f.name}</span>
          <div style="display: flex; gap: 8px;">
            <span class="badge" style="padding: 2px 6px; font-size: 0.72rem; border-color: rgba(96,165,250,0.3); color: var(--blue);">👥 ${val} únicos</span>
            <span class="badge" style="padding: 2px 6px; font-size: 0.72rem; border-color: rgba(16,185,129,0.3); color: var(--green);">✈️ ${totalReports} envios</span>
          </div>
        </div>
        <div class="bar-container" style="height: 6px; background: rgba(255,255,255,0.03); border-radius: 3px; overflow: hidden; width: 100%;">
          <div class="bar-fill" style="width: ${pct}%; height: 100%; background: var(--blue); border-radius: 3px;"></div>
        </div>
        <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 2px; font-size: 0.7rem; font-weight: 700; color: var(--muted);">
          <span style="background: rgba(139,92,246,0.08); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(139,92,246,0.12);">D-1: ${d1Count}</span>
          <span style="background: rgba(16,185,129,0.08); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(16,185,129,0.12);">Daily: ${dailyCount}</span>
          <span style="background: rgba(245,158,11,0.08); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(245,158,11,0.12);">Hour: ${hourCount}</span>
          <span style="background: rgba(59,130,246,0.08); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(59,130,246,0.12);">Hídrico: ${hidricoCount}</span>
          <span style="background: rgba(155,111,247,0.08); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(155,111,247,0.12);">Market: ${marketCount}</span>
          <span style="background: rgba(236,72,153,0.08); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(236,72,153,0.12);">Produtividade: ${prodCount}</span>
          <span style="background: rgba(34,197,94,0.08); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(34,197,94,0.12);">Receita: ${revCount}</span>
          <span style="background: rgba(234,179,8,0.08); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(234,179,8,0.12);">Margem: ${margCount}</span>
          <span style="background: rgba(14,165,233,0.08); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(14,165,233,0.12);">Top Rates: ${topCount}</span>
          <span style="background: rgba(244,63,94,0.08); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(244,63,94,0.12);">Ociosas: ${idleCount}</span>
        </div>
      </div>
    `;
  });
  
  const clientBarsEl = document.getElementById('overview-client-bars');
  if (clientBarsEl) clientBarsEl.innerHTML = clientBarsHtml;

  // -------- IA Metrics Calculations --------
  let totalIaChats = 0;
  let responseTimes = [];
  let toolsCount = 0;
  let sqlCount = 0;
  let farmBreakdown = '';
  
  FARMS_DATA.forEach(f => {
      try {
          const colinStr = localStorage.getItem('colinLogs_' + f.key);
          if (colinStr) {
              const logs = JSON.parse(colinStr);
              const uniquePhonesIA = new Set();
              const nowTime = new Date().getTime();
              logs.forEach(l => {
                 const t = new Date(l.created_at).getTime();
                 if (nowTime - t < 24 * 60 * 60 * 1000) {
                    if (l.phone) uniquePhonesIA.add(l.phone);
                 }
                 if (l.event_type === 'gateway.reply_received' && l.elapsed_seconds) {
                    responseTimes.push(parseFloat(l.elapsed_seconds));
                 }
                 
                 const tName = l.tool_name || (l.metadata && l.metadata.tool_name) || '';
                 const isSql = tName === 'sql_execution' || l.event_type === 'sql_fallback_activated';
                 const isTool = l.event_type === 'tool_call' || l.event_type === 'tool_call_detail' || tName !== '';
                 
                 if (isSql) {
                     sqlCount++;
                 } else if (isTool) {
                     toolsCount++;
                 }
              });
              totalIaChats += uniquePhonesIA.size;
              if (uniquePhonesIA.size > 0) {
                  farmBreakdown += `<div style="display:flex; justify-content:space-between; gap:16px;"><span>${f.name}:</span> <span style="font-weight:900; color:var(--blue);">${uniquePhonesIA.size}</span></div>`;
              }
          }
      } catch(e){}
  });

  const avgResp = responseTimes.length > 0 ? (responseTimes.reduce((a,b)=>a+b,0) / responseTimes.length).toFixed(1) : '0.0';
  const totalDecisions = toolsCount + sqlCount;
  let toolsPct = 0; let sqlPct = 0;
  if (totalDecisions > 0) {
      toolsPct = Math.round((toolsCount / totalDecisions) * 100);
      sqlPct = Math.round((sqlCount / totalDecisions) * 100);
  }

  const iaChatsEl = document.getElementById('ia-active-chats');
  if (iaChatsEl) {
      iaChatsEl.innerHTML = `${totalIaChats} <span style="font-size: 0.8rem; background: rgba(59,130,246,0.2); color: #60a5fa; padding: 2px 6px; border-radius: 4px; font-weight: 700;">24h</span>
      <div class="tooltip-text">${farmBreakdown || 'Nenhum atendimento'}</div>`;
      iaChatsEl.classList.add('custom-tooltip');
      iaChatsEl.removeAttribute('title');
  }
  
  const iaAvgEl = document.getElementById('ia-avg-response');
  if (iaAvgEl) iaAvgEl.innerHTML = `${avgResp}s <span style="font-size: 0.8rem; color: var(--green);">⚡</span>`;

  const iaToolsPctEl = document.getElementById('ia-tools-pct');
  const iaToolsBarEl = document.getElementById('ia-tools-bar');
  if (iaToolsPctEl) iaToolsPctEl.innerText = `${toolsPct}%`;
  if (iaToolsBarEl) iaToolsBarEl.style.width = `${toolsPct}%`;

  const iaSqlPctEl = document.getElementById('ia-sql-pct');
  const iaSqlBarEl = document.getElementById('ia-sql-bar');
  if (iaSqlPctEl) iaSqlPctEl.innerText = `${sqlPct}%`;
  if (iaSqlBarEl) iaSqlBarEl.style.width = `${sqlPct}%`;
}

function getEndpointAlerts() {
  const cacheData = localStorage.getItem('api_health_cache');
  if (!cacheData) return [];
  try {
    const results = JSON.parse(cacheData);
    const alerts = [];
    results.forEach(res => {
      const ep = ENDPOINTS[res.index];
      if (ep && (res.status === 'down' || res.status === 'checking')) {
        alerts.push({
          name: ep.name,
          path: ep.path,
          status: res.status === 'down' ? 'red' : 'yellow',
          latency: res.latency
        });
      }
    });
    return alerts;
  } catch(e) {
    return [];
  }
}

function preloadAllFarmsData() {
  FARMS_DATA.forEach(f => {
    const token = TOKENS[f.key];
    if (!token) return;

    // Preload colin interactions in background
    fetch(`${BASE}/chat/interactions?limit=100`, {headers:{'X-Encrypted-Token':token}})
      .then(r => r.ok ? r.json() : [])
      .then(logs => {
          window.colinFirstFetchDone = window.colinFirstFetchDone || {};
          window.colinFirstFetchDone[f.key] = true;
          if (logs && logs.length) {
              const filtered = logs.filter(log => {
                  const isToolOrSql = log.event_type && (log.event_type.includes('tool') || log.event_type.includes('sql'));
                  if (isToolOrSql) return true;
                  const p = log.phone || '';
                  return p.replace(/\D/g, '').length > 5;
              });
              
              filtered.forEach(log => {
                 const logId = log.id || (log.created_at + (log.phone || log.event_type));
                 seenColinMsgIds.add(logId);
              });
              try { localStorage.setItem('colinLogs_' + f.key, JSON.stringify(filtered)); } catch(e){}
          }
      })
      .catch(e => console.warn(`Erro pre-load interactions ${f.key}:`, e));

    // Fetch logs in parallel
    fetch(`${BASE}/chat/logs?limit=150`, {headers:{'X-Encrypted-Token':token}})
      .then(r => r.ok ? r.json() : [])
      .then(logs => {
        if (logs && logs.length) {
          logs.forEach(l => l.farm_key = f.key);
          logsCache[f.key] = logs;
          allLogs = allLogs.filter(l => l.farm_key !== f.key).concat(logs);
          try { localStorage.setItem('cached_allLogs', JSON.stringify(allLogs)); } catch(e){}
          // Incremental UI updates
          updateOverviewDashboard();
          if (f.key === farm) {
            fetchLogs();
          }
        }
      })
      .catch(e => console.warn(`Erro no pre-load de logs para ${f.key}:`, e));

    // Fetch contacts in parallel
    fetch(`${BASE}/farms/contacts`, {headers:{'X-Encrypted-Token':token}})
      .then(r => r.ok ? r.json() : [])
      .then(contacts => {
        contactsCache[f.key] = contacts;
      })
      .catch(e => console.warn(`Erro no pre-load de contatos para ${f.key}:`, e));

    // Fetch alerts in parallel
    fetch(`${BASE}/machines/alerts`, {headers:{'X-Encrypted-Token':token}})
      .then(r => r.ok ? r.json() : [])
      .then(alerts => {
        farmAlertsCache[f.key] = alerts.length;
        try { localStorage.setItem('cached_farmAlertsCache', JSON.stringify(farmAlertsCache)); } catch(e){}
        updateOverviewDashboard();
      })
      .catch(e => console.warn(`Erro no pre-load de alertas para ${f.key}:`, e));
  });
}


// --- TIMELINE DE INTERAÇÕES (COLIN) ---
let colinLogs = [];
let activeColinFarm = 'gjacana';
let activeColinFarmName = 'Fazenda Jaçanã';
let activeColinPhone = null;

let seenColinMsgIds = new Set();
const TARGET_CONTACTS = ['marcos', 'rino', 'rodrigo', 'wesley', '11959640107'];

function showColinAlert(contactName, messageText, farmName, farmKey, phone) {
  const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
  audio.play().catch(e => console.warn('Audio play blocked by browser:', e));

  let alertBox = document.getElementById('colin-alert-toast');
  if (!alertBox) {
    alertBox = document.createElement('div');
    alertBox.id = 'colin-alert-toast';
    alertBox.style.cssText = 'position: fixed; top: 30px; right: 30px; background: #ffffff; color: #111827; padding: 20px 25px; border-radius: 12px; box-shadow: 0 15px 40px rgba(0,0,0,0.6); border-left: 10px solid #ff7a00; z-index: 99999; transform: translateX(150%); transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); width: 420px; cursor: pointer; display: flex; flex-direction: column; gap: 8px; font-family: sans-serif;';
    document.body.appendChild(alertBox);
  }
  
  alertBox.onclick = () => { 
    alertBox.style.transform = 'translateX(150%)'; 
    if (farmKey && phone) {
       switchTab('colin');
       selectColinFarmAndPhone(farmKey, farmName, phone);
    }
  };
  
  let farmHtml = farmName ? `<div style="font-size:0.9rem; font-weight:900; color: #ff7a00; text-transform:uppercase; letter-spacing: 1px;">📍 ${farmName}</div>` : '';
  alertBox.innerHTML = `${farmHtml}<div style="font-size:1.3rem; font-weight: 800; margin-bottom: 4px;">Nova mensagem de ${contactName}</div><div style="font-size:1.1rem; line-height: 1.4; color: #374151;">${messageText.substring(0, 100)}${messageText.length > 100 ? '...' : ''}</div>`;
  
  requestAnimationFrame(() => {
    alertBox.style.transform = 'translateX(0)';
  });
  
  setTimeout(() => {
    if(alertBox.style.transform === 'translateX(0px)' || alertBox.style.transform === 'translateX(0)') {
        alertBox.style.transform = 'translateX(150%)';
    }
  }, 10000);
}

function selectColinFarmAndPhone(key, name, phone) {
  activeColinFarm = key;
  activeColinFarmName = name;
  document.querySelectorAll('.fbtn-colin').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('btn-colin-' + key);
  if (btn) btn.classList.add('active');
  activeColinPhone = phone;
  document.getElementById('colin-chat-messages').innerHTML = '<div style="text-align: center; color: var(--muted); padding: 40px; margin-top: 20vh;">Carregando...</div>';
  fetchInteractions();
}

function selectColinFarm(key, name) {
  activeColinFarm = key;
  activeColinFarmName = name;
  document.querySelectorAll('.fbtn-colin').forEach(b => b.classList.remove('active'));
  document.getElementById('btn-colin-' + key).classList.add('active');
  activeColinPhone = null;
  document.getElementById('colin-chat-messages').innerHTML = '<div style="text-align: center; color: var(--muted); padding: 40px; margin-top: 20vh;">Selecione uma conversa ao lado.</div>';
  fetchInteractions();
}

// Cache dos contatos ativos por fazenda (sidebar)
let colinActiveContactsCache = {};

async function fetchInteractions() {
  const token = TOKENS[activeColinFarm];
  const listContainer = document.getElementById('colin-contacts-list');
  if (!listContainer) return;
  
  if (!token) {
    listContainer.innerHTML = '<div style="padding:20px; text-align:center; color:var(--red);">Token ausente.</div>';
    return;
  }

  // Renderiza do cache enquanto busca atualização
  if (colinActiveContactsCache[activeColinFarm]) {
    renderColinSidebar();
    if (activeColinPhone) openColinChat(activeColinPhone);
  } else {
    listContainer.innerHTML = '<div style="padding:20px; text-align:center; color:var(--muted);">Buscando contatos...</div>';
  }
  
  try {
    // ✅ NOVO: busca contatos únicos (sem limite por volume de mensagens)
    const r = await fetch(BASE + '/chat/active-contacts', {headers:{'X-Encrypted-Token':token}});
    if (!r.ok) throw new Error('API: ' + r.status);
    const activeContacts = await r.json();

    // Filtra phones válidos
    const validContacts = activeContacts.filter(c => {
      const p = c.phone || '';
      return p.replace(/\D/g, '').length > 5;
    });

    // Converte para formato compatível com colinLogs para renderColinSidebar
    // Cada contato vira um "log sintético" com os dados da última interação
    colinLogs = validContacts.map(c => ({
      phone: c.phone,
      created_at: c.last_interaction,
      text: c.last_text || '',
      event_type: c.last_event_type || 'message.received',
      metadata: c.last_metadata || null,
      _is_contact_summary: true  // marca como resumo, não como log completo
    }));

    colinActiveContactsCache[activeColinFarm] = colinLogs;

    // Carrega nomes dos contatos em paralelo
    if (!window.farmContactsCache) window.farmContactsCache = {};
    if (!window.farmContactsCache[activeColinFarm]) {
      fetch(BASE + '/chat/contacts', {headers:{'X-Encrypted-Token':token}})
        .then(cr => cr.ok ? cr.json() : [])
        .then(cData => {
          window.farmContactsCache[activeColinFarm] = {};
          const arr = Array.isArray(cData) ? cData : (cData && Array.isArray(cData.contacts) ? cData.contacts : []);
          arr.forEach(c => {
            if (c.phone_number) {
              let cleanP = String(c.phone_number).replace(/\D/g, '');
              if (cleanP.startsWith('55') && cleanP.length >= 12) cleanP = cleanP.substring(2);
              window.farmContactsCache[activeColinFarm][cleanP] = {
                contact_name: c.contact_name,
                photo_url: c.photo_url || null
              };
            }
          });
          renderColinSidebar();
        }).catch(ce => console.warn('Erro contatos', ce));
    }

    renderColinSidebar();
    if (activeColinPhone) openColinChat(activeColinPhone);

  } catch (e) {
    console.error(e);
    listContainer.innerHTML = '<div style="padding:20px; text-align:center; color:var(--red);">Erro: ' + e.message + '</div>';
  }
}



const AVATARS = {
  rafael: "images/rafael.jpg",
  wesley: "images/wesley.png",
  leo: "images/leo.png",
  rodrigo: "images/rodrigo.jpg",
  jose: "images/jose.jpg"
};

function getAvatarForUser(name, metadata) {
  if (metadata && metadata.photo_url) {
     return metadata.photo_url;
  }
  
  if (metadata && metadata.contact_name) {
    const n = metadata.contact_name.toLowerCase();
    if ((n.includes('josé') || n.includes('jose')) && typeof AVATARS !== 'undefined' && AVATARS.jose) return AVATARS.jose;
    if (n.includes('leo') && typeof AVATARS !== 'undefined' && AVATARS.leo) return AVATARS.leo;
    if (n.includes('rafael') && typeof AVATARS !== 'undefined' && AVATARS.rafael) return AVATARS.rafael;
    if (n.includes('rodrigo') && typeof AVATARS !== 'undefined' && AVATARS.rodrigo) return AVATARS.rodrigo;
    if (n.includes('wesley') && typeof AVATARS !== 'undefined' && AVATARS.wesley) return AVATARS.wesley;
  }

  let initials = "U";
  let bgColor = "%23202c33";
  
  if (name && name !== "Desconhecido" && !name.startsWith("+")) {
     const parts = name.trim().split(" ").filter(p => p.length > 0);
     if (parts.length >= 2) {
         initials = (parts[0][0] + parts[1][0]).toUpperCase();
     } else if (parts.length === 1) {
         initials = parts[0].substring(0, 2).toUpperCase();
     }
     
     const colors = ["%23008069", "%2353bdeb", "%238766b1", "%23e57373", "%23f0b330", "%23ff7a00", "%2300a884", "%236b7280"];
     let sum = 0;
     for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
     bgColor = colors[sum % colors.length];
  }

  return `data:image/svg+xml;utf8,<svg width='150' height='150' viewBox='0 0 150 150' xmlns='http://www.w3.org/2000/svg'><rect width='100%' height='100%' fill='${bgColor}'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='60' fill='%23e9edef'>${initials}</text></svg>`;
}

function renderColinSidebar() {
  const sidebar = document.getElementById('colin-contacts-list');
  if (!colinLogs || colinLogs.length === 0) {
    sidebar.innerHTML = '<div style="padding:20px; text-align:center; color:var(--muted);">Sem interações recentes.</div>';
    return;
  }

  // Agrupar por telefone
  const chats = {};
  colinLogs.forEach(it => {
    const p = it.phone || 'Desconhecido';
    if (!chats[p]) chats[p] = [];
    chats[p].push(it);
  });
  
  // Ordenar cada chat por created_at ASC
  Object.values(chats).forEach(list => {
    list.sort((a,b) => new Date(a.created_at) - new Date(b.created_at));
  });

  // Ordenar as conversas pela mais recente
  const sortedPhones = Object.keys(chats).sort((a, b) => {
    const lastA = chats[a][chats[a].length - 1];
    const lastB = chats[b][chats[b].length - 1];
    return new Date(lastB.created_at) - new Date(lastA.created_at);
  });

  let htmlSidebar = '';
  sortedPhones.forEach(phone => {
    const list = chats[phone];
    
    // Ignorar erro se não for a ultima msg pro preview
    const textMsgs = list.filter(m => ['message.received', 'interim.sent', 'gateway.reply_received'].includes(m.event_type));
    const lastMsg = list[list.length-1];
    const previewMsg = textMsgs.length > 0 ? textMsgs[textMsgs.length-1] : lastMsg;
    
    const cleanPRaw = phone ? phone.replace(/\D/g, '') : '';
    const cleanP = (cleanPRaw.startsWith('55') && cleanPRaw.length >= 12) ? cleanPRaw.substring(2) : cleanPRaw;
    
    let dbName = null;
    let dbPhoto = null;
    if (window.farmContactsCache && window.farmContactsCache[activeColinFarm] && window.farmContactsCache[activeColinFarm][cleanP]) {
        const cObj = window.farmContactsCache[activeColinFarm][cleanP];
        if (typeof cObj === 'object') {
            dbName = cObj.contact_name;
            dbPhoto = cObj.photo_url;
        } else {
            dbName = cObj; // backward compatibility
        }
    }
    const name = dbName ? dbName : ((lastMsg.metadata && lastMsg.metadata.contact_name) ? lastMsg.metadata.contact_name : formatPhone(phone));
    
    let metaForAvatar = lastMsg.metadata ? { ...lastMsg.metadata } : {};
    if (dbPhoto) metaForAvatar.photo_url = dbPhoto;
    
    const avatar = getAvatarForUser(name, metaForAvatar);
    
    let preview = previewMsg.text || previewMsg.event_type;
    if(preview.length > 35) preview = preview.substring(0,35) + '...';
    
    const activeClass = phone === activeColinPhone ? 'active' : '';
    
    htmlSidebar += `
      <div class="colin-contact-item ${activeClass}" onclick="openColinChat('${phone}')" id="contact-${phone}" style="flex-direction:row; align-items:center; gap:12px;">
        <div style="width:45px; height:45px; border-radius:50%; overflow:hidden; flex-shrink:0;">
          <img src="${avatar}" style="width:100%; height:100%; object-fit:cover;">
        </div>
        <div style="flex:1; min-width:0; display: flex; flex-direction: column; justify-content: center;">
          <div style="font-weight: 700; color: var(--text); font-size: 1rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-bottom: 2px;">${name}</div>
          ${name !== formatPhone(phone) ? '<div style="font-size: 0.75rem; color: var(--muted); margin-bottom: 4px;">' + formatPhone(phone) + '</div>' : ''}
          <div style="font-size: 0.85rem; color: #a0aec0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${preview}</div>
        </div>
      </div>
    `;
  });
  
  sidebar.innerHTML = htmlSidebar;
}


// Cache do histórico de chat por phone
let colinChatHistoryCache = {};

async function _loadColinChatHistory(phone) {
  const token = TOKENS[activeColinFarm];
  const chatArea = document.getElementById('colin-chat-messages');
  if (chatArea) chatArea.innerHTML = '<div style="text-align:center; color:var(--muted); padding:40px; margin-top:20vh;">Carregando histórico...</div>';

  try {
    const r = await fetch(BASE + `/chat/interactions?phone=${encodeURIComponent(phone)}&limit=200`, {headers:{'X-Encrypted-Token':token}});
    if (!r.ok) throw new Error('API: ' + r.status);
    const history = await r.json();
    colinChatHistoryCache[activeColinFarm + '_' + phone] = history;
    openColinChat(phone, false);
  } catch(e) {
    if (chatArea) chatArea.innerHTML = `<div style="text-align:center; color:var(--red); padding:40px; margin-top:20vh;">Erro ao carregar histórico: ${e.message}</div>`;
  }
}

function openColinChat(phone, keepScroll = false) {
  activeColinPhone = phone;
  
  // Atualiza sidebar ativa
  document.querySelectorAll('.colin-contact-item').forEach(e => e.classList.remove('active'));
  const cItem = document.getElementById('contact-' + phone);
  if(cItem) cItem.classList.add('active');

  // ✅ NOVO: se estamos usando o novo modo (contact summaries), busca histórico por phone
  const usingNewMode = colinLogs.length > 0 && colinLogs[0]._is_contact_summary;
  if (usingNewMode && !colinChatHistoryCache[activeColinFarm + '_' + phone]) {
    _loadColinChatHistory(phone);
    return;
  }

  const cachedHistory = colinChatHistoryCache[activeColinFarm + '_' + phone];
  const items = cachedHistory || colinLogs.filter(i => (i.phone || 'Desconhecido') === phone);
  items.sort((a,b) => new Date(a.created_at) - new Date(b.created_at));
  
  const cleanPRaw = phone ? phone.replace(/\D/g, '') : '';
  const cleanP = (cleanPRaw.startsWith('55') && cleanPRaw.length >= 12) ? cleanPRaw.substring(2) : cleanPRaw;
  let dbName = null;
  let dbPhoto = null;
  if (window.farmContactsCache && window.farmContactsCache[activeColinFarm] && window.farmContactsCache[activeColinFarm][cleanP]) {
      const cObj = window.farmContactsCache[activeColinFarm][cleanP];
      if (typeof cObj === 'object') {
          dbName = cObj.contact_name;
          dbPhoto = cObj.photo_url;
      } else {
          dbName = cObj;
      }
  }

  const lastMsg = items[items.length-1];
  const metadataName = (lastMsg && lastMsg.metadata && lastMsg.metadata.contact_name) ? lastMsg.metadata.contact_name : formatPhone(phone);
  const name = dbName ? dbName : metadataName;
  
  let metaForAvatar = lastMsg && lastMsg.metadata ? { ...lastMsg.metadata } : {};
  if (dbPhoto) metaForAvatar.photo_url = dbPhoto;
  
  const avatar = getAvatarForUser(name, metaForAvatar);
  
  document.getElementById('colin-chat-header').innerHTML = `
    <div class="colin-avatar-wrap" onclick="openAvatarModal(this.querySelector('img').src)" style="width: 40px; height: 40px; margin-right: 12px; border-radius:50%; overflow:hidden; cursor:pointer;" title="Ver foto">
      <img src="${avatar}" class="colin-avatar" style="width:100%; height:100%; object-fit:cover;">
    </div>
    <div>
      <h3 style="margin: 0; font-size: 1.1rem; color: var(--text);">${name}</h3>
      <span style="font-size: 0.8rem; color: var(--muted);">${name !== formatPhone(phone) ? formatPhone(phone) : 'Agente: Colin ' + activeColinFarmName}</span>
    </div>
  `;
  
  const chatArea = document.getElementById('colin-chat-messages');
  let html = '';
  
  if (items.length >= 10) {
      html += `<div style="text-align:center; padding: 10px; margin-bottom: 10px;"><button id="btn-load-more-colin" class="theme-btn" onclick="loadMoreColinChat('${phone}')" style="font-size:0.8rem; padding: 6px 12px; cursor: pointer;">⬆️ Carregar mensagens anteriores</button></div>`;
  }
  
  // Agrupar tools pelo request_id (usando colinLogs inteiro pois os eventos de tools não tem telefone atrelado)
  window.agentToolsCache = {};
  const reqGroups = window.agentToolsCache;
  colinLogs.forEach(it => {
    if(!reqGroups[it.request_id]) reqGroups[it.request_id] = { tools: [] };
    if (['tool_call', 'tool_call_detail', 'sql_fallback_activated'].includes(it.event_type) || it.tool_name) {
      reqGroups[it.request_id].tools.push(it);
    } else if (it.event_type === 'gateway.error' || it.event_type === 'sql_execution_failed') {
      reqGroups[it.request_id].tools.push(it); 
    }
  });
  
  items.forEach(it => {
    if (it.event_type === 'message.sent') return; 
    
    if (['message.received', 'interim.sent', 'gateway.reply_received', 'gateway.error'].includes(it.event_type)) {
      
      const isInbound = it.event_type === 'message.received';
      const rowClass = isInbound ? 'inbound' : 'outbound';
      const _d = new Date(it.created_at);
      const timeStr = _d.toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'}) + ' ' + _d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
      
      let toolsHtml = '';
      let clickAttr = '';
      let cursorStyle = '';
      
      if (!isInbound && it.event_type === 'gateway.reply_received') {
        toolsHtml = `<span class="agent-tools-btn" onclick="openAgentToolsModal('${it.request_id}')" style="cursor:pointer; margin-left: 8px; font-size:1.1rem; opacity: 0.6; transition:all 0.2s; vertical-align: middle; display: inline-flex; align-items: center; justify-content: center;" onmouseover="this.style.opacity=1;this.style.transform='scale(1.1)';" onmouseout="this.style.opacity=0.6;this.style.transform='scale(1)';" title="Ver auditoria da IA (Ferramentas/SQL)">⚙️</span>`;
      }

      let content = parseWhatsApp(it.text || '');
      if (it.event_type === 'gateway.error') content = "❌ Ocorreu um erro na comunicação com a API.";

      html += `
        <div class="colin-msg-row ${rowClass}" style="position:relative; z-index:5;">
          <div style="position:relative;" class="colin-bubble">
            ${content}
            <span class="colin-msg-time" style="display:flex; justify-content:flex-end; alignItems:center; gap: 4px;">
                ${timeStr} ${it.elapsed_seconds ? '('+it.elapsed_seconds+'s)' : ''} ${toolsHtml}
            </span>
          </div>
        </div>
      `;
    }
  });
  
  if (!html) html = '<div style="text-align: center; color: var(--muted); padding: 40px; margin-top: 20vh;">Nenhuma mensagem processada para exibir.</div>';
  
  chatArea.innerHTML = html;
  if (!keepScroll) {
      chatArea.scrollTop = chatArea.scrollHeight;
  }
}

async function loadMoreColinChat(phone) {
    const cacheKey = activeColinFarm + '_' + phone;
    const cachedHistory = colinChatHistoryCache[cacheKey] || colinLogs.filter(i => (i.phone || 'Desconhecido') === phone);
    const offset = cachedHistory.length;
    const token = TOKENS[activeColinFarm];
    const btn = document.getElementById('btn-load-more-colin');
    if (btn) btn.innerText = "Carregando...";

    try {
        const r = await fetch(BASE + `/chat/interactions?phone=${encodeURIComponent(phone)}&limit=50&offset=${offset}`, {headers:{'X-Encrypted-Token':token}});
        if (!r.ok) throw new Error('API: ' + r.status);
        const newLogs = await r.json();
        
        if (newLogs.length === 0) {
            if (btn) {
                btn.innerText = "Fim do histórico.";
                btn.disabled = true;
                btn.style.opacity = "0.5";
            }
            return;
        }

        // Atualiza o cache correto
        if (colinChatHistoryCache[cacheKey]) {
            colinChatHistoryCache[cacheKey] = colinChatHistoryCache[cacheKey].concat(newLogs);
        } else {
            colinLogs = colinLogs.concat(newLogs);
        }
        
        const chatArea = document.getElementById('colin-chat-messages');
        const oldHeight = chatArea.scrollHeight;
        
        openColinChat(phone, true);
        
        setTimeout(() => {
            const newHeight = chatArea.scrollHeight;
            chatArea.scrollTop = newHeight - oldHeight;
        }, 10);
        
    } catch(e) {
        console.error(e);
        if (btn) btn.innerText = "Erro ao carregar";
    }
}


function openAvatarModal(url) {
  let modal = document.getElementById('avatar-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'avatar-modal';
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
    modal.style.cursor = 'zoom-out';
    
    // Add close logic
    modal.onclick = function() {
        this.style.opacity = '0';
        setTimeout(() => { this.style.display = 'none'; }, 200);
    };
    
    // Add image element
    const img = document.createElement('img');
    img.id = 'avatar-modal-img';
    img.style.maxWidth = '90%';
    img.style.maxHeight = '90%';
    img.style.objectFit = 'contain';
    img.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';
    img.style.transform = 'scale(0.9)';
    img.style.transition = 'transform 0.2s ease';
    
    modal.appendChild(img);
    document.body.appendChild(modal);
  }
  
  const img = document.getElementById('avatar-modal-img');
  img.src = url;
  
  if (url.startsWith('data:image/svg')) {
      img.style.borderRadius = '50%';
      img.style.width = '350px';
      img.style.height = '350px';
  } else {
      img.style.borderRadius = '0';
      img.style.width = '450px';
      img.style.height = '450px';
  }
  
  modal.style.display = 'flex';
  setTimeout(() => {
      modal.style.opacity = '1';
      img.style.transform = 'scale(1)';
  }, 10);
}

function fetchFarmStatuses() {
  fetch(BASE + '/farms/overview')
    .then(r => r.ok ? r.json() : {farms: []})
    .then(data => {
      if(data.farms && data.farms.length > 0) {
        data.farms.forEach(f => localStorage.setItem('farm_status_' + f.farm_key, f.status || 'ok'));
        loadAllFarmDots();
        updateOverviewDashboard();
      }
    }).catch(()=>{});
}

window.addEventListener('storage', function(e) {
  if (e.key && e.key.startsWith('farm_status_')) {
    loadAllFarmDots();
    updateOverviewDashboard();
  }
});

// Boot
const savedTab = localStorage.getItem('active_tab') || 'overview';
selectFarm('gjacana','Fazenda Jaçanã','5683','5511963065709');
switchTab(savedTab);
loadAllFarmDots();
preloadAllFarmsData();
buildEndpoints(false);

function pollGlobalColinMessages() {
  FARMS_DATA.forEach(f => {
    const token = TOKENS[f.key];
    if (!token) return;
    fetch(`${BASE}/chat/interactions?limit=15`, {headers:{'X-Encrypted-Token':token}})
      .then(r => r.ok ? r.json() : [])
      .then(logs => {
        let hasNew = false;
        let pName = ''; let pMsg = ''; let pPhone = '';
        logs.forEach(log => {
          const logId = log.id || (log.created_at + log.phone);
          if (window.colinFirstFetchDone && window.colinFirstFetchDone[f.key] && !seenColinMsgIds.has(logId)) {
            let isRecent = false;
            const msgTimeStr = log.created_at || log.sent_at;
            if (msgTimeStr) {
                const msgTime = new Date(msgTimeStr).getTime();
                if (!isNaN(msgTime)) isRecent = Math.abs(Date.now() - msgTime) < 5 * 60 * 1000;
            }
            
            if (log.event_type === 'message.received' && isRecent) {
              const contactName = (log.metadata && log.metadata.contact_name) ? log.metadata.contact_name : (log.phone || '');
              const isTarget = TARGET_CONTACTS.some(tc => contactName.toLowerCase().includes(tc.toLowerCase()) || (log.phone && log.phone.includes(tc)));
              if (isTarget) {
                hasNew = true; pName = contactName; pMsg = log.text || ''; pPhone = log.phone;
              }
            }
            seenColinMsgIds.add(logId);
          }
        });
        if (hasNew) {
           showColinAlert(pName, pMsg, f.name, f.key, pPhone);
           if (f.key === activeColinFarm) fetchInteractions();
        }
      })
      .catch(e => {});
  });
}

// Atrasa a primeira verificação de background por 4 segundos após carregar
setTimeout(() => {
  backgroundHealthCheck();
  fetchFarmStatuses();
  setInterval(backgroundHealthCheck, 15 * 60 * 1000);
  setInterval(fetchFarmStatuses, 60 * 1000);
  setInterval(pollGlobalColinMessages, 10000);
}, 4000);
async function openAgentToolsModal(reqId) {
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
    header.style.backgroundColor = 'rgba(0,0,0,0.25)';
    
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
  body.innerHTML = '<div style="text-align:center; padding: 40px; color: #a0aec0;">🔄 Buscando ferramentas do agente...</div>';
  
  modal.style.display = 'flex';
  setTimeout(() => { modal.style.opacity = '1'; }, 10);

  try {
      const jwt = TOKENS[activeColinFarm];
      const url = `${BASE}/chat/interactions?request_id=${reqId}&limit=100`;
      const res = await fetch(url, { headers: { 'X-Encrypted-Token': jwt } });
      const items = await res.json();
      
      const tools = items.filter(it => 
          ['tool_call', 'tool_call_detail', 'sql_fallback_activated', 'gateway.error', 'sql_execution_failed'].includes(it.event_type) || it.tool_name
      ).sort((a,b) => new Date(a.created_at) - new Date(b.created_at));

      if (tools.length === 0) {
          body.innerHTML = '<div style="text-align:center; padding: 40px; color: #a0aec0;">Nenhum log de ferramenta encontrado para esta resposta.</div>';
      } else {
          let html = '<div style="margin-bottom: 15px; font-size: 0.85rem; color: #a0aec0;"><strong>Request ID:</strong> ' + reqId + '</div>';
          
          tools.forEach((t, index) => {
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
  } catch (err) {
      console.error(err);
      body.innerHTML = '<div style="text-align:center; padding: 40px; color: #ef4444;">Erro ao buscar logs: ' + err.message + '</div>';
  }
}

