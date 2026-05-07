function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function navItems() {
  return [
    { key: 'today', label: 'Today', path: '/home' },
    { key: 'habits', label: 'Habits', path: '/habits' },
    { key: 'stats', label: 'Stats', path: '/progress' },
    { key: 'calendar', label: 'Calendar', path: '/calendar' },
    { key: 'profile', label: 'Profile', path: '/profile' },
    { key: 'settings', label: 'Settings', path: '/admin' },
  ];
}

export function createDesktopSidebar({ router, activeKey = 'today', userName = 'User', onLogout }) {
  const side = el('aside', 'desktop-side-menu');

  const top = el('div', 'desktop-side-top');
  const avatar = el('div', 'desktop-side-avatar', String(userName || 'U').slice(0, 1).toUpperCase());
  const user = el('p', 'desktop-side-user', String(userName || 'User'));
  user.setAttribute('data-desktop-username', 'true');
  const logout = el('button', 'desktop-side-logout');
  logout.type = 'button';
  logout.setAttribute('aria-label', 'Logout');
  logout.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>';
  logout.addEventListener('click', async () => {
    await onLogout?.();
  });

  top.append(avatar, user, logout);

  const nav = el('nav', 'desktop-side-nav');
  nav.setAttribute('aria-label', 'Desktop navigation');

  navItems().forEach((item) => {
    const btn = el('button', `desktop-side-item${item.key === activeKey ? ' active' : ''}`, item.label);
    btn.type = 'button';
    btn.addEventListener('click', () => router?.navigate(item.path));
    nav.append(btn);
  });

  side.append(top, nav);
  return side;
}

export function mountDesktopLayout(page, shell, sidebar) {
  const layout = el('div', 'desktop-layout');
  const main = el('div', 'desktop-main');
  main.append(shell);
  layout.append(sidebar, main);
  page.append(layout);
}
