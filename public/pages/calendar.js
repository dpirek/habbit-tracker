import DesktopSideMenu, { mountDesktopLayout } from '../components/shared/desktop-side-menu.js';
import MobileTopMenu from '../components/shared/mobile-top-menu.js';
import MobileBottomNav from '../components/shared/mobile-bottom-nav.js';
import CalendarWidget from '../components/shared/calendar-widget.js';

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

export default async function renderCalendarPage(container, router) {
  if (!container) return;

  const page = el('section', 'tracker-page');
  const shell = el('div', 'tracker-shell');
  const desktopSidebar = new DesktopSideMenu({
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
  const calendarWidget = new CalendarWidget({
    variant: 'default',
    mode: 'done',
    showControls: true,
    monthAnchor: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    markedDateKeys: new Set()
  });

  card.append(calendarWidget);
  shell.append(new MobileTopMenu({ router, mode: 'back', backPath: '/home' }), header, card);
  mountDesktopLayout(page, shell, desktopSidebar);
  page.append(new MobileBottomNav({ router, activeKey: 'today' }));
  container.replaceChildren(page);


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
    calendarWidget.setMarkedDateKeys(completed);
  } catch (_) {
    router?.navigate('/login');
  }
}
