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

export default async function renderHabitEntriesPage(container, router, params = {}) {
  if (!container) return;

  const habitId = Number(params.id);
  if (!Number.isInteger(habitId) || habitId <= 0) {
    router?.navigate('/home');
    return;
  }

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
  const title = el('h1', 'auth-title', 'Entries');
  const subtitle = el('p', 'auth-subtitle', 'Track progress for this habit.');
  header.append(title, subtitle);

  const flash = el('p', 'auth-status');
  const entriesPanel = el('section', 'tracker-section');
  const entriesForm = el('form', 'auth-form');
  const entryValue = el('input', 'auth-input'); entryValue.type = 'number'; entryValue.step = '0.01'; entryValue.value = '1';
  const entryNotes = el('input', 'auth-input'); entryNotes.placeholder = 'Notes';
  const entryBtn = el('button', 'auth-button', 'Log Entry'); entryBtn.type = 'submit';
  const entriesList = el('div', 'tracker-list');
  entriesForm.append(entryValue, entryNotes, entryBtn);
  entriesPanel.append(entriesForm, entriesList);

  shell.append(new MobileTopMenu({ router, mode: 'back', backPath: '/home' }), header, flash, entriesPanel);
  mountDesktopLayout(page, shell, desktopSidebar);
  page.append(new MobileBottomNav({ router, activeKey: 'today' }));
  container.replaceChildren(page);

  const setFlash = (message, error = false) => {
    flash.textContent = message || '';
    flash.dataset.error = message ? String(error) : '';
  };

  const renderEntries = (items) => {
    entriesList.innerHTML = '';
    items.forEach((entry) => {
      const row = el('div', 'tracker-entry-row');
      row.append(el('p', 'tracker-list-item', `${entry.entry_date} • ${entry.value}${entry.notes ? ` • ${entry.notes}` : ''}`));
      const del = el('button', 'auth-link-button', 'Delete');
      del.type = 'button';
      del.addEventListener('click', async () => {
        await api(`/api/entries/${entry.id}`, { method: 'DELETE' });
        await loadEntries();
      });
      row.append(del);
      entriesList.append(row);
    });
  };

  const loadEntries = async () => {
    renderEntries(await api(`/api/habits/${habitId}/entries`));
  };

  entriesForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      const today = new Date().toISOString().slice(0, 10);
      await api(`/api/habits/${habitId}/entries`, {
        method: 'POST',
        body: JSON.stringify({
          entry_date: today,
          value: Number(entryValue.value || 1),
          notes: entryNotes.value.trim() || null
        }),
      });
      entryValue.value = '1';
      entryNotes.value = '';
      setFlash('Entry logged');
      await loadEntries();
    } catch (error) {
      setFlash(error.message || 'Failed to log entry', true);
    }
  });

  try {
    const authUser = await api('/api/auth/user');
    const desktopUser = desktopSidebar.querySelector('[data-desktop-username="true"]');
    const desktopAvatar = desktopSidebar.querySelector('.desktop-side-avatar');
    if (desktopUser) desktopUser.textContent = authUser?.username || 'User';
    if (desktopAvatar) desktopAvatar.textContent = String(authUser?.username || 'U').slice(0, 1).toUpperCase();
    const habit = await api(`/api/habits/${habitId}`);
    title.textContent = habit?.title ? `Entries: ${habit.title}` : 'Entries';
    subtitle.textContent = `${habit?.target_count || 1}${habit?.unit ? ` ${habit.unit}` : ''} • ${habit?.frequency || 'daily'}`;
    await loadEntries();
  } catch (_) {
    router?.navigate('/login');
  }
}
