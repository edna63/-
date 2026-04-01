const SUPABASE_URL = 'https://tymebfuhemhadtyqyntr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5bWViZnVoZW1oYWR0eXF5bnRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NzMyNzYsImV4cCI6MjA5MDU0OTI3Nn0.BURDVP3mZNgaTcXZyjRtubSpl2Ne3I9I4gA9BpiK2oA';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const ALL_SLOTS = ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00'];

// Set min date to today
const dateInput = document.getElementById('date');
const today = new Date().toISOString().split('T')[0];
dateInput.min = today;

// Disable Saturdays
dateInput.addEventListener('input', async () => {
  const d = new Date(dateInput.value);
  if (d.getDay() === 6) {
    dateInput.value = '';
    showError('שבת אינה יום עבודה. בחרי יום אחר.');
    return;
  }
  clearError();
  await loadTimeSlots(dateInput.value);
});

async function loadTimeSlots(date) {
  const container = document.getElementById('time-slots');
  container.innerHTML = '<p class="slots-hint">טוענת שעות...</p>';

  const { data, error } = await supabase
    .from('bookings')
    .select('time')
    .eq('date', date)
    .neq('status', 'cancelled');

  if (error) {
    container.innerHTML = '<p class="slots-hint">שגיאה בטעינת שעות</p>';
    return;
  }

  const booked = data.map(b => b.time);
  container.innerHTML = '';

  ALL_SLOTS.forEach(slot => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = slot;
    btn.className = 'slot-btn' + (booked.includes(slot) ? ' booked' : '');
    btn.disabled = booked.includes(slot);
    btn.addEventListener('click', () => selectSlot(slot, btn));
    container.appendChild(btn);
  });
}

function selectSlot(slot, btn) {
  document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  document.getElementById('selected-time').value = slot;
}

document.getElementById('book-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  clearError();

  const time = document.getElementById('selected-time').value;
  if (!time) { showError('בחרי שעה'); return; }

  const btn = document.getElementById('submit-btn');
  btn.disabled = true;
  btn.textContent = 'שולחת...';

  const booking = {
    name:    document.getElementById('name').value.trim(),
    phone:   document.getElementById('phone').value.trim(),
    service: document.getElementById('service').value,
    date:    document.getElementById('date').value,
    time,
    notes:   document.getElementById('notes').value.trim(),
    status:  'pending'
  };

  const { error } = await supabase.from('bookings').insert([booking]);

  btn.disabled = false;
  btn.textContent = 'שלחי בקשת תור';

  if (error) {
    showError('שגיאה בשמירת התור. נסי שוב.');
  } else {
    document.getElementById('book-form').style.display = 'none';
    document.getElementById('form-success').style.display = 'block';
  }
});

function showError(msg) {
  const el = document.getElementById('form-error');
  el.textContent = msg;
  el.style.display = 'block';
}
function clearError() {
  const el = document.getElementById('form-error');
  el.textContent = '';
  el.style.display = 'none';
}
