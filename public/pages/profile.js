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

function createMobileNav(router, activeKey = 'profile') {
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

export default async function renderProfilePage(container, router) {
  if (!container) return;

  const page = el('section', 'tracker-page');
  const shell = el('div', 'tracker-shell');
  const desktopSidebar = createDesktopSidebar({
    router,
    activeKey: 'profile',
    userName: 'User',
    onLogout: async () => {
      await api('/api/auth/sign-out', { method: 'POST' });
      router?.navigate('/login');
    }
  });
  
  const flash = el('p', 'auth-status');
  const hero = el('section', 'profile-hero');
  const avatar = el('div', 'profile-avatar', '👤');
  const userName = el('h2', 'profile-name', 'Loading...');
  const userEmail = el('p', 'profile-email', 'Loading...');
  hero.append(avatar, userName, userEmail);

  const overview = el('section', 'tracker-section');
  overview.append(el('h2', 'tracker-section-title', 'Overview'));
  const grid = el('div', 'profile-overview-grid');
  const stat1 = el('article', 'profile-overview-card mint');
  const stat2 = el('article', 'profile-overview-card violet');
  const stat3 = el('article', 'profile-overview-card sand');
  stat1.append(el('p', 'profile-overview-value', '0'), el('p', 'profile-overview-label', 'Active Habits'));
  stat2.append(el('p', 'profile-overview-value', '0'), el('p', 'profile-overview-label', 'Total Entries'));
  stat3.append(el('p', 'profile-overview-value', '0'), el('p', 'profile-overview-label', 'Categories'));
  grid.append(stat1, stat2, stat3);
  overview.append(grid);

  const settings = el('section', 'tracker-section');
  settings.append(el('h2', 'tracker-section-title', 'Settings'));
  const list = el('div', 'profile-settings-list');
  const row1 = el('div', 'profile-settings-item');
  row1.append(el('span', 'profile-settings-title', 'Notifications'), el('span', 'profile-settings-value', 'Enabled'));
  const row2 = el('div', 'profile-settings-item');
  row2.append(el('span', 'profile-settings-title', 'Theme'), el('span', 'profile-settings-value', 'Light'));
  const row3 = el('div', 'profile-settings-item');
  row3.append(el('span', 'profile-settings-title', 'Account'), el('span', 'profile-settings-value', 'Standard'));
  list.append(row1, row2, row3);
  settings.append(list);

  shell.append(createTopMenu(router), flash, hero, overview, settings);
  mountDesktopLayout(page, shell, desktopSidebar);
  page.append(createMobileNav(router, 'profile'));
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
    userName.textContent = currentUser.username;
    userEmail.textContent = currentUser.email;

    const habits = await api(`/api/habits?user_id=${currentUser.id}`);
    stat1.querySelector('.profile-overview-value').textContent = String(habits.length);

    const entriesByHabit = await Promise.all(habits.map(async (habit) => api(`/api/habits/${habit.id}/entries`)));
    const totalEntries = entriesByHabit.reduce((sum, entries) => sum + entries.length, 0);
    stat2.querySelector('.profile-overview-value').textContent = String(totalEntries);

    const categories = await api('/api/categories');
    stat3.querySelector('.profile-overview-value').textContent = String(categories.length);
  } catch (_) {
    router?.navigate('/login');
  }
}
