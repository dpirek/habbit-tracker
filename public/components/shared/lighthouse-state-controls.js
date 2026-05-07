import BaseComponent from '../base-component.js';

class LighthouseStateControls extends BaseComponent {
  static get observedAttributes() {
    return ['value', 'min', 'max'];
  }

  constructor(props = {}) {
    super();
    if (props && typeof props === 'object') {
      if (Object.prototype.hasOwnProperty.call(props, 'value')) {
        this.value = props.value;
      }
      if (Object.prototype.hasOwnProperty.call(props, 'min')) {
        this.min = props.min;
      }
      if (Object.prototype.hasOwnProperty.call(props, 'max')) {
        this.max = props.max;
      }
    }
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) {
      return;
    }
    if (name === 'value' || name === 'min' || name === 'max') {
      this.render();
    }
  }

  get min() {
    const parsed = Number.parseInt(this.getAttribute('min') || '1', 10);
    return Number.isNaN(parsed) ? 1 : parsed;
  }

  set min(value) {
    this.setAttribute('min', String(value));
  }

  get max() {
    const parsed = Number.parseInt(this.getAttribute('max') || '7', 10);
    return Number.isNaN(parsed) ? 7 : parsed;
  }

  set max(value) {
    this.setAttribute('max', String(value));
  }

  get value() {
    const parsed = Number.parseInt(this.getAttribute('value') || String(this.min), 10);
    if (Number.isNaN(parsed)) {
      return this.min;
    }
    return Math.min(this.max, Math.max(this.min, parsed));
  }

  set value(value) {
    const parsed = Number.parseInt(String(value), 10);
    const clamped = Number.isNaN(parsed)
      ? this.min
      : Math.min(this.max, Math.max(this.min, parsed));
    this.setAttribute('value', String(clamped));
  }

  render() {
    this.clear();

    const controls = this.createElement('div', {
      class: 'state-controls',
      style: {
        position: 'fixed',
        left: '50%',
        bottom: '16px',
        transform: 'translateX(-50%)',
        zIndex: '10000',
        display: 'flex',
        gap: '8px',
        padding: '8px 10px',
        borderRadius: '12px',
        background: 'rgba(255, 255, 255, 0.9)',
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)'
      }
    });

    for (let state = this.min; state <= this.max; state += 1) {
      const isActive = state === this.value;
      const button = this.createElement('button', {
        type: 'button',
        class: `state-button${isActive ? ' is-active' : ''}`,
        innerText: String(state),
        style: {
          width: '36px',
          height: '36px',
          border: isActive ? '1px solid #d9af00' : '1px solid #b9b9b9',
          borderRadius: '10px',
          background: isActive ? '#f9cf20' : '#ffffff',
          color: '#1f1f1f',
          cursor: 'pointer',
          fontFamily: 'inherit',
          fontSize: '16px',
          lineHeight: '1'
        }
      });
      button.addEventListener('click', () => {
        this.value = state;
        this.dispatchEvent(new CustomEvent('state-change', {
          bubbles: true,
          composed: true,
          detail: { state }
        }));
      });
      controls.appendChild(button);
    }

    this.append(controls);
    this.setHostStyles({
      display: 'block'
    });
  }
}

customElements.define('lighthouse-state-controls', LighthouseStateControls);

export default LighthouseStateControls;
