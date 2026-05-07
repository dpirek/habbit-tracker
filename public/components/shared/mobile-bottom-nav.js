import BaseComponent from '../base-component.js';

const ICON_PATHS = {
  home: '<path d="M3 10.5L12 3l9 7.5"/><path d="M5.5 9.5V20h13V9.5"/>',
  habits: '<rect x="4" y="4.5" width="16" height="15.5" rx="3"/><path d="M8 2.5v4M16 2.5v4M7.5 10.5h9"/>',
  stats: '<path d="M5 19V9"/><path d="M10 19V5"/><path d="M15 19v-7"/><path d="M20 19V12"/>',
  profile: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c1.8-3.4 4-5 7-5s5.2 1.6 7 5"/>'
};

function iconMarkup(name) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON_PATHS[name] || ''}</svg>`;
}

class MobileBottomNav extends BaseComponent {
  constructor({ router = null, activeKey = 'today', centerPath = '/habits/custom' } = {}) {
    super();
    this.router = router;
    this.activeKey = activeKey;
    this.centerPath = centerPath;
    this.render();
  }

  navigate(path) {
    this.router?.navigate(path);
  }

  createItem({ key, label, icon, path }) {
    const button = this.createElement('button', {
      class: `mobile-nav-item${this.activeKey === key ? ' active' : ''}`,
      type: 'button'
    });

    button.innerHTML = `<span class="mobile-nav-icon">${iconMarkup(icon)}</span><span>${label}</span>`;
    button.addEventListener('click', () => this.navigate(path));
    return button;
  }

  render() {
    this.clear();
    this.className = 'mobile-bottom-nav';
    this.setAttribute('aria-label', 'Mobile navigation');

    const center = this.createElement('button', {
      class: 'mobile-nav-center',
      type: 'button',
      innerText: '+'
    });
    center.addEventListener('click', () => this.navigate(this.centerPath));

    this.appendChildren(this, [
      this.createItem({ key: 'today', label: 'Today', icon: 'home', path: '/home' }),
      this.createItem({ key: 'habits', label: 'Habits', icon: 'habits', path: '/habits' }),
      center,
      this.createItem({ key: 'stats', label: 'Stats', icon: 'stats', path: '/progress' }),
      this.createItem({ key: 'profile', label: 'Profile', icon: 'profile', path: '/profile' })
    ]);
  }
}

if (!customElements.get('mobile-bottom-nav')) {
  customElements.define('mobile-bottom-nav', MobileBottomNav);
}

export default MobileBottomNav;
