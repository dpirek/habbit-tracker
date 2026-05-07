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
  const item = (key, label, onClick) => {
    const btn = el('button', `mobile-nav-item${activeKey === key ? ' active' : ''}`);
    btn.type = 'button';
    btn.innerHTML = `<span>${label}</span>`;
    btn.addEventListener('click', onClick);
    return btn;
  };
  const center = el('button', 'mobile-nav-center', '+');
  center.type = 'button';
  center.addEventListener('click', () => router?.navigate('/habits'));
  nav.append(
    item('today', 'Today', () => router?.navigate('/home')),
    item('habits', 'Habits', () => router?.navigate('/habits')),
    center,
    item('stats', 'Stats', () => router?.navigate('/progress')),
    item('profile', 'Profile', () => router?.navigate('/profile'))
  );
  return nav;
}

function createTopMenu(router) {
  const bar = el('div', 'mobile-top-menu');
  const left = el('button', 'mobile-top-menu-btn');
  left.type = 'button';
  left.setAttribute('aria-label', 'Back to Habits');
  left.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>';
  left.addEventListener('click', () => router?.navigate('/habits'));
  const right = el('button', 'mobile-top-menu-btn');
  right.type = 'button';
  right.setAttribute('aria-label', 'Notifications');
  right.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M15 17H5.5a1.5 1.5 0 0 1-1.2-2.4L5 13.7V10a7 7 0 1 1 14 0v3.7l.7.9a1.5 1.5 0 0 1-1.2 2.4H17"/><path d="M9.5 19a2.5 2.5 0 0 0 5 0"/></svg>';
  bar.append(left, right);
  return bar;
}

export default async function renderTemplateDetailPage(container, router, params = {}) {
  if (!container) return;
  const templateId = Number(params.id);
  if (!Number.isInteger(templateId) || templateId <= 0) {
    router?.navigate('/habits');
    return;
  }

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
  header.append(el('h1', 'auth-title', 'Template Detail'), el('p', 'auth-subtitle', 'Review and confirm this habit template.'));
  const flash = el('p', 'auth-status');
  const card = el('section', 'tracker-section');
  const title = el('h2', 'tracker-section-title', 'Loading...');
  const desc = el('p', 'tracker-card-text', '');
  const meta = el('p', 'tracker-card-meta', '');
  const confirm = el('button', 'auth-button', 'Use Template');
  confirm.type = 'button';
  card.append(title, desc, meta, confirm);

  shell.append(createTopMenu(router), header, flash, card);
  mountDesktopLayout(page, shell, desktopSidebar);
  page.append(createMobileNav(router, 'habits'));
  container.replaceChildren(page);

  let currentUser = null;
  let currentTemplate = null;
  const setFlash = (message, error = false) => {
    flash.textContent = message || '';
    flash.dataset.error = message ? String(error) : '';
  };

  confirm.addEventListener('click', async () => {
    if (!currentUser || !currentTemplate) return;
    const approved = window.confirm(`Create habit from "${currentTemplate.title}" template?`);
    if (!approved) return;
    try {
      await api('/api/habits', {
        method: 'POST',
        body: JSON.stringify({
          user_id: currentUser.id,
          title: currentTemplate.title,
          description: currentTemplate.description || null,
          frequency: currentTemplate.frequency,
          target_count: Number(currentTemplate.target_count || 1),
          unit: currentTemplate.unit || null
        }),
      });
      router?.navigate('/habits');
    } catch (error) {
      setFlash(error.message || 'Failed to create habit', true);
    }
  });

  try {
    const session = await api('/api/auth/user');
    const users = await api('/api/users');
    currentUser = users.find((u) => u.username === session.username) || null;
    if (!currentUser) throw new Error('User not found');

    const desktopUser = desktopSidebar.querySelector('[data-desktop-username="true"]');
    const desktopAvatar = desktopSidebar.querySelector('.desktop-side-avatar');
    if (desktopUser) desktopUser.textContent = currentUser.username;
    if (desktopAvatar) desktopAvatar.textContent = String(currentUser.username || 'U').slice(0, 1).toUpperCase();

    const templates = await api('/api/habit-templates');
    currentTemplate = templates.find((t) => Number(t.id) === templateId) || null;
    if (!currentTemplate) {
      setFlash('Template not found', true);
      confirm.disabled = true;
      return;
    }

    title.textContent = currentTemplate.title;
    desc.textContent = currentTemplate.description || 'No description';
    meta.textContent = `${currentTemplate.frequency} • ${currentTemplate.target_count}${currentTemplate.unit ? ` ${currentTemplate.unit}` : ''}`;
  } catch (_) {
    router?.navigate('/login');
  }
}
