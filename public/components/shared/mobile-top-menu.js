import BaseComponent from '../base-component.js';

class MobileTopMenu extends BaseComponent {
  constructor({
    router = null,
    mode = 'back',
    activeKey = 'today',
    backPath = '/home',
    onAdmin = null,
    onLogout = null,
    onBack = null
  } = {}) {
    super();
    this.router = router;
    this.mode = mode;
    this.activeKey = activeKey;
    this.backPath = backPath;
    this.onAdmin = onAdmin;
    this.onLogout = onLogout;
    this.onBack = onBack;
    this.menuOpen = false;
    this.render();
  }

  navigate(path) {
    this.router?.navigate(path);
  }

  closeMenu() {
    this.menuOpen = false;
    this.render();
  }

  openMenu() {
    this.menuOpen = true;
    this.render();
  }

  createRightButton() {
    const right = this.createElement('button', {
      class: 'mobile-top-menu-btn',
      type: 'button',
      ariaLabel: 'Notifications'
    });
    right.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M15 17H5.5a1.5 1.5 0 0 1-1.2-2.4L5 13.7V10a7 7 0 1 1 14 0v3.7l.7.9a1.5 1.5 0 0 1-1.2 2.4H17"/><path d="M9.5 19a2.5 2.5 0 0 0 5 0"/></svg>';
    return right;
  }

  createBackButton() {
    const left = this.createElement('button', {
      class: 'mobile-top-menu-btn',
      type: 'button',
      ariaLabel: 'Back to Home'
    });
    left.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>';
    left.addEventListener('click', () => {
      if (this.onBack) this.onBack();
      else this.navigate(this.backPath);
    });
    return left;
  }

  createMenuButton() {
    const menuBtn = this.createElement('button', {
      class: 'mobile-top-menu-btn mobile-top-menu-toggle',
      type: 'button',
      ariaLabel: this.menuOpen ? 'Close menu' : 'Open menu'
    });
    menuBtn.setAttribute('aria-expanded', this.menuOpen ? 'true' : 'false');
    menuBtn.innerHTML = '<span class="hamburger-icon" aria-hidden="true"><span></span><span></span><span></span></span>';
    menuBtn.addEventListener('click', () => {
      if (this.menuOpen) this.closeMenu();
      else this.openMenu();
    });
    return menuBtn;
  }

  createDrawerItem(label, onClick, active = false) {
    const item = this.createElement('button', {
      class: `mobile-drawer-item${active ? ' active' : ''}`,
      type: 'button',
      innerText: label
    });
    item.addEventListener('click', async () => {
      this.closeMenu();
      await onClick?.();
    });
    return item;
  }

  createDrawer() {
    const overlay = this.createElement('div', { class: 'mobile-drawer-overlay' });
    const drawer = this.createElement('aside', { class: 'mobile-drawer' });

    const items = this.createElement('div', { class: 'mobile-drawer-items' });
    items.append(
      this.createDrawerItem('Today', () => this.navigate('/home'), this.activeKey === 'today'),
      this.createDrawerItem('Habits', () => this.navigate('/habits'), this.activeKey === 'habits'),
      this.createDrawerItem('Stats', () => this.navigate('/progress'), this.activeKey === 'stats'),
      this.createDrawerItem('Calendar', () => this.navigate('/calendar'), this.activeKey === 'calendar'),
      this.createDrawerItem('Profile', () => this.navigate('/profile'), this.activeKey === 'profile'),
      this.createDrawerItem('Settings', () => this.onAdmin?.(), this.activeKey === 'settings')
    );

    const logoutAction = this.createElement('button', {
      class: 'mobile-drawer-logout',
      type: 'button',
      innerText: 'Logout'
    });
    logoutAction.addEventListener('click', async () => {
      this.closeMenu();
      await this.onLogout?.();
    });

    drawer.append(items, logoutAction);
    overlay.addEventListener('click', () => this.closeMenu());

    return { overlay, drawer };
  }

  render() {
    this.clear();
    this.className = `mobile-top-menu${this.menuOpen ? ' menu-open' : ''}`;

    if (this.mode === 'menu') {
      const left = this.createMenuButton();
      const right = this.createRightButton();
      const { overlay, drawer } = this.createDrawer();
      this.append(left);
      this.append(right);
      this.append(overlay);
      this.append(drawer);
      return;
    }

    this.append(this.createBackButton());
    this.append(this.createRightButton());
  }
}

if (!customElements.get('mobile-top-menu')) {
  customElements.define('mobile-top-menu', MobileTopMenu);
}

export default MobileTopMenu;
