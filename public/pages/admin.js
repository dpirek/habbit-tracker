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

  let payload = null;
  try {
    payload = await response.json();
  } catch (_) {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(payload?.error || `Request failed (${response.status})`);
  }

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
  center.addEventListener('click', () => router?.navigate('/home'));

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

export default async function renderAdminPage(container, router) {
  if (!container) return;

  const page = el('section', 'tracker-page');
  const shell = el('div', 'tracker-shell');
  const desktopSidebar = createDesktopSidebar({
    router,
    activeKey: 'settings',
    userName: 'User',
    onLogout: async () => {
      await api('/api/auth/sign-out', { method: 'POST' });
      router?.navigate('/login');
    }
  });

  const header = el('header', 'tracker-header');
  header.append(
    el('h1', 'auth-title', 'Admin'),
    el('p', 'auth-subtitle', 'Manage catalog and administrative data.')
  );

  const flash = el('p', 'auth-status');

  const tabs = el('div', 'admin-tabs');
  const tabUsers = el('button', 'admin-tab active', 'Users');
  const tabCategories = el('button', 'admin-tab', 'Categories');
  tabUsers.type = 'button';
  tabCategories.type = 'button';
  tabs.append(tabUsers, tabCategories);

  const usersPanel = el('section', 'tracker-section');
  usersPanel.append(el('h2', 'tracker-section-title', 'Users'));
  const usersList = el('div', 'tracker-list');
  usersPanel.append(usersList);

  const categoriesPanel = el('section', 'tracker-section');
  categoriesPanel.hidden = true;
  categoriesPanel.append(el('h2', 'tracker-section-title', 'Habit Categories'));
  const catForm = el('form', 'auth-form');
  const catName = el('input', 'auth-input');
  catName.placeholder = 'Category name';
  catName.required = true;
  const catColor = el('input', 'auth-input');
  catColor.placeholder = 'Color (e.g. #FFD166)';
  const catSubmit = el('button', 'auth-button', 'Create Category');
  catSubmit.type = 'submit';
  catForm.append(catName, catColor, catSubmit);
  const categoriesList = el('div', 'tracker-list');
  categoriesPanel.append(catForm, categoriesList);

  const showTab = (tab) => {
    const usersActive = tab === 'users';
    tabUsers.classList.toggle('active', usersActive);
    tabCategories.classList.toggle('active', !usersActive);
    usersPanel.hidden = !usersActive;
    categoriesPanel.hidden = usersActive;
  };

  tabUsers.addEventListener('click', () => showTab('users'));
  tabCategories.addEventListener('click', () => showTab('categories'));

  const renderUsers = async () => {
    const users = await api('/api/users');
    usersList.innerHTML = '';
    users.forEach((u) => usersList.append(el('p', 'tracker-list-item', `#${u.id} ${u.username} (${u.email})`)));
  };

  const renderCategories = async () => {
    const categories = await api('/api/categories');
    categoriesList.innerHTML = '';
    categories.forEach((c) => categoriesList.append(el('p', 'tracker-list-item', `#${c.id} ${c.name}${c.color ? ` • ${c.color}` : ''}`)));
  };

  catForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      await api('/api/categories', {
        method: 'POST',
        body: JSON.stringify({ name: catName.value.trim(), color: catColor.value.trim() || null }),
      });
      catName.value = '';
      catColor.value = '';
      flash.textContent = 'Category created';
      flash.dataset.error = 'false';
      await renderCategories();
    } catch (error) {
      flash.textContent = error.message || 'Failed to create category';
      flash.dataset.error = 'true';
    }
  });

  shell.append(createTopMenu(router), header, flash, tabs, usersPanel, categoriesPanel);
  mountDesktopLayout(page, shell, desktopSidebar);
  page.append(createMobileNav(router, 'stats'));
  container.replaceChildren(page);

  try {
    const authUser = await api('/api/auth/user');
    const desktopUser = desktopSidebar.querySelector('[data-desktop-username="true"]');
    const desktopAvatar = desktopSidebar.querySelector('.desktop-side-avatar');
    if (desktopUser) desktopUser.textContent = authUser?.username || 'User';
    if (desktopAvatar) desktopAvatar.textContent = String(authUser?.username || 'U').slice(0, 1).toUpperCase();
    await renderUsers();
    await renderCategories();
  } catch (_) {
    router?.navigate('/login');
  }
}
