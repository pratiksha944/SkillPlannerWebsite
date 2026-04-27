/* =============================================
   SKILLFORGE — MAIN JAVASCRIPT
   Mini Project: Skill Planner Website
   ============================================= */

/* --- NAV TOGGLE (Mobile) --- */
function toggleMenu() {
  const nav = document.querySelector('.nav-links');
  if (nav) nav.classList.toggle('open');
}

/* --- SKILLS PAGE: Filter --- */
function filterSkills(cat, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.skill-card').forEach(card => {
    card.classList.toggle('hidden', cat !== 'all' && card.dataset.cat !== cat);
  });
}

/* --- SKILLS PAGE: Search --- */
function searchSkills(query) {
  query = query.toLowerCase();
  document.querySelectorAll('.skill-card').forEach(card => {
    const text = card.textContent.toLowerCase();
    card.classList.toggle('hidden', query && !text.includes(query));
  });
}

/* --- PLANNER PAGE --- */
let plans = JSON.parse(localStorage.getItem('sf_plans') || '[]');

function updateHrs(val) {
  const el = document.getElementById('hrsVal');
  if (el) el.textContent = val;
}

function addPlan() {
  const name = document.getElementById('skillName')?.value.trim();
  const cat = document.getElementById('skillCat')?.value;
  const level = document.querySelector('input[name="level"]:checked')?.value || 'Beginner';
  const start = document.getElementById('startDate')?.value;
  const end = document.getElementById('endDate')?.value;
  const hrs = document.getElementById('hoursRange')?.value || 5;
  const notes = document.getElementById('goalNotes')?.value;
  const days = [...document.querySelectorAll('.days-group input:checked')].map(i => i.value);

  if (!name) { alert('Please enter a skill name!'); return; }
  if (!start || !end) { alert('Please select start and end dates!'); return; }
  if (new Date(start) >= new Date(end)) { alert('End date must be after start date!'); return; }

  const plan = { id: Date.now(), name, cat, level, start, end, hrs, notes, days };
  plans.push(plan);
  localStorage.setItem('sf_plans', JSON.stringify(plans));
  renderPlans();
  updateSchedule();
  clearPlanForm();
}

function clearPlanForm() {
  const fields = ['skillName', 'startDate', 'endDate', 'goalNotes'];
  fields.forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  const hrsEl = document.getElementById('hoursRange');
  if (hrsEl) { hrsEl.value = 5; updateHrs(5); }
}

function renderPlans() {
  const container = document.getElementById('plansContainer');
  const countEl = document.getElementById('planCount');
  if (!container) return;

  if (countEl) countEl.textContent = plans.length;

  if (plans.length === 0) {
    container.innerHTML = '<div class="empty-state"><div style="font-size:3rem">📋</div><p>No plans yet. Create your first skill plan!</p></div>';
    return;
  }

  container.innerHTML = plans.map(p => `
    <div class="plan-item">
      <div class="plan-item-header">
        <h4>${p.name}</h4>
        <button class="plan-delete" onclick="deletePlan(${p.id})">✕</button>
      </div>
      <div class="plan-item-meta">
        <span>${p.cat}</span>
        <span>📊 ${p.level}</span>
        <span>⏱ ${p.hrs} hrs/week</span>
        <span>📅 ${formatDate(p.start)} → ${formatDate(p.end)}</span>
      </div>
      ${p.days.length ? `<div style="margin-top:0.5rem;font-size:0.82rem;color:var(--muted)">Days: ${p.days.join(', ')}</div>` : ''}
      ${p.notes ? `<div style="margin-top:0.4rem;font-size:0.85rem;color:var(--muted);font-style:italic">"${p.notes}"</div>` : ''}
    </div>
  `).join('');
}

function deletePlan(id) {
  plans = plans.filter(p => p.id !== id);
  localStorage.setItem('sf_plans', JSON.stringify(plans));
  renderPlans();
  updateSchedule();
}

function updateSchedule() {
  const daySlots = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  daySlots.forEach(day => {
    const slot = document.getElementById(`slot-${day}`);
    if (!slot) return;
    const dayPlans = plans.filter(p => p.days && p.days.includes(day));
    if (dayPlans.length === 0) {
      slot.textContent = '—';
      slot.className = 'wd-slot';
    } else {
      slot.innerHTML = dayPlans.map(p =>
        `<span style="display:block;font-size:0.78rem;font-weight:600">${p.name}</span>`
      ).join('');
      slot.className = 'wd-slot has-plan';
    }
  });
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
}

// Init planner
if (document.getElementById('plansContainer')) {
  renderPlans();
  updateSchedule();
  const today = new Date().toISOString().split('T')[0];
  const startEl = document.getElementById('startDate');
  if (startEl) startEl.value = today;
}

/* --- PROGRESS PAGE --- */
const progressData = {
  react: { val: 72, total: 100 },
  python: { val: 88, total: 100 },
  uiux: { val: 45, total: 100 }
};

function updateProgress(skill, add) {
  const data = progressData[skill];
  if (!data) return;
  data.val = Math.min(100, data.val + add);
  const pct = Math.round(data.val);
  const fillEl = document.getElementById(`${skill}-fill`);
  const pctEl = document.getElementById(`${skill}-pct`);
  if (fillEl) fillEl.style.width = pct + '%';
  if (pctEl) pctEl.textContent = pct + '%';
  if (pct === 100) {
    setTimeout(() => alert(`🎉 Congratulations! You've completed this skill! You earned the Master badge!`), 200);
  }
}

function resetProgress(skill) {
  progressData[skill].val = 0;
  const fillEl = document.getElementById(`${skill}-fill`);
  const pctEl = document.getElementById(`${skill}-pct`);
  if (fillEl) fillEl.style.width = '0%';
  if (pctEl) pctEl.textContent = '0%';
}

function logSession() {
  const skill = document.getElementById('logSkill')?.value;
  const hrs = parseFloat(document.getElementById('logHrs')?.value);
  const notes = document.getElementById('logNotes')?.value;

  if (!hrs || hrs <= 0) { alert('Please enter valid hours!'); return; }

  // Map skill name to key
  const map = { 'React.js': 'react', 'Python Programming': 'python', 'UI/UX Design': 'uiux' };
  const key = map[skill];
  if (key) updateProgress(key, hrs);

  alert(`✅ Session logged! ${hrs} hrs of ${skill} recorded.`);
  if (document.getElementById('logHrs')) document.getElementById('logHrs').value = '';
  if (document.getElementById('logNotes')) document.getElementById('logNotes').value = '';
}

// Init progress date
if (document.getElementById('logDate')) {
  document.getElementById('logDate').value = new Date().toISOString().split('T')[0];
}

/* --- CONTACT PAGE --- */
function submitContact() {
  const name = document.getElementById('cName')?.value.trim();
  const email = document.getElementById('cEmail')?.value.trim();
  const msg = document.getElementById('cMessage')?.value.trim();

  if (!name) { alert('Please enter your name!'); return; }
  if (!email || !email.includes('@')) { alert('Please enter a valid email!'); return; }
  if (!msg) { alert('Please write a message!'); return; }

  const successEl = document.getElementById('formSuccess');
  if (successEl) {
    successEl.style.display = 'block';
    // Clear form
    ['cName','cEmail','cPhone','cMessage'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    setTimeout(() => { successEl.style.display = 'none'; }, 5000);
  }
}

function toggleFaq(item) {
  item.classList.toggle('open');
}

/* --- SCROLL ANIMATIONS --- */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.feat-card, .skill-prev-card, .testi-card, .step, .psc-card, .badge, .ci-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});

/* --- ACTIVE NAV HIGHLIGHT --- */
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach(link => {
  const href = link.getAttribute('href');
  if (href === currentPage) link.classList.add('active');
});