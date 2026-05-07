import { createDesktopSidebar, mountDesktopLayout } from './desktop-sidebar.js';

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

function createMobileNav(router, activeKey = 'stats') {
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
  center.addEventListener('click', () => router?.navigate('/habits'));

  nav.append(
    item('today', 'Today', 'home', () => router?.navigate('/home')),
    item('habits', 'Habits', 'habits', () => router?.navigate('/habits')),
    center,
    item('stats', 'Stats', 'stats', () => router?.navigate('/progress')),
    item('profile', 'Profile', 'profile', () => router?.navigate('/profile'))
  );

  return nav;
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
  right.setAttribute('aria-label', 'Notifications');
  right.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M15 17H5.5a1.5 1.5 0 0 1-1.2-2.4L5 13.7V10a7 7 0 1 1 14 0v3.7l.7.9a1.5 1.5 0 0 1-1.2 2.4H17"/><path d="M9.5 19a2.5 2.5 0 0 0 5 0"/></svg>';

  bar.append(left, right);
  return bar;
}

function dateKeyLocal(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function computeStreak(dayTotals, target) {
  let streak = 0;
  let cursor = new Date();
  while (true) {
    const key = dateKeyLocal(cursor);
    if ((dayTotals.get(key) || 0) >= target) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

function lineChartSvg(values) {
  const width = 420;
  const height = 180;
  const pad = 18;
  const step = (width - pad * 2) / Math.max(values.length - 1, 1);
  const toY = (value) => pad + (1 - value / 100) * (height - pad * 2);
  const points = values.map((value, i) => `${pad + i * step},${toY(value)}`).join(' ');
  return `
  <svg viewBox="0 0 ${width} ${height}" class="progress-line-chart" aria-hidden="true">
    <polyline points="${points}" fill="none" stroke="#6a58f0" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></polyline>
    ${values.map((value, i) => `<circle cx="${pad + i * step}" cy="${toY(value)}" r="4" fill="#6a58f0"></circle>`).join('')}
  </svg>`;
}

export default async function renderProgressPage(container, router) {
  if (!container) return;

  const page = el('section', 'tracker-page');
  const shell = el('div', 'tracker-shell');
  const desktopSidebar = createDesktopSidebar({
    router,
    activeKey: 'stats',
    userName: 'User',
    onLogout: async () => {
      await api('/api/auth/sign-out', { method: 'POST' });
      router?.navigate('/login');
    }
  });

  const header = el('header', 'tracker-header');
  header.append(
    el('h1', 'auth-title', 'Your Progress'),
    el('p', 'auth-subtitle', 'Weekly completion and habit trends.')
  );

  const tabs = el('div', 'progress-tabs');
  tabs.append(el('button', 'progress-tab active', 'Week'), el('button', 'progress-tab', 'Month'), el('button', 'progress-tab', 'Year'));

  const overview = el('section', 'tracker-section');
  overview.append(el('h2', 'tracker-section-title', 'Overview'));
  const cards = el('div', 'progress-overview-grid');
  const c1 = el('article', 'progress-overview-card mint');
  const c2 = el('article', 'progress-overview-card violet');
  const c3 = el('article', 'progress-overview-card sand');
  c1.append(el('p', 'progress-overview-value', '0'), el('p', 'progress-overview-label', 'Completed Habits'));
  c2.append(el('p', 'progress-overview-value', '0%'), el('p', 'progress-overview-label', 'Average Completion'));
  c3.append(el('p', 'progress-overview-value', '0'), el('p', 'progress-overview-label', 'Current Streak'));
  cards.append(c1, c2, c3);
  overview.append(cards);

  const chartSection = el('section', 'tracker-section');
  const chartTitleRow = el('div', 'tracker-habits-title-row');
  chartTitleRow.append(el('h2', 'tracker-section-title', 'Completion Rate'), el('span', 'progress-completion-value', '0%'));
  const chartWrap = el('div', 'progress-chart-wrap');
  const chartDays = el('div', 'progress-chart-days');
  ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].forEach((d) => chartDays.append(el('span', 'progress-chart-day', d)));
  chartSection.append(chartTitleRow, chartWrap, chartDays);

  const breakdown = el('section', 'tracker-section');
  const breakdownRow = el('div', 'tracker-habits-title-row');
  breakdownRow.append(el('h2', 'tracker-section-title', 'Habit Breakdown'));
  breakdown.append(breakdownRow);
  const breakdownList = el('div', 'progress-breakdown-list');
  breakdown.append(breakdownList);

  shell.append(createTopMenu(router), header, tabs, overview, chartSection, breakdown);
  mountDesktopLayout(page, shell, desktopSidebar);
  page.append(createMobileNav(router, 'stats'));
  container.replaceChildren(page);

  try {
    const session = await api('/api/auth/user');
    const users = await api('/api/users');
    const currentUser = users.find((u) => u.username === session.username) || null;
    if (!currentUser) throw new Error('User record not found');
    const desktopUser = desktopSidebar.querySelector('[data-desktop-username="true"]');
    const desktopAvatar = desktopSidebar.querySelector('.desktop-side-avatar');
    if (desktopUser) desktopUser.textContent = currentUser.username;
    if (desktopAvatar) desktopAvatar.textContent = String(currentUser.username || 'U').slice(0, 1).toUpperCase();

    const habits = await api(`/api/habits?user_id=${currentUser.id}`);
    const habitWithEntries = await Promise.all(
      habits.map(async (habit) => ({ habit, entries: await api(`/api/habits/${habit.id}/entries`) }))
    );

    const todayKey = dateKeyLocal(new Date());
    const todayRatios = habitWithEntries.map(({ habit, entries }) => {
      const todayTotal = entries
        .filter((entry) => String(entry.entry_date || '').slice(0, 10) === todayKey)
        .reduce((sum, entry) => sum + Number(entry.value || 0), 0);
      return {
        habit,
        ratio: Math.min(todayTotal / Math.max(1, Number(habit.target_count || 1)), 1),
        value: todayTotal
      };
    });

    const completedHabits = todayRatios.filter((r) => r.ratio >= 1).length;
    const avgCompletion = todayRatios.length
      ? Math.round((todayRatios.reduce((sum, r) => sum + r.ratio, 0) / todayRatios.length) * 100)
      : 0;

    const streaks = habitWithEntries.map(({ habit, entries }) => {
      const totals = new Map();
      entries.forEach((entry) => {
        const key = String(entry.entry_date || '').slice(0, 10);
        totals.set(key, (totals.get(key) || 0) + Number(entry.value || 0));
      });
      return computeStreak(totals, Math.max(1, Number(habit.target_count || 1)));
    });
    const currentStreak = streaks.length ? Math.max(...streaks) : 0;

    c1.querySelector('.progress-overview-value').textContent = String(completedHabits);
    c2.querySelector('.progress-overview-value').textContent = `${avgCompletion}%`;
    c3.querySelector('.progress-overview-value').textContent = String(currentStreak);

    const weekDates = Array.from({ length: 7 }, (_, index) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - index));
      return dateKeyLocal(d);
    });

    const weekValues = weekDates.map((key) => {
      if (!habitWithEntries.length) return 0;
      const perHabitRatios = habitWithEntries.map(({ habit, entries }) => {
        const total = entries
          .filter((entry) => String(entry.entry_date || '').slice(0, 10) === key)
          .reduce((sum, entry) => sum + Number(entry.value || 0), 0);
        return Math.min(total / Math.max(1, Number(habit.target_count || 1)), 1);
      });
      return Math.round((perHabitRatios.reduce((sum, v) => sum + v, 0) / perHabitRatios.length) * 100);
    });

    chartWrap.innerHTML = lineChartSvg(weekValues);
    chartTitleRow.querySelector('.progress-completion-value').textContent = `${weekValues[weekValues.length - 1] || 0}%`;

    breakdownList.innerHTML = '';
    todayRatios
      .sort((a, b) => b.ratio - a.ratio)
      .forEach(({ habit, ratio }) => {
        const row = el('article', 'progress-breakdown-item');
        const top = el('div', 'progress-breakdown-top');
        top.append(el('span', 'progress-breakdown-title', habit.title), el('span', 'progress-breakdown-percent', `${Math.round(ratio * 100)}%`));
        const bar = el('div', 'progress-breakdown-bar');
        const fill = el('span', 'progress-breakdown-fill');
        fill.style.width = `${Math.max(6, Math.round(ratio * 100))}%`;
        bar.append(fill);
        row.append(top, bar);
        breakdownList.append(row);
      });
  } catch (_) {
    router?.navigate('/login');
  }
}
