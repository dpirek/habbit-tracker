import BaseComponent from '../base-component.js';
import CoinCount from './coin-count.js';
import UserAvatar from './user-avatar.js';

class AppHeader extends BaseComponent {
  static get observedAttributes() {
    return ['coin-value', 'avatar-alt', 'user-id'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) {
      return;
    }

    if (name === 'coin-value' || name === 'avatar-alt' || name === 'user-id') {
      this.render();
    }
  }

  get coinValue() {
    const parsed = Number.parseInt(this.getAttribute('coin-value') || '0', 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  set coinValue(value) {
    this.setAttribute('coin-value', String(value));
  }

  get avatarAlt() {
    return this.getAttribute('avatar-alt') || 'User';
  }

  set avatarAlt(value) {
    this.setAttribute('avatar-alt', String(value));
  }

  get userId() {
    return this.getAttribute('user-id') || '';
  }

  set userId(value) {
    this.setAttribute('user-id', String(value || ''));
  }

  render() {
    this.clear();

    const coinCount = new CoinCount();
    coinCount.value = this.coinValue;

    const userAvatar = new UserAvatar();
    userAvatar.setAttribute('alt', this.avatarAlt);
    userAvatar.userId = this.userId;

    this.appendChildren(this, [coinCount, userAvatar]);

    this.setHostStyles({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      zIndex: '1200'
    });
  }
}

customElements.define('app-header', AppHeader);

export default AppHeader;
