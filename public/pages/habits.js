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

function createMobileNav(router, activeKey = 'habits') {
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

function templateIconSvg(iconKey = '') {
  const key = String(iconKey || '').toLowerCase();
  const common = 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
  if (key.includes('water')) {
    return `<svg viewBox="0 0 24 24" ${common}><path d="M7 4h10l-1 15a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2L7 4z"/><path d="M8 4h8"/><path d="M12 10c1.8 1.7 2.5 2.8 2.5 4a2.5 2.5 0 0 1-5 0c0-1.2.7-2.3 2.5-4z"/></svg>`;
  }
  if (key.includes('exercise') || key.includes('workout')) {
    return `<svg viewBox="0 0 24 24" ${common}><path d="M4 10h2v4H4zM18 10h2v4h-2z"/><path d="M6 9h2v6H6zM16 9h2v6h-2z"/><path d="M8 11h8v2H8z"/></svg>`;
  }
  if (key.includes('book') || key.includes('read')) {
    return `<svg viewBox="0 0 24 24" ${common}><path d="M3 6a2 2 0 0 1 2-2h6v16H5a2 2 0 0 0-2 2V6z"/><path d="M21 6a2 2 0 0 0-2-2h-6v16h6a2 2 0 0 1 2 2V6z"/></svg>`;
  }
  if (key.includes('meditation') || key.includes('mindful')) {
    return `<svg viewBox="0 0 24 24" ${common}><circle cx="12" cy="5" r="2"/><path d="M9 11l3-3 3 3"/><path d="M7 20l2.5-5h5L17 20"/><path d="M5 14h4m6 0h4"/></svg>`;
  }
  if (key.includes('sleep')) {
    return `<svg viewBox="0 0 24 24" ${common}><path d="M4 14h16v5H4z"/><path d="M6 14V9h12v5"/><path d="M7 6h2M11 6h2M15 6h2"/></svg>`;
  }
  if (key.includes('nutrition') || key.includes('apple')) {
    return `<svg viewBox="0 0 24 24" ${common}><path d="M12 7c3.5 0 6 2.7 6 6.3C18 17.5 15.5 20 12 20s-6-2.5-6-6.7C6 9.7 8.5 7 12 7z"/><path d="M12 7c0-2 1.2-3.4 3.2-3.8"/><path d="M12 7c0-1.7-1.2-2.7-2.7-3"/></svg>`;
  }
  return `<svg viewBox="0 0 24 24" ${common}><path d="M12 3v18M3 12h18"/></svg>`;
}

export default async function renderHabitsPage(container, router) {
  if (!container) return;

  const page = el('section', 'tracker-page');
  const shell = el('div', 'tracker-shell');
  const desktopSidebar = createDesktopSidebar({
    router,
    activeKey: 'habits',
    userName: 'User',
    onLogout: async () => {
      await api('/api/auth/sign-out', { method: 'POST' });
      router?.navigate('/login');
    }
  });

  const header = el('header', 'tracker-header');
  header.append(
    el('h1', 'auth-title', 'Add New Habit'),
    el('p', 'auth-subtitle', 'Pick from templates or create your own.')
  );

  const flash = el('p', 'auth-status');
  const setFlash = (message, error = false) => {
    flash.textContent = message || '';
    flash.dataset.error = message ? String(error) : '';
  };

  const templateSection = el('section');
  templateSection.append(el('h2', 'tracker-section-title', 'Habit Templates'));
  const customNavBtn = el('button', 'auth-button habits-custom-button', 'Create Custom Habit');
  customNavBtn.type = 'button';
  customNavBtn.addEventListener('click', () => router?.navigate('/habits/custom'));
  const templatesGrid = el('div', 'template-grid');
  templateSection.append(templatesGrid, customNavBtn);

  shell.append(createTopMenu(router), header, flash, templateSection);
  mountDesktopLayout(page, shell, desktopSidebar);
  page.append(createMobileNav(router, 'habits'));
  container.replaceChildren(page);

  let currentUser = null;
  try {
    const session = await api('/api/auth/user');
    const users = await api('/api/users');
    currentUser = users.find((u) => u.username === session.username) || null;
    if (!currentUser) throw new Error('User record not found');
    const desktopUser = desktopSidebar.querySelector('[data-desktop-username="true"]');
    const desktopAvatar = desktopSidebar.querySelector('.desktop-side-avatar');
    if (desktopUser) desktopUser.textContent = currentUser.username;
    if (desktopAvatar) desktopAvatar.textContent = String(currentUser.username || 'U').slice(0, 1).toUpperCase();

    const templates = await api('/api/habit-templates');
    templatesGrid.innerHTML = '';
    templates.forEach((template) => {
      const card = el('article', 'template-card');
      const head = el('div', 'template-card-head');
      const icon = el('div', 'template-icon');
      icon.innerHTML = templateIconSvg(template.icon || template.title || '');
      const title = el('h3', 'tracker-card-title', template.title);
      head.append(icon, title);
      card.append(head, el('p', 'tracker-card-text', template.description || 'No description'), el('p', 'tracker-card-meta', `${template.frequency} • ${template.target_count}${template.unit ? ` ${template.unit}` : ''}`));

      const addButton = el('button', 'auth-button', 'Use Template');
      addButton.type = 'button';
      addButton.addEventListener('click', () => router?.navigate(`/habits/templates/${template.id}`));
      card.append(addButton);
      templatesGrid.append(card);
    });
  } catch (_) {
    router?.navigate('/login');
  }
}
