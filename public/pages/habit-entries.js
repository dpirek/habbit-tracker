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

export default async function renderHabitEntriesPage(container, router, params = {}) {
  if (!container) return;

  const habitId = Number(params.id);
  if (!Number.isInteger(habitId) || habitId <= 0) {
    router?.navigate('/home');
    return;
  }

  const page = el('section', 'tracker-page');
  const shell = el('div', 'tracker-shell');

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

  shell.append(createTopMenu(router), header, flash, entriesPanel);
  page.append(shell, createMobileNav(router, 'today'));
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
    await api('/api/auth/user');
    const habit = await api(`/api/habits/${habitId}`);
    title.textContent = habit?.title ? `Entries: ${habit.title}` : 'Entries';
    subtitle.textContent = `${habit?.target_count || 1}${habit?.unit ? ` ${habit.unit}` : ''} • ${habit?.frequency || 'daily'}`;
    await loadEntries();
  } catch (_) {
    router?.navigate('/login');
  }
}
