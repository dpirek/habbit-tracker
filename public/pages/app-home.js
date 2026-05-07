import DesktopSideMenu, { mountDesktopLayout } from '../components/shared/desktop-side-menu.js';
import MobileTopMenu from '../components/shared/mobile-top-menu.js';
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

function getHabitVisual(title = '') {
  const token = String(title).toLowerCase();
  if (token.includes('water')) return { emoji: '🥤', bg: '#dff6ec', bar: '#1fb468' };
  if (token.includes('exercise') || token.includes('workout') || token.includes('run')) return { emoji: '👟', bg: '#fbe9c9', bar: '#1fb468' };
  if (token.includes('read') || token.includes('book')) return { emoji: '📖', bg: '#e8e1ff', bar: '#6a58f0' };
  if (token.includes('meditat') || token.includes('mindful')) return { emoji: '🧘', bg: '#fbe2ec', bar: '#1fb468' };
  return { emoji: '✅', bg: '#e9efff', bar: '#1fb468' };
}

function habitCard(habit, progressValue = 0, onOpenEntries) {
  const card = el('article', 'tracker-habit-card');
  const visual = getHabitVisual(habit.title);
  const target = Math.max(1, Number(habit.target_count || 1));
  const current = Math.max(0, Number(progressValue || 0));
  const ratio = Math.min(current / target, 1);
  const isDone = ratio >= 1;

  const top = el('div', 'tracker-habit-card-top');
  const icon = el('div', 'tracker-habit-icon', visual.emoji);
  icon.style.background = visual.bg;

  const content = el('div', 'tracker-habit-content');
  content.append(
    el('h3', 'tracker-habit-title', habit.title || `Habit #${habit.id}`),
    el('p', 'tracker-habit-subtitle', `${target}${habit.unit ? ` ${habit.unit}` : ''} a day`)
  );

  const status = el('div', 'tracker-habit-status');
  if (isDone) {
    status.classList.add('done');
    status.textContent = '✓';
  } else {
    status.textContent = `${Math.min(current, target)}/${target}`;
  }

  top.append(icon, content, status);

  const bar = el('div', 'tracker-habit-progress');
  const barValue = el('span', 'tracker-habit-progress-value');
  barValue.style.width = `${Math.max(6, Math.round(ratio * 100))}%`;
  barValue.style.background = visual.bar;
  bar.append(barValue);

  card.append(top, bar);
  card.addEventListener('click', () => onOpenEntries(habit));
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
  card.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onOpenEntries(habit);
    }
  });
  return card;
}

function createWeekStrip() {
  const wrap = el('div', 'week-strip');
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const jsDay = new Date().getDay(); // 0=Sun
  const activeIndex = jsDay === 0 ? 6 : jsDay - 1;

  dayNames.forEach((name, index) => {
    const item = el('div', `week-day${index === activeIndex ? ' active' : ''}`);
    const label = el('span', 'week-day-label', name);
    const circle = el('span', `week-day-circle${index < activeIndex ? ' done' : ''}${index === activeIndex ? ' current' : ''}`);

    if (index < activeIndex) {
      circle.textContent = '✓';
    } else if (index === activeIndex) {
      circle.textContent = String(new Date().getDate());
    } else {
      circle.textContent = String(index + 1);
    }

    item.append(label, circle);
    wrap.append(item);
  });

  return wrap;
}

export default async function renderAppHomePage(container, router) {
  if (!container) return;

  const page = el('section', 'tracker-page');
  const shell = el('div', 'tracker-shell');
  const desktopSidebar = new DesktopSideMenu({
    router,
    activeKey: 'today',
    userName: 'User',
    onLogout: async () => {
      await api('/api/auth/sign-out', { method: 'POST' });
      router?.navigate('/login');
    }
  });

  const header = el('header', 'tracker-header');
  const welcomeTitle = el('h1', 'auth-title', 'Welcome');
  header.append(
    welcomeTitle,
    el('p', 'auth-subtitle', 'Progress, not perfection. Keep going.')
  );
  header.append(createWeekStrip());
  const flash = el('p', 'auth-status');

  const grid = el('div', 'tracker-grid');

  const habitsSection = el('section', 'tracker-section-wide');
  const habitsTitleRow = el('div', 'tracker-habits-title-row');
  habitsTitleRow.append(
    el('h2', 'tracker-section-title', "Today's Habits")
  );
  habitsSection.append(habitsTitleRow);

  const habitsList = el('div', 'tracker-card-grid');

  habitsSection.append(habitsList);
  grid.append(habitsSection);
  shell.append(new MobileTopMenu({
    router,
    mode: 'menu',
    activeKey: 'today',
    onAdmin: () => router?.navigate('/admin'),
    onLogout: async () => {
      await api('/api/auth/sign-out', { method: 'POST' });
      router?.navigate('/login');
    }
  }), header, flash, grid);
  mountDesktopLayout(page, shell, desktopSidebar);
  page.append(new MobileBottomNav({ router, activeKey: 'today' }));
  container.replaceChildren(page);

  const state = { currentUser: null, categories: [], habits: [], todayProgress: new Map() };

  const setFlash = (message, error = false) => {
    flash.textContent = message || '';
    flash.dataset.error = message ? String(error) : '';
  };

  const renderHabits = () => {
    habitsList.innerHTML = '';
    state.habits.forEach((habit) => {
      habitsList.append(habitCard(
        habit,
        state.todayProgress.get(habit.id) || 0,
        async (item) => router?.navigate(`/habits/${item.id}/entries`)
      ));
    });
  };

  const loadHabits = async () => {
    if (!state.currentUser) return;
    state.habits = await api(`/api/habits?user_id=${state.currentUser.id}`);
    const today = new Date().toISOString().slice(0, 10);
    const entriesByHabit = await Promise.all(
      state.habits.map(async (habit) => {
        const entries = await api(`/api/habits/${habit.id}/entries`);
        const total = entries
          .filter((entry) => String(entry.entry_date || '').slice(0, 10) === today)
          .reduce((sum, entry) => sum + Number(entry.value || 0), 0);
        return [habit.id, total];
      })
    );
    state.todayProgress = new Map(entriesByHabit);
    renderHabits();
  };

  try {
    const session = await api('/api/auth/user');
    const users = await api('/api/users');
    state.currentUser = users.find((u) => u.username === session.username) || null;
    if (!state.currentUser) return setFlash('User record not found for session', true);
    const desktopUser = desktopSidebar.querySelector('[data-desktop-username="true"]');
    const desktopAvatar = desktopSidebar.querySelector('.desktop-side-avatar');
    if (desktopUser) desktopUser.textContent = state.currentUser.username;
    if (desktopAvatar) desktopAvatar.textContent = String(state.currentUser.username || 'U').slice(0, 1).toUpperCase();
    welcomeTitle.textContent = `Good morning, ${state.currentUser.username}!`;
    await loadHabits();
  } catch (_) {
    router?.navigate('/login');
  }
}
