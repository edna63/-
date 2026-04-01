const SUPABASE_URL = 'https://tymebfuhemhadtyqyntr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5bWViZnVoZW1oYWR0eXF5bnRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NzMyNzYsImV4cCI6MjA5MDU0OTI3Nn0.BURDVP3mZNgaTcXZyjRtubSpl2Ne3I9I4gA9BpiK2oA';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const ADMIN_PASSWORD = 'edna2026';
let allBookings = [];

/* ── AUTH ── */
function checkPassword() {
  if (document.getElementById('password-input').value === ADMIN_PASSWORD) {
    sessionStorage.setItem('admin','1');
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    loadBookings();
    loadImagePreviews();
  } else {
    document.getElementById('login-error').textContent = 'סיסמה שגויה';
  }
}
document.getElementById('password-input')?.addEventListener('keydown', e => { if(e.key==='Enter') checkPassword(); });
function logout() { sessionStorage.removeItem('admin'); location.reload(); }
if (sessionStorage.getItem('admin')==='1') {
  document.getElementById('login-screen').style.display='none';
  document.getElementById('dashboard').style.display='block';
  loadBookings(); loadImagePreviews();
}

/* ── TABS ── */
function showTab(name, btn) {
  document.getElementById('tab-bookings').style.display = name==='bookings' ? 'block' : 'none';
  document.getElementById('tab-images').style.display   = name==='images'   ? 'block' : 'none';
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
}

/* ── BOOKINGS ── */
async function loadBookings() {
  const { data } = await supabase.from('bookings').select('*').order('date').order('time');
  allBookings = data || [];
  updateTodayCount();
  renderBookings(allBookings);
}
function updateTodayCount() {
  const today = new Date().toISOString().split('T')[0];
  const n = allBookings.filter(b=>b.date===today && b.status!=='cancelled').length;
  document.getElementById('today-count').textContent = `היום: ${n} תורים`;
}
function filterBookings(status, btn) {
  document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('filter-date').value='';
  renderBookings(status==='all' ? allBookings : allBookings.filter(b=>b.status===status));
}
function filterByDate() {
  const d = document.getElementById('filter-date').value;
  document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
  renderBookings(d ? allBookings.filter(b=>b.date===d) : allBookings);
}
/* sanitize text to prevent XSS */
function esc(str) {
  const d = document.createElement('div');
  d.textContent = str || '';
  return d.innerHTML;
}

function renderBookings(list) {
  const el = document.getElementById('bookings-list');
  if (!list.length) { el.innerHTML='<div class="empty">אין תורים להצגה</div>'; return; }
  const grouped={};
  list.forEach(b=>{ if(!grouped[b.date]) grouped[b.date]=[]; grouped[b.date].push(b); });
  el.innerHTML=Object.entries(grouped).map(([date,items])=>`
    <div class="date-group">
      <h3 class="date-label">${formatDate(date)}</h3>
      ${items.map(b=>`
        <div class="booking-card status-${esc(b.status)}">
          <div class="booking-time">${esc(b.time)}</div>
          <div class="booking-info">
            <strong>${esc(b.name)}</strong>
            <a href="tel:${esc(b.phone)}">${esc(b.phone)}</a>
            <span class="booking-service">${esc(b.service)}</span>
            ${b.notes?`<span class="booking-notes">${esc(b.notes)}</span>`:''}
          </div>
          <div class="booking-actions">
            <span class="status-badge status-${esc(b.status)}">${statusLabel(b.status)}</span>
            ${b.status==='pending'?`
              <button onclick="updateStatus('${esc(b.id)}','confirmed')" class="action-btn confirm">✓ אשרי</button>
              <button onclick="updateStatus('${esc(b.id)}','cancelled')" class="action-btn cancel">✕ בטלי</button>`:''}
            ${b.status==='confirmed'?`
              <button onclick="updateStatus('${esc(b.id)}','cancelled')" class="action-btn cancel">✕ בטלי</button>`:''}
          </div>
        </div>`).join('')}
    </div>`).join('');
}
async function updateStatus(id,status) {
  await supabase.from('bookings').update({status}).eq('id',id);
  await loadBookings();
}
function statusLabel(s){ return {pending:'ממתין',confirmed:'מאושר',cancelled:'בוטל'}[s]||s; }
function formatDate(d) {
  const dt=new Date(d);
  const days=['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];
  return `יום ${days[dt.getDay()]} · ${dt.toLocaleDateString('he-IL')}`;
}

/* ── IMAGE UPLOAD ── */
async function loadImagePreviews() {
  const { data } = await supabase.from('settings').select('*');
  if (!data) return;
  data.forEach(row => {
    if (row.key==='about_photo' && row.value) showPreview('img-about-preview','img-about-empty',row.value);
    if (row.key==='hero_bg'     && row.value) showPreview('img-hero-preview','img-hero-empty',row.value);
  });
}

async function uploadImage(settingKey, fileInputId, previewId, emptyId, statusId) {
  const file = document.getElementById(fileInputId).files[0];
  if (!file) return;
  const status = document.getElementById(statusId);

  // validate file type
  const allowed = ['image/jpeg','image/png','image/webp','image/gif'];
  if (!allowed.includes(file.type)) {
    status.textContent = 'סוג קובץ לא נתמך. השתמשי ב-JPG, PNG או WebP';
    status.style.color = 'red';
    return;
  }
  // validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    status.textContent = 'הקובץ גדול מדי. מקסימום 5MB';
    status.style.color = 'red';
    return;
  }

  status.textContent = 'מעלה...';
  status.style.color = 'var(--text-md)';

  const ext  = file.name.split('.').pop();
  const path = `${settingKey}-${Date.now()}.${ext}`;

  const { error: upErr } = await supabase.storage.from('images').upload(path, file, { upsert: true });
  if (upErr) { status.textContent = 'שגיאה בהעלאה'; status.style.color='red'; return; }

  const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(path);

  const { error: dbErr } = await supabase.from('settings').upsert({ key: settingKey, value: publicUrl }, { onConflict: 'key' });
  if (dbErr) { status.textContent = 'שגיאה בשמירה'; status.style.color='red'; return; }

  showPreview(previewId, emptyId, publicUrl);
  status.textContent = '✅ הועלה בהצלחה!';
  status.style.color = '#27ae60';
}

function showPreview(previewId, emptyId, url) {
  const img = document.getElementById(previewId);
  img.src = url; img.style.display='block';
  document.getElementById(emptyId).style.display='none';
}
