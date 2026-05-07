import BaseComponent from '../base-component.js';

function navItems() {
  return [
    { key: 'today', label: 'Today', path: '/home' },
    { key: 'habits', label: 'Habits', path: '/habits' },
    { key: 'stats', label: 'Stats', path: '/progress' },
    { key: 'calendar', label: 'Calendar', path: '/calendar' },
    { key: 'profile', label: 'Profile', path: '/profile' },
    { key: 'settings', label: 'Settings', path: '/admin' }
  ];
}

class DesktopSideMenu extends BaseComponent {
  constructor({ router = null, activeKey = 'today', userName = 'User', onLogout = null } = {}) {
    super();
    this.router = router;
    this.activeKey = activeKey;
    this.userName = userName;
    this.onLogout = onLogout;
    this.render();
  }

  setUserName(userName = 'User') {
    this.userName = userName;
    this.render();
  }

  render() {
    this.clear();
    this.className = 'desktop-side-menu';

    const top = this.createElement('div', { class: 'desktop-side-top' });
    const avatar = this.createElement('div', {
      class: 'desktop-side-avatar',
      innerText: String(this.userName || 'U').slice(0, 1).toUpperCase()
    });
    const user = this.createElement('p', {
      class: 'desktop-side-user',
      innerText: String(this.userName || 'User')
    });
    user.setAttribute('data-desktop-username', 'true');

    const logout = this.createElement('button', {
      class: 'desktop-side-logout',
      type: 'button',
      ariaLabel: 'Logout'
    });
    logout.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>';
    logout.addEventListener('click', async () => {
      await this.onLogout?.();
    });

    top.append(avatar, user, logout);

    const nav = this.createElement('nav', { class: 'desktop-side-nav' });
    nav.setAttribute('aria-label', 'Desktop navigation');

    navItems().forEach((item) => {
      const btn = this.createElement('button', {
        class: `desktop-side-item${item.key === this.activeKey ? ' active' : ''}`,
        type: 'button',
        innerText: item.label
      });
      btn.addEventListener('click', () => this.router?.navigate(item.path));
      nav.append(btn);
    });

    this.append(top);
    this.append(nav);
  }
}

export function mountDesktopLayout(page, shell, sidebar) {
  const layout = document.createElement('div');
  layout.className = 'desktop-layout';
  const main = document.createElement('div');
  main.className = 'desktop-main';
  main.append(shell);
  layout.append(sidebar, main);
  page.append(layout);
}

if (!customElements.get('desktop-side-menu')) {
  customElements.define('desktop-side-menu', DesktopSideMenu);
}

export default DesktopSideMenu;
