import { createDesktopSidebar, mountDesktopLayout } from './desktop-sidebar.js';
import MobileBottomNav from '../components/shared/mobile-bottom-nav.js';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.error || `Request failed (${response.status})`);
  return payload?.data;
}

 function createTopMenu(router) {
  const bar = el('div', 'mobile-top-menu');
  const left = el('button', 'mobile-top-menu-btn');
  left.type = 'button';
  left.setAttribute('aria-label', 'Back to Home');
  left.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>';
  left.addEventListener('click', () => router?.navigate('/home'));

  const right = el('button', 'mobile-top-menu-btn');
  right.type = 'button';
  right.setAttribute('aria-label', 'More');
  right.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="6" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="18" cy="12" r="1.8"/></svg>';

  bar.append(left, right);
  return bar;
}

function dateKeyLocal(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default async function renderCalendarPage(container, router) {
  if (!container) return;

  const page = el('section', 'tracker-page');
  const shell = el('div', 'tracker-shell');
  const desktopSidebar = createDesktopSidebar({
    router,
    activeKey: 'calendar',
    userName: 'User',
    onLogout: async () => {
      await api('/api/auth/sign-out', { method: 'POST' });
      router?.navigate('/login');
    }
  });
  const header = el('header', 'tracker-header');
  header.append(el('h1', 'auth-title', 'Calendar'), el('p', 'auth-subtitle', 'Track your daily completions.'));

  const card = el('section', 'tracker-section calendar-card');
  const top = el('div', 'calendar-top-row');
  const monthTitle = el('h2', 'calendar-month-title', '');
  const controls = el('div', 'calendar-controls');
  const prevBtn = el('button', 'calendar-arrow', '‹');
  const nextBtn = el('button', 'calendar-arrow', '›');
  prevBtn.type = 'button';
  nextBtn.type = 'button';
  controls.append(prevBtn, nextBtn);
  top.append(monthTitle, controls);

  const daysHeader = el('div', 'calendar-days-header');
  ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].forEach((d) => daysHeader.append(el('span', 'calendar-day-label', d)));
  const grid = el('div', 'calendar-grid');

  card.append(top, daysHeader, grid);
  shell.append(createTopMenu(router), header, card);
  mountDesktopLayout(page, shell, desktopSidebar);
  page.append(new MobileBottomNav({ router, activeKey: 'today' }));
  container.replaceChildren(page);

  const state = {
    monthAnchor: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    completedDateKeys: new Set(),
  };

  function renderMonth() {
    const year = state.monthAnchor.getFullYear();
    const month = state.monthAnchor.getMonth();
    const today = new Date();
    monthTitle.textContent = state.monthAnchor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

    grid.innerHTML = '';
    const firstDay = new Date(year, month, 1);
    const start = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < start; i += 1) {
      grid.append(el('span', 'calendar-cell empty'));
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const current = new Date(year, month, day);
      const key = dateKeyLocal(current);
      const cell = el('span', 'calendar-cell', String(day));
      const done = state.completedDateKeys.has(key);
      const isToday = current.getFullYear() === today.getFullYear()
        && current.getMonth() === today.getMonth()
        && current.getDate() === today.getDate();

      if (done) {
        cell.classList.add('done');
        cell.textContent = '✓';
      }
      if (isToday) {
        cell.classList.add('today');
        if (!done) cell.textContent = String(day);
      }
      grid.append(cell);
    }
  }

  prevBtn.addEventListener('click', () => {
    state.monthAnchor = new Date(state.monthAnchor.getFullYear(), state.monthAnchor.getMonth() - 1, 1);
    renderMonth();
  });
  nextBtn.addEventListener('click', () => {
    state.monthAnchor = new Date(state.monthAnchor.getFullYear(), state.monthAnchor.getMonth() + 1, 1);
    renderMonth();
  });

  try {
    const session = await api('/api/auth/user');
    const users = await api('/api/users');
    const currentUser = users.find((u) => u.username === session.username);
    if (!currentUser) throw new Error('User not found');
    const desktopUser = desktopSidebar.querySelector('[data-desktop-username="true"]');
    const desktopAvatar = desktopSidebar.querySelector('.desktop-side-avatar');
    if (desktopUser) desktopUser.textContent = currentUser.username;
    if (desktopAvatar) desktopAvatar.textContent = String(currentUser.username || 'U').slice(0, 1).toUpperCase();

    const habits = await api(`/api/habits?user_id=${currentUser.id}`);
    const entriesByHabit = await Promise.all(habits.map(async (habit) => api(`/api/habits/${habit.id}/entries`)));
    const completed = new Set();
    entriesByHabit.forEach((entries) => {
      entries.forEach((entry) => {
        const key = String(entry.entry_date || '').slice(0, 10);
        if (key) completed.add(key);
      });
    });
    state.completedDateKeys = completed;
    renderMonth();
  } catch (_) {
    router?.navigate('/login');
  }
}
