// ══ EVENT TRACKER ══
function trackEvent(action, data = {}) {
  fetch(`${_API_BASE}/api/event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'click', action, data })
  }).catch(() => {});
}

// ══ PORTAL LOCK CHECK ══
const _API_BASE = (window.location.hostname === 'localhost' || window.location.protocol === 'file:')
  ? 'http://localhost:3000'
  : 'https://selector-backend-5n3e.onrender.com';

function show404() {
  document.documentElement.innerHTML = `<!DOCTYPE html>
    <html><head><meta charset="UTF-8"/><title>404 - Not Found</title>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=Lato:wght@400&display=swap" rel="stylesheet"/>
    <style>
      *{margin:0;padding:0;box-sizing:border-box;animation:none!important;transition:none!important}
      body{background:#1a0510;height:100vh;display:flex;flex-direction:column;
           align-items:center;justify-content:center;font-family:'Lato',sans-serif;overflow:hidden}
      h1{font-family:'Playfair Display',serif;font-size:8rem;font-weight:700;
         background:linear-gradient(135deg,#e8547a,#e8b86d);-webkit-background-clip:text;
         -webkit-text-fill-color:transparent;background-clip:text;line-height:1}
      p{color:rgba(255,255,255,0.35);font-size:1rem;margin-top:1rem;letter-spacing:1px}
    </style></head>
    <body><h1>404</h1><p>This page is not available</p></body></html>`;
}

async function checkConfig() {
  try {
    const res  = await fetch(`${_API_BASE}/api/config`);
    const data = await res.json();
    if (!data.active) { show404(); return false; }
    return true;
  } catch (e) { return true; }
}

// Set HP question immediately on load (before async config check)
const HP_QUESTIONS = [
  { q: 'What is the name of Harry Potter\'s owl? 🦉', a: 'hedwig' },
  { q: 'What house is Harry Potter sorted into at Hogwarts? 🏰', a: 'gryffindor' },
  { q: 'What is the name of Hagrid\'s three-headed dog? 🐶', a: 'fluffy' },
  { q: 'What position does Harry play in Quidditch? 🧹', a: 'seeker' },
  { q: 'What is the core of Harry Potter\'s wand? 🪄', a: 'phoenix feather' },
  { q: 'Who is the Half-Blood Prince? 🖤', a: 'snape' },
  { q: 'What magical creature guards Azkaban? 👻', a: 'dementor' },
];
const _hpQ = HP_QUESTIONS[Math.floor(Math.random() * HP_QUESTIONS.length)];
document.getElementById('hpQuestion').textContent = _hpQ.q;


document.addEventListener('click', async (e) => {
  const ok = await checkConfig();
  if (!ok) e.stopImmediatePropagation();
}, true);

(async () => {
  const ok = await checkConfig();
  if (!ok) return;
  document.body.style.visibility = '';
  initApp();
})();

function initApp() {

// ══ VERIFICATION ══
// DOB: exactly July 3, year 2002-2006
const DOB_DAY = 3, DOB_MONTH = 7, DOB_YEARS = [2002,2003,2004,2005,2006];

document.getElementById('hpNextBtn').addEventListener('click', () => {
  const val = document.getElementById('hpAnswer').value.trim().toLowerCase();
  if (!val.includes(_hpQ.a)) {
    trackEvent('hpNextBtn', { correct: false });
    document.getElementById('hpError').textContent = 'Not quite… try again! ⚡';
    return;
  }
  trackEvent('hpNextBtn', { correct: true });
  document.getElementById('hpError').textContent = '';
  document.getElementById('verifyStep1').style.display = 'none';
  document.getElementById('verifyStep2').style.display = '';
});

document.getElementById('dobBackBtn').addEventListener('click', () => {
  document.getElementById('verifyStep2').style.display = 'none';
  document.getElementById('verifyStep1').style.display = '';
});

document.getElementById('dobEnterBtn').addEventListener('click', () => {
  const d = parseInt(document.getElementById('dobDay').value);
  const m = parseInt(document.getElementById('dobMonth').value);
  const y = parseInt(document.getElementById('dobYear').value);
  if (d !== DOB_DAY || m !== DOB_MONTH || !DOB_YEARS.includes(y)) {
    trackEvent('dobEnterBtn', { correct: false });
    document.getElementById('dobError').textContent = 'Hmm, that doesn\'t match';
    return;
  }
  trackEvent('dobEnterBtn', { correct: true });
  goTo('page1', 'page0');
});

// ══ PAGE NAVIGATION ══
function goTo(toId, fromId) {
  const from = document.getElementById(fromId);
  const to   = document.getElementById(toId);
  from.classList.remove('active');
  from.classList.add('exit-left');
  to.classList.add('enter-right');
  to.getBoundingClientRect();
  to.classList.remove('enter-right');
  to.classList.add('active');
  setTimeout(() => from.classList.remove('exit-left'), 600);
  if (toId === 'page2') staggerCards();
}

function goBack(toId, fromId) {
  const from = document.getElementById(fromId);
  const to   = document.getElementById(toId);
  from.classList.remove('active');
  from.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
  from.style.opacity = '0';
  from.style.transform = 'translateX(80px)';
  setTimeout(() => { from.style.transition = from.style.opacity = from.style.transform = ''; }, 450);
  to.style.transition = 'none';
  to.style.opacity = '0';
  to.style.transform = 'translateX(-60px)';
  to.classList.add('active');
  to.getBoundingClientRect();
  to.style.transition = to.style.opacity = to.style.transform = '';
}

// ══ FALLING PETALS (hero) ══
const petalEmojis = ['🌸', '🌹', '🌺', '💮', '🌷', '💕', '✨'];

function spawnPetals(wrapperId, count) {
  const wrap = document.getElementById(wrapperId);
  if (!wrap) return;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('span');
    p.className = 'petal';
    p.textContent = petalEmojis[Math.floor(Math.random() * petalEmojis.length)];
    p.style.cssText = `
      left:${Math.random() * 100}vw;
      font-size:${1 + Math.random() * 1.4}rem;
      animation-duration:${7 + Math.random() * 9}s;
      animation-delay:${Math.random() * 12}s;
    `;
    wrap.appendChild(p);
  }
}

spawnPetals('petals', 22);
spawnPetals('petals2', 22);

// ══ STAGGER CARDS ══
function staggerCards() {
  const cards = document.querySelectorAll('.activity-card');
  cards.forEach(c => c.classList.remove('visible'));
  requestAnimationFrame(() => {
    cards.forEach((c, i) => setTimeout(() => c.classList.add('visible'), i * 70));
  });
}

// ══ NAVIGATION EVENTS ══
document.getElementById('startBtn').addEventListener('click', () => { trackEvent('startBtn'); goTo('page2', 'page1'); });

document.getElementById('backToHero').addEventListener('click', () => goBack('page1', 'page2'));
document.getElementById('backToActivities').addEventListener('click', () => goBack('page2', 'page3'));

document.getElementById('toCalendarBtn').addEventListener('click', () => {
  trackEvent('toCalendarBtn', { selected: [...document.querySelectorAll('.activity-card input:checked')].map(c => c.value) });
  const checked = [...document.querySelectorAll('.activity-card input:checked')];
  if (checked.length === 0) { shakeBtn(document.getElementById('toCalendarBtn')); return; }
  goTo('page3', 'page2');
});

// ══ CALENDAR ══
let currentDate = new Date();
let selectedDate = null;
const today = new Date();
today.setHours(0, 0, 0, 0);
const maxDate = new Date(today);
maxDate.setMonth(maxDate.getMonth() + 1);

const monthNames = ['January','February','March','April','May','June',
                    'July','August','September','October','November','December'];

function renderCalendar() {
  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth();
  document.getElementById('monthYear').textContent = `${monthNames[month]} ${year}`;
  const grid = document.getElementById('calGrid');
  grid.innerHTML = '';
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let i = 0; i < firstDay; i++) {
    const e = document.createElement('div');
    e.className = 'cal-day empty';
    grid.appendChild(e);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dayEl  = document.createElement('div');
    dayEl.className = 'cal-day';
    dayEl.textContent = d;
    const thisDay = new Date(year, month, d);
    thisDay.setHours(0, 0, 0, 0);
    if (thisDay < today || thisDay > maxDate) {
      dayEl.classList.add('past');
    } else {
      if (thisDay.getTime() === today.getTime()) dayEl.classList.add('today');
      if (selectedDate && thisDay.getTime() === selectedDate.getTime()) dayEl.classList.add('selected');
      dayEl.addEventListener('click', () => {
        selectedDate = thisDay;
        document.getElementById('selectedDateDisplay').textContent =
          `🌸 ${monthNames[month]} ${d}, ${year}`;
        renderCalendar();
      });
    }
    grid.appendChild(dayEl);
  }
}

document.getElementById('prevMonth').addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar();
});
document.getElementById('nextMonth').addEventListener('click', () => {
  const next = new Date(currentDate);
  next.setMonth(next.getMonth() + 1);
  if (next.getFullYear() > maxDate.getFullYear() ||
     (next.getFullYear() === maxDate.getFullYear() && next.getMonth() > maxDate.getMonth())) return;
  currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar();
});
renderCalendar();

// ══ TIME PICKER ══
const timeState = { startHour: 9, startMin: 0, startAmpm: 'AM', endHour: 9, endMin: 0, endAmpm: 'PM' };

function pad(n) { return String(n).padStart(2, '0'); }

function toMinutes(h, m, ampm) {
  let hour = h % 12;
  if (ampm === 'PM') hour += 12;
  return hour * 60 + m;
}

function updateTimeUI() {
  document.getElementById('startHour').textContent = pad(timeState.startHour);
  document.getElementById('startMin').textContent  = pad(timeState.startMin);
  document.getElementById('endHour').textContent   = pad(timeState.endHour);
  document.getElementById('endMin').textContent    = pad(timeState.endMin);
  document.getElementById('startAmpm').textContent = timeState.startAmpm;
  document.getElementById('endAmpm').textContent   = timeState.endAmpm;

  const startMins = toMinutes(timeState.startHour, timeState.startMin, timeState.startAmpm);
  const endMins   = toMinutes(timeState.endHour,   timeState.endMin,   timeState.endAmpm);
  const total     = 24 * 60;
  const left      = (startMins / total) * 100;
  const width     = Math.max(((endMins - startMins + total) % total) / total * 100, 2);
  const fill      = document.getElementById('timeBarFill');
  fill.style.left  = left + '%';
  fill.style.width = width + '%';

  document.getElementById('timeSummary').textContent =
    `${pad(timeState.startHour)}:${pad(timeState.startMin)} ${timeState.startAmpm}   ${pad(timeState.endHour)}:${pad(timeState.endMin)} ${timeState.endAmpm}`;
}

document.querySelectorAll('.time-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.target;
    const dir    = btn.dataset.dir === 'up' ? 1 : -1;
    if (target === 'startHour') timeState.startHour = ((timeState.startHour - 1 + dir + 12) % 12) + 1;
    if (target === 'startMin')  timeState.startMin  = (timeState.startMin + dir * 5 + 60) % 60;
    if (target === 'endHour')   timeState.endHour   = ((timeState.endHour - 1 + dir + 12) % 12) + 1;
    if (target === 'endMin')    timeState.endMin    = (timeState.endMin + dir * 5 + 60) % 60;
    updateTimeUI();
  });
});

document.getElementById('startAmpm').addEventListener('click', () => {
  timeState.startAmpm = timeState.startAmpm === 'AM' ? 'PM' : 'AM'; updateTimeUI();
});
document.getElementById('endAmpm').addEventListener('click', () => {
  timeState.endAmpm = timeState.endAmpm === 'AM' ? 'PM' : 'AM'; updateTimeUI();
});
updateTimeUI();

// ══ GENERATE ══
document.getElementById('generateBtn').addEventListener('click', () => {
  trackEvent('generateBtn');
  if (!selectedDate) {
    shakeBtn(document.getElementById('generateBtn'));
    const disp = document.getElementById('selectedDateDisplay');
    disp.textContent = '💔 Please choose a special day first';
    disp.style.color = '#e87a5b';
    setTimeout(() => { disp.style.color = ''; disp.textContent = 'No day chosen yet'; }, 2200);
    return;
  }

  const checked = [...document.querySelectorAll('.activity-card input:checked')];
  const note    = document.getElementById('loveNote').value.trim();
  const dateStr = selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  document.getElementById('resultDate').textContent = `🗓️ ${dateStr}`;
  document.getElementById('resultTime').textContent =
    `🕐 ${pad(timeState.startHour)}:${pad(timeState.startMin)} ${timeState.startAmpm}  —  ${pad(timeState.endHour)}:${pad(timeState.endMin)} ${timeState.endAmpm}`;

  const actDiv = document.getElementById('resultActivities');
  actDiv.innerHTML = '';
  checked.forEach((cb, i) => {
    const tag = document.createElement('span');
    tag.className = 'result-tag';
    tag.style.animationDelay = `${0.3 + i * 0.08}s`;
    tag.textContent = cb.value;
    actDiv.appendChild(tag);
  });

  const noteEl = document.getElementById('resultNote');
  if (note) { noteEl.textContent = `"${note}"`; noteEl.style.display = 'block'; }
  else       { noteEl.style.display = 'none'; }

  goTo('page4', 'page3');
  setTimeout(launchHearts, 400);
  // ══ Save to MongoDB ══
  fetch(`${_API_BASE}/api/booking`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      date:       dateStr,
      timeFrom:   `${pad(timeState.startHour)}:${pad(timeState.startMin)} ${timeState.startAmpm}`,
      timeTill:   `${pad(timeState.endHour)}:${pad(timeState.endMin)} ${timeState.endAmpm}`,
      activities: checked.map(cb => cb.value),
      note
    })
  })
  .then(r => r.json())
  .then(() => showToast('Plan saved!'))
  .catch(() => showToast('⚠️ Could not save plan'));
});

// ══ RESTART ══
document.getElementById('restartBtn').addEventListener('click', () => {
  trackEvent('restartBtn');
  document.querySelectorAll('.activity-card input').forEach(cb => cb.checked = false);
  document.getElementById('loveNote').value = '';
  selectedDate = null;
  currentDate = new Date();
  document.getElementById('selectedDateDisplay').textContent = 'No day chosen yet 🌸';
  renderCalendar();
  goBack('page1', 'page4');
});

// ══ HEART CONFETTI ══
function launchHearts() {
  const wrap   = document.getElementById('confettiWrap');
  wrap.innerHTML = '';
  const items  = ['💕','🌸','✨','💖','🌹','💗','⭐','🌺'];
  for (let i = 0; i < 60; i++) {
    const c = document.createElement('div');
    c.className = 'confetti-piece';
    c.textContent = items[Math.floor(Math.random() * items.length)];
    c.style.cssText = `
      left:${Math.random() * 100}vw;
      font-size:${1 + Math.random() * 1.5}rem;
      animation-duration:${1.8 + Math.random() * 2.5}s;
      animation-delay:${Math.random() * 1}s;
    `;
    wrap.appendChild(c);
  }
  setTimeout(() => wrap.innerHTML = '', 5000);
}

// ══ TOAST ══
function showToast(msg) {
  const t = document.createElement('div');
  t.textContent = msg;
  t.style.cssText = `
    position:fixed; bottom:2rem; left:50%; transform:translateX(-50%);
    background:linear-gradient(135deg,var(--rose),var(--rose-dark));
    color:white; padding:0.7rem 1.8rem; border-radius:50px;
    font-size:0.9rem; font-weight:700; z-index:999;
    box-shadow:0 8px 30px rgba(232,84,122,0.5);
    animation:toastIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both;
  `;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// ══ SHAKE ══
function shakeBtn(btn) {
  btn.animate([
    { transform: 'translateX(0)' },
    { transform: 'translateX(-8px)' },
    { transform: 'translateX(8px)' },
    { transform: 'translateX(-6px)' },
    { transform: 'translateX(6px)' },
    { transform: 'translateX(0)' },
  ], { duration: 400, easing: 'ease-in-out' });
}

// ══ GIFT WHEEL ══
const PRIZES = [
  { label: 'KitKat',     color: '#e8547a' },
  { label: 'Dairy Milk', color: '#c0395a' },
  { label: 'Ferrero',    color: '#e8b86d' },
  { label: 'Snickers',   color: '#7a1a35' },
  { label: 'Kinder Joy', color: '#c0395a' },
  { label: 'Lindt',      color: '#e8b86d' },
  { label: 'Bounty',     color: '#e8547a' },
];

const wheelCanvas = document.getElementById('wheelCanvas');
const wCtx = wheelCanvas.getContext('2d');
const TOTAL = PRIZES.length;
const ARC = (Math.PI * 2) / TOTAL;
let wheelAngle = 0;
let wheelSpinning = false;

function drawWheel(angle) {
  const cx = 150, cy = 150, r = 140;
  wCtx.clearRect(0, 0, 300, 300);

  PRIZES.forEach((p, i) => {
    const start = angle + i * ARC;
    const end   = start + ARC;

    // slice fill
    wCtx.beginPath();
    wCtx.moveTo(cx, cy);
    wCtx.arc(cx, cy, r, start, end);
    wCtx.closePath();
    wCtx.fillStyle = p.color;
    wCtx.fill();

    // slice border
    wCtx.beginPath();
    wCtx.moveTo(cx, cy);
    wCtx.arc(cx, cy, r, start, end);
    wCtx.closePath();
    wCtx.strokeStyle = 'rgba(255,255,255,0.35)';
    wCtx.lineWidth = 2;
    wCtx.stroke();

    // label
    wCtx.save();
    wCtx.translate(cx, cy);
    wCtx.rotate(start + ARC / 2);
    wCtx.textAlign = 'right';
    wCtx.fillStyle = '#fff';
    wCtx.font = 'bold 13px Lato, sans-serif';
    wCtx.shadowColor = 'rgba(0,0,0,0.9)';
    wCtx.shadowBlur = 5;
    wCtx.fillText(p.label, r - 10, 5);
    wCtx.shadowBlur = 0;
    wCtx.restore();
  });

  // outer border ring
  wCtx.beginPath();
  wCtx.arc(cx, cy, r, 0, Math.PI * 2);
  wCtx.strokeStyle = '#fff';
  wCtx.lineWidth = 5;
  wCtx.stroke();

  // inner dots on border
  for (let i = 0; i < TOTAL * 2; i++) {
    const a = (i / (TOTAL * 2)) * Math.PI * 2 + angle;
    const dx = cx + Math.cos(a) * (r - 8);
    const dy = cy + Math.sin(a) * (r - 8);
    wCtx.beginPath();
    wCtx.arc(dx, dy, 3, 0, Math.PI * 2);
    wCtx.fillStyle = i % 2 === 0 ? '#ffd700' : '#fff';
    wCtx.fill();
  }

  // center hub gradient
  const hub = wCtx.createRadialGradient(cx, cy, 0, cx, cy, 26);
  hub.addColorStop(0, '#ffffff');
  hub.addColorStop(0.5, '#ffd700');
  hub.addColorStop(1, '#b8860b');
  wCtx.beginPath();
  wCtx.arc(cx, cy, 26, 0, Math.PI * 2);
  wCtx.fillStyle = hub;
  wCtx.fill();
  wCtx.strokeStyle = 'rgba(255,255,255,0.8)';
  wCtx.lineWidth = 3;
  wCtx.stroke();

  // center star
  wCtx.fillStyle = '#1a0510';
  wCtx.font = 'bold 18px sans-serif';
  wCtx.textAlign = 'center';
  wCtx.textBaseline = 'middle';
  wCtx.fillText('★', cx, cy);
  wCtx.textBaseline = 'alphabetic';
}

drawWheel(0);

document.getElementById('spinBtn').addEventListener('click', () => {
  if (wheelSpinning) return;
  wheelSpinning = true;
  document.getElementById('wheelResult').textContent = '';
  document.getElementById('spinBtn').disabled = true;

  const extraSpins = (6 + Math.floor(Math.random() * 5)) * Math.PI * 2;
  const targetAngle = wheelAngle + extraSpins + Math.random() * Math.PI * 2;
  const duration = 5000;
  const startTime = performance.now();
  const startAngle = wheelAngle;

  function easeOut(t) { return 1 - Math.pow(1 - t, 4); }

  function frame(now) {
    const t = Math.min((now - startTime) / duration, 1);
    wheelAngle = startAngle + (targetAngle - startAngle) * easeOut(t);
    drawWheel(wheelAngle);
    if (t < 1) { requestAnimationFrame(frame); return; }
    // pointer is on the RIGHT → winning slice is at angle 0 (3 o'clock)
    const normalized = ((-wheelAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const idx = Math.floor(normalized / ARC) % TOTAL;
    document.getElementById('wheelResult').textContent = `🎉 ${PRIZES[idx].label} 🍫`;
    wheelSpinning = false;
    document.getElementById('spinBtn').disabled = false;
  }
  requestAnimationFrame(frame);
});

document.getElementById('spinWheelBtn').addEventListener('click', () => {
  trackEvent('spinWheelBtn');
  document.getElementById('wheelModal').classList.add('active');
  drawWheel(wheelAngle);
});
document.getElementById('wheelClose').addEventListener('click', () => {
  document.getElementById('wheelModal').classList.remove('active');
});


let floodRAF = null, tearRAF = null;
let floodLevel = 0;
const FLOOD_SPEED = 0.005;

function initFlood() {
  const canvas = document.getElementById('floodCanvas');
  const ctx    = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const POINTS = 7;
  let wave1 = Array.from({length: POINTS}, (_, i) => ({ x: i / (POINTS-1), speed: 0.4 + Math.random()*0.4, phase: Math.random()*Math.PI*2 }));
  let wave2 = Array.from({length: POINTS}, (_, i) => ({ x: i / (POINTS-1), speed: 0.3 + Math.random()*0.3, phase: Math.random()*Math.PI*2 }));

  let t = 0;

  function drawFlood() {
    ctx.clearRect(0, 0, W, H);
    if (floodLevel <= 0) { floodRAF = requestAnimationFrame(drawFlood); return; }

    t += 0.02;
    const baseY = H * (1 - floodLevel);
    const amp   = Math.min(floodLevel * 40, 28);

    function wavePath(pts, offset) {
      ctx.beginPath();
      ctx.moveTo(0, H);
      ctx.lineTo(0, baseY + Math.sin(t * pts[0].speed + pts[0].phase + offset) * amp);
      for (let i = 0; i < pts.length - 1; i++) {
        const x0 = pts[i].x * W;
        const x1 = pts[i+1].x * W;
        const y0 = baseY + Math.sin(t * pts[i].speed   + pts[i].phase   + offset) * amp;
        const y1 = baseY + Math.sin(t * pts[i+1].speed + pts[i+1].phase + offset) * amp;
        const cx = (x0 + x1) / 2;
        ctx.bezierCurveTo(cx, y0, cx, y1, x1, y1);
      }
      ctx.lineTo(W, H);
      ctx.closePath();
    }

    const grad = ctx.createLinearGradient(0, baseY, 0, H);
    grad.addColorStop(0,   'rgba(30,100,220,0.55)');
    grad.addColorStop(0.4, 'rgba(20,70,180,0.7)');
    grad.addColorStop(1,   'rgba(10,30,120,0.9)');
    wavePath(wave1, 0);
    ctx.fillStyle = grad;
    ctx.fill();

    wavePath(wave2, Math.PI * 0.6);
    ctx.fillStyle = 'rgba(80,160,255,0.18)';
    ctx.fill();

    // glowing surface line
    ctx.beginPath();
    ctx.moveTo(0, baseY + Math.sin(t * wave1[0].speed + wave1[0].phase) * amp);
    for (let i = 0; i < wave1.length - 1; i++) {
      const x0 = wave1[i].x * W;
      const x1 = wave1[i+1].x * W;
      const y0 = baseY + Math.sin(t * wave1[i].speed   + wave1[i].phase)   * amp;
      const y1 = baseY + Math.sin(t * wave1[i+1].speed + wave1[i+1].phase) * amp;
      ctx.bezierCurveTo((x0+x1)/2, y0, (x0+x1)/2, y1, x1, y1);
    }
    ctx.strokeStyle = 'rgba(140,210,255,0.6)';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = 'rgba(100,180,255,0.8)';
    ctx.shadowBlur  = 12;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // foam bubbles
    for (let i = 0; i < 5; i++) {
      const bx = ((t * 30 * (i+1) * 37) % W);
      const by = baseY + Math.sin(t * wave1[i % POINTS].speed + wave1[i % POINTS].phase) * amp - 4;
      ctx.beginPath();
      ctx.arc(bx, by, 3 + (i % 3), 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(200,235,255,0.35)';
      ctx.fill();
    }

    floodRAF = requestAnimationFrame(drawFlood);
  }
  drawFlood();
}

function spawnTears() {
  const overlay = document.getElementById('cryOverlay');
  const emoji   = document.getElementById('cryEmoji');

  function drop() {
    if (!document.getElementById('cryOverlay').classList.contains('active')) return;
    const rect = emoji.getBoundingClientRect();
    [0.32, 0.68].forEach(xFrac => {
      const el = document.createElement('div');
      el.className = 'tear-drop';
      const size = 7 + Math.random() * 6;
      el.style.cssText = `
        left:${rect.left + rect.width * xFrac - size/2}px;
        top:${rect.bottom - 20}px;
        width:${size}px;
        height:${size * 2.2}px;
        animation-duration:${0.8 + Math.random() * 0.6}s;
        animation-delay:${Math.random() * 0.2}s;
        position:fixed;
      `;
      overlay.appendChild(el);
      setTimeout(() => el.remove(), 1600);
    });
    tearRAF = setTimeout(drop, 120 + Math.random() * 80);
  }
  drop();
}

let fishTimer = null;

function spawnFish() {
  const emojis = ['🐟','🐠','🐡','🐙'];
  const overlay = document.getElementById('cryOverlay');
  function addFish() {
    if (!document.getElementById('cryOverlay').classList.contains('active')) return;
    const el      = document.createElement('div');
    const flipped = Math.random() > 0.5;
    el.className  = 'fish';
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    overlay.appendChild(el);

    const waterTop    = (1 - floodLevel) * window.innerHeight;
    const waterBottom = window.innerHeight - 20;
    let x = window.innerWidth + 20;
    let y = waterTop + Math.random() * (waterBottom - waterTop - 20);
    const speedX = 2.0 + Math.random() * 1.6;
    let speedY   = 0;
    let targetY  = y;
    let changeIn = 250 + Math.random() * 350;    // change target less often
    let frame    = 0;

    // stunt: sommersault
    let rotation   = 0;
    let spinning   = false;
    let spinSpeed  = 0;
    let nextStunt  = 400 + Math.floor(Math.random() * 500);

    function animate() {
      if (!document.getElementById('cryOverlay').classList.contains('active')) { el.remove(); return; }
      x -= speedX;
      frame++;

      // trigger stunt
      if (frame === nextStunt) {
        spinning  = true;
        spinSpeed = 8 + Math.random() * 6;       // degrees per frame
        nextStunt = frame + 250 + Math.floor(Math.random() * 300);
      }
      if (spinning) {
        rotation += spinSpeed;
        if (rotation >= 360) { rotation = 0; spinning = false; spinSpeed = 0; }
      }

      // slow vertical drift
      if (frame >= changeIn) {
        frame    = 0;
        changeIn = 120 + Math.random() * 180;
        targetY  = waterTop + 10 + Math.random() * (waterBottom - waterTop - 30);
      }
      speedY += (targetY - y) * 0.0005;
      speedY *= 0.98;
      y += speedY;
      y = Math.max(waterTop + 5, Math.min(waterBottom - 5, y));

      const scaleX = flipped ? -1 : 1;
      el.style.left      = x + 'px';
      el.style.top       = y + 'px';
      el.style.transform = `scaleX(${scaleX}) rotate(${rotation}deg)`;

      if (x < -40) { el.remove(); return; }
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
    fishTimer = setTimeout(addFish, 700 + Math.random() * 900);
  }
  addFish();
}

function launchTears() {
  floodLevel = 0;
  initFlood();
  spawnTears();
  let fishStarted = false;
  function rise() {
    if (!document.getElementById('cryOverlay').classList.contains('active')) return;
    floodLevel = Math.min(floodLevel + FLOOD_SPEED, 0.82);
    if (floodLevel < 0.82) {
      requestAnimationFrame(rise);
    } else if (!fishStarted) {
      fishStarted = true;
      spawnFish();
    }
  }
  requestAnimationFrame(rise);
}

function stopTears() {
  cancelAnimationFrame(floodRAF);
  clearTimeout(tearRAF);
  clearTimeout(fishTimer);
  floodLevel = 0;
  const canvas = document.getElementById('floodCanvas');
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  document.querySelectorAll('.tear-drop, .fish').forEach(el => el.remove());
}

document.getElementById('notInterestedBtn2').addEventListener('click', () => {
  trackEvent('notInterestedBtn2', { notInterested: true });
  const overlay = document.getElementById('cryOverlay');
  overlay.classList.add('active');
  launchTears();
});

document.getElementById('cryDismiss').addEventListener('click', () => {
  const overlay = document.getElementById('cryOverlay');
  overlay.classList.remove('active');
  stopTears();
});

} // end initApp
