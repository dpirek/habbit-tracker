import BaseComponent from '../base-component.js';

const LANDSCAPE_BLOCK_QUERY = '(max-width: 960px) and (pointer: coarse) and (orientation: landscape)';

class OrientationLock extends BaseComponent {
  connectedCallback() {
    this.landscapeQuery = window.matchMedia(LANDSCAPE_BLOCK_QUERY);
    this.boundHandleOrientationChange = this.handleOrientationChange.bind(this);

    if (typeof this.landscapeQuery.addEventListener === 'function') {
      this.landscapeQuery.addEventListener('change', this.boundHandleOrientationChange);
    } else if (typeof this.landscapeQuery.addListener === 'function') {
      this.landscapeQuery.addListener(this.boundHandleOrientationChange);
    }

    window.addEventListener('orientationchange', this.boundHandleOrientationChange);
    window.addEventListener('resize', this.boundHandleOrientationChange);

    this.render();
    this.tryLockPortraitOrientation();
    this.handleOrientationChange();
  }

  disconnectedCallback() {
    if (this.landscapeQuery) {
      if (typeof this.landscapeQuery.removeEventListener === 'function') {
        this.landscapeQuery.removeEventListener('change', this.boundHandleOrientationChange);
      } else if (typeof this.landscapeQuery.removeListener === 'function') {
        this.landscapeQuery.removeListener(this.boundHandleOrientationChange);
      }
    }

    window.removeEventListener('orientationchange', this.boundHandleOrientationChange);
    window.removeEventListener('resize', this.boundHandleOrientationChange);
  }

  render() {
    this.clear();

    this.setHostStyles({
      display: 'none',
      position: 'fixed',
      inset: '0',
      zIndex: '9999',
      boxSizing: 'border-box',
      padding: '28px',
      background: 'linear-gradient(180deg, #8fc9ef 0%, #4eaff8 100%)',
      color: '#0d2a3d',
      textAlign: 'center',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '12px'
    });

    this.setAttribute('role', 'status');
    this.setAttribute('aria-live', 'polite');
    this.setAttribute('aria-hidden', 'true');

    const title = this.createElement('p', {
      innerText: 'Portrait mode only',
      style: {
        margin: '0',
        fontSize: '42px',
        lineHeight: '1'
      }
    });

    const text = this.createElement('p', {
      innerText: 'Rotate your device back to portrait to continue.',
      style: {
        margin: '0',
        fontSize: '24px',
        lineHeight: '1.2',
        maxWidth: '320px'
      }
    });

    this.appendChildren(this, [title, text]);
  }

  handleOrientationChange() {
    const isLandscapeOnMobile = Boolean(this.landscapeQuery?.matches);
    this.style.display = isLandscapeOnMobile ? 'flex' : 'none';
    this.style.pointerEvents = isLandscapeOnMobile ? 'auto' : 'none';
    this.setAttribute('aria-hidden', isLandscapeOnMobile ? 'false' : 'true');
  }

  tryLockPortraitOrientation() {
    if (!screen.orientation?.lock) {
      return;
    }

    screen.orientation.lock('portrait').catch(() => {});
  }
}

customElements.define('orientation-lock', OrientationLock);

export default OrientationLock;
