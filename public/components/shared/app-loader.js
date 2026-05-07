import BaseComponent from '../base-component.js';

class AppLoader extends BaseComponent {
  static get observedAttributes() {
    return ['active'];
  }

  connectedCallback() {
    this.ensureAnimationStyles();
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'active' && oldValue !== newValue) {
      this.render();
    }
  }

  get active() {
    const value = this.getAttribute('active');
    if (value === null) {
      return true;
    }

    return value !== 'false';
  }

  set active(value) {
    this.setAttribute('active', String(Boolean(value)));
  }

  render() {
    this.clear();

    this.setHostStyles({
      position: 'absolute',
      inset: '0',
      display: this.active ? 'flex' : 'none',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none'
    });

    this.setAttribute('aria-live', 'polite');
    this.setAttribute('aria-busy', this.active ? 'true' : 'false');

    const ring = this.createElement('div', {
      'aria-hidden': 'true',
      style: {
        width: '92px',
        height: '92px',
        borderRadius: '999px',
        border: '2px solid rgba(255, 255, 255, 0.55)',
        borderTopColor: '#313131',
        animation: 'app-loader-spin 1s linear infinite'
      }
    });

    const dot = this.createElement('div', {
      'aria-hidden': 'true',
      style: {
        width: '24px',
        height: '24px',
        marginTop: '-58px',
        borderRadius: '999px',
        background: '#f9cf20',
        animation: 'app-loader-bob 1.2s ease-in-out infinite'
      }
    });

    const label = this.createElement('p', {
      innerText: 'Loading island...',
      style: {
        margin: '44px 0 0',
        color: '#ffffff',
        fontSize: '14px',
        fontWeight: '700',
        textShadow: '0 1px 2px rgba(0, 0, 0, 0.25)'
      }
    });

    this.appendChildren(this, [ring, dot, label]);
  }

  ensureAnimationStyles() {
    const styleId = 'app-loader-animation';
    if (document.getElementById(styleId)) {
      return;
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes app-loader-spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      @keyframes app-loader-bob {
        0%,
        100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-6px);
        }
      }
    `;
    document.head.appendChild(style);
  }
}

customElements.define('app-loader', AppLoader);

export default AppLoader;
