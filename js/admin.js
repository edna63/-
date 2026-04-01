const SUPABASE_URL = 'https://tymebfuhemhadtyqyntr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5bWViZnVoZW1oYWR0eXF5bnRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NzMyNzYsImV4cCI6MjA5MDU0OTI3Nn0.BURDVP3mZNgaTcXZyjRtubSpl2Ne3I9I4gA9BpiK2oA';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const ADMIN_PASSWORD = 'edna2026';
let allBookings = [];
let currentFilter = 'all';

function checkPassword() {
  const pwd = document.getElementById('password-input').value;
  if (pwd === ADMIN_PASSWORD) {
    sessionStorage.setItem('admin', '1');
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    loadBookings();
  } else {
    document.getElementById('login-error').textContent = 'סיסמה שגויה';
  }
}

document.getElementById('password-input')?.addEventListener('keydown', e => {
  if (e.key === 'Enter') checkPassword();
});

function logout() {
  sessionStorage.removeItem('admin');
  location.reload();
}

if (sessionStorage.getItem('admin') === '1') {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('dashboard').style.display = 'block';
  loadBookings();
}

async function loadBookings() {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('date', { ascending: true })
    .order('time', { ascending: true });

  if (error) { document.getElementById('bookings-list').innerHTML = '<p>שגיאה בטעינה</p>'; return; }

  allBookings = data;
  updateTodayCount();
  renderBookings(allBookings);
}

function updateTodayCount() {
  const today = new Date().toISOString().split('T')[0];
  const count = allBookings.filter(b => b.date === today && b.status !== 'cancelled').length;
  document.getElementById('today-count').textContent = `היום: ${count} תורים`;
}

function filterBookings(status, btn) {
  currentFilter = status;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('filter-date').value = '';
  const filtered = status === 'all' ? allBookings : allBookings.filter(b => b.status === status);
  renderBookings(filtered);
}

function filterByDate() {
  const date = document.getElementById('filter-date').value;
  if (!date) { renderBookings(allBookings); return; }
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  renderBookings(allBookings.filter(b => b.date === date));
}

function renderBookings(bookings) {
  const list = document.getElementById('bookings-list');
  if (!bookings.length) {
    list.innerHTML = '<div class="empty">אין תורים להצגה</div>';
    return;
  }

  const grouped = {};
  bookings.forEach(b => {
    if (!grouped[b.date]) grouped[b.date] = [];
    grouped[b.date].push(b);
  });

  list.innerHTML = Object.entries(grouped).map(([date, items]) => `
    <div class="date-group">
      <h3 class="date-label">${formatDate(date)}</h3>
      ${items.map(b => `
        <div class="booking-card status-${b.status}">
          <div class="booking-time">${b.time}</div>
          <div class="booking-info">
            <strong>${b.name}</strong>
            <a href="tel:${b.phone}">${b.phone}</a>
            <span class="booking-service">${b.service}</span>
            ${b.notes ? `<span class="booking-notes">${b.notes}</span>` : ''}
          </div>
          <div class="booking-actions">
            <span class="status-badge status-${b.status}">${statusLabel(b.status)}</span>
            ${b.status === 'pending' ? `
              <button onclick="updateStatus('${b.id}','confirmed')" class="action-btn confirm">✓ אשרי</button>
              <button onclick="updateStatus('${b.id}','cancelled')" class="action-btn cancel">✕ בטלי</button>
            ` : ''}
            ${b.status === 'confirmed' ? `
              <button onclick="updateStatus('${b.id}','cancelled')" class="action-btn cancel">✕ בטלי</button>
            ` : ''}
          </div>
        </div>
      `).join('')}
    </div>
  `).join('');
}

async function updateStatus(id, status) {
  await supabase.from('bookings').update({ status }).eq('id', id);
  await loadBookings();
}

function statusLabel(s) {
  return { pending: 'ממתין', confirmed: 'מאושר', cancelled: 'בוטל' }[s] || s;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const days = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];
  return `יום ${days[d.getDay()]} · ${d.toLocaleDateString('he-IL')}`;
}
