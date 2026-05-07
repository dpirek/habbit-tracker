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

function dateKeyLocal(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function templateIconSvg(iconKey = '') {
  const key = String(iconKey || '').toLowerCase();
  const common = 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
  if (key.includes('water')) return `<svg viewBox="0 0 24 24" ${common}><path d="M7 4h10l-1 15a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2L7 4z"/><path d="M12 10c1.8 1.7 2.5 2.8 2.5 4a2.5 2.5 0 0 1-5 0c0-1.2.7-2.3 2.5-4z"/></svg>`;
  if (key.includes('exercise') || key.includes('workout')) return `<svg viewBox="0 0 24 24" ${common}><path d="M4 10h2v4H4zM18 10h2v4h-2z"/><path d="M6 9h2v6H6zM16 9h2v6h-2z"/><path d="M8 11h8v2H8z"/></svg>`;
  if (key.includes('book') || key.includes('read')) return `<svg viewBox="0 0 24 24" ${common}><path d="M3 6a2 2 0 0 1 2-2h6v16H5a2 2 0 0 0-2 2V6z"/><path d="M21 6a2 2 0 0 0-2-2h-6v16h6a2 2 0 0 1 2 2V6z"/></svg>`;
  if (key.includes('meditation') || key.includes('mindful')) return `<svg viewBox="0 0 24 24" ${common}><circle cx="12" cy="5" r="2"/><path d="M9 11l3-3 3 3"/><path d="M7 20l2.5-5h5L17 20"/></svg>`;
  return `<svg viewBox="0 0 24 24" ${common}><path d="M12 3v18M3 12h18"/></svg>`;
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

  const hero = el('section', 'template-detail-hero');
  const iconWrap = el('div', 'template-detail-icon');
  const title = el('h2', 'template-detail-title', 'Loading...');
  const meta = el('p', 'template-detail-meta', '');
  hero.append(iconWrap, title, meta);

  const progressCard = el('section', 'tracker-section template-detail-card');
  progressCard.append(el('h3', 'template-detail-card-title', "Today's Progress"));
  const progressPills = el('div', 'template-detail-pills');
  progressCard.append(progressPills);

  const calendarCard = el('section', 'tracker-section template-detail-card');
  const calendarHead = el('div', 'tracker-habits-title-row');
  calendarHead.append(el('h3', 'template-detail-card-title', 'Calendar'), el('span', 'template-detail-link', 'View all'));
  const calendarMeta = el('p', 'tracker-card-meta', '');
  const calendarMonth = el('p', 'template-detail-calendar-month', '');
  const calendarDaysHead = el('div', 'template-detail-calendar-days');
  ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].forEach((d) => calendarDaysHead.append(el('span', 'template-detail-calendar-day-label', d)));
  const calendarGrid = el('div', 'template-detail-calendar-grid');
  calendarCard.append(calendarHead, calendarMeta, calendarMonth, calendarDaysHead, calendarGrid);

  const actionCard = el('section', 'template-detail-action');
  const desc = el('p', 'tracker-card-text', '');
  const confirm = el('button', 'auth-button template-detail-cta', 'Use Template');
  confirm.type = 'button';
  actionCard.append(desc, confirm);

  shell.append(createTopMenu(router), header, flash, hero, progressCard, calendarCard, actionCard);
  mountDesktopLayout(page, shell, desktopSidebar);
  page.append(new MobileBottomNav({ router, activeKey: 'habits' }));
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
    meta.textContent = `${currentTemplate.target_count}${currentTemplate.unit ? ` ${currentTemplate.unit}` : ''} a day`;
    calendarMeta.textContent = `${currentTemplate.frequency} schedule`;
    progressCard.hidden = Number(currentTemplate.id) === 6;
    const monthAnchor = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    calendarMonth.textContent = monthAnchor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

    const start = (monthAnchor.getDay() + 6) % 7;
    const daysInMonth = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth() + 1, 0).getDate();
    const today = new Date();
    const highlighted = new Set();
    for (let day = 1; day <= daysInMonth; day += 1) {
      const d = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth(), day);
      if (currentTemplate.frequency === 'daily') {
        highlighted.add(dateKeyLocal(d));
      } else if (currentTemplate.frequency === 'weekly') {
        if (d.getDay() === today.getDay()) highlighted.add(dateKeyLocal(d));
      } else if (currentTemplate.frequency === 'monthly') {
        if (day === today.getDate()) highlighted.add(dateKeyLocal(d));
      }
    }

    calendarGrid.innerHTML = '';
    for (let i = 0; i < start; i += 1) {
      calendarGrid.append(el('span', 'template-detail-calendar-cell empty', ''));
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      const d = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth(), day);
      const key = dateKeyLocal(d);
      const cell = el('span', `template-detail-calendar-cell${highlighted.has(key) ? ' active' : ''}`, String(day));
      if (d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()) {
        cell.classList.add('today');
      }
      calendarGrid.append(cell);
    }

    iconWrap.innerHTML = templateIconSvg(currentTemplate.icon || currentTemplate.title || '');
    progressPills.innerHTML = '';
    const target = Math.max(1, Number(currentTemplate.target_count || 1));
    for (let i = 0; i < Math.min(target, 8); i += 1) {
      progressPills.append(el('span', `template-detail-pill${i < Math.max(1, Math.floor(target * 0.7)) ? ' active' : ''}`, ''));
    }
  } catch (_) {
    router?.navigate('/login');
  }
}
