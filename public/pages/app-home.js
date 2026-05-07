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

function createMobileNav(router, activeKey = 'today') {
  const nav = el('nav', 'mobile-bottom-nav');
  nav.setAttribute('aria-label', 'Mobile navigation');

  const iconMarkup = (name) => {
    const paths = {
      home: '<path d="M3 10.5L12 3l9 7.5"/><path d="M5.5 9.5V20h13V9.5"/>',
      habits: '<rect x="4" y="4.5" width="16" height="15.5" rx="3"/><path d="M8 2.5v4M16 2.5v4M7.5 10.5h9"/>',
      stats: '<path d="M5 19V9"/><path d="M10 19V5"/><path d="M15 19v-7"/><path d="M20 19V12"/>',
      profile: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c1.8-3.4 4-5 7-5s5.2 1.6 7 5"/>'
    };
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || ''}</svg>`;
  };

  const item = (key, label, iconName, onClick) => {
    const btn = el('button', `mobile-nav-item${activeKey === key ? ' active' : ''}`);
    btn.type = 'button';
    btn.innerHTML = `<span class="mobile-nav-icon">${iconMarkup(iconName)}</span><span>${label}</span>`;
    btn.addEventListener('click', onClick);
    return btn;
  };

  const center = el('button', 'mobile-nav-center');
  center.type = 'button';
  center.textContent = '+';
  center.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  nav.append(
    item('today', 'Today', 'home', () => router?.navigate('/home')),
    item('habits', 'Habits', 'habits', () => router?.navigate('/habits')),
    center,
    item('stats', 'Stats', 'stats', () => router?.navigate('/progress')),
    item('profile', 'Profile', 'profile', () => router?.navigate('/profile'))
  );

  return nav;
}

function createTopMenu({ onAdmin, onLogout }) {
  const bar = el('div', 'mobile-top-menu');
  const menu = el('details', 'mobile-top-menu-dropdown');
  const trigger = el('summary', 'mobile-top-menu-btn');
  trigger.setAttribute('aria-label', 'Open menu');
  trigger.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/></svg>';
  const panel = el('div', 'mobile-top-menu-panel');
  const adminAction = el('button', 'mobile-top-menu-item', 'Admin');
  adminAction.type = 'button';
  adminAction.addEventListener('click', () => {
    menu.removeAttribute('open');
    onAdmin?.();
  });
  const logoutAction = el('button', 'mobile-top-menu-item', 'Logout');
  logoutAction.type = 'button';
  logoutAction.addEventListener('click', () => {
    menu.removeAttribute('open');
    onLogout?.();
  });
  panel.append(adminAction, logoutAction);
  menu.append(trigger, panel);

  const right = el('button', 'mobile-top-menu-btn');
  right.type = 'button';
  right.setAttribute('aria-label', 'Notifications');
  right.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M15 17H5.5a1.5 1.5 0 0 1-1.2-2.4L5 13.7V10a7 7 0 1 1 14 0v3.7l.7.9a1.5 1.5 0 0 1-1.2 2.4H17"/><path d="M9.5 19a2.5 2.5 0 0 0 5 0"/></svg>';

  bar.append(menu, right);
  return bar;
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
  shell.append(createTopMenu({
    onAdmin: () => router?.navigate('/admin'),
    onLogout: async () => {
      await api('/api/auth/sign-out', { method: 'POST' });
      router?.navigate('/login');
    }
  }), header, flash, grid);
  page.append(shell, createMobileNav(router, 'today'));
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
    welcomeTitle.textContent = `Good morning, ${state.currentUser.username}!`;
    await loadHabits();
  } catch (_) {
    router?.navigate('/login');
  }
}
