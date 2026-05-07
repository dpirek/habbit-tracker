import BaseComponent from '../base-component.js';

class BottomMenu extends BaseComponent {
  constructor() {
    super();
    this.menuButtons = [];
    this.contentElement = null;
    this.controlsElement = null;
  }

  applyContentStyles(content) {
    this.setStyles(content, {
      display: 'grid',
      gap: '10px'
    });
  }


  connectedCallback() {
    this.render();
  }

  createActionButton(label) {
    return this.createElement('button', {
      type: 'button',
      innerText: label,
      style: {
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        border: '1px solid #000',
        backgroundColor: '#ffffff',
        color: '#313131',
        fontSize: '13px',
        fontWeight: '700',
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)'
      }
    });
  }

  bindNavigation(button, path) {
    button.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('bottom-menu-navigate', {
        bubbles: true,
        composed: true,
        detail: { path }
      }));
    });
  }

  createIconActionButton({
    label,
    iconSrc,
    navigateTo,
    raised = false
  }) {
    const button = this.createActionButton(label);
    button.setAttribute('aria-label', label);
    button.innerHTML = `<img src="${iconSrc}" alt="" aria-hidden="true" />`;
    this.setStyles(button, {
      border: 'none',
      backgroundColor: 'transparent',
      boxShadow: 'none',
      padding: '0'
    });
    const icon = button.querySelector('img');
    if (icon) {
      this.setStyles(icon, {
        width: '64px',
        height: '64px',
        display: 'block'
      });
    }
    if (raised) {
      this.setStyles(button, {
        transform: 'translateY(-50%)'
      });
    }
    if (navigateTo) {
      this.bindNavigation(button, navigateTo);
    }
    return button;
  }

  setMenuButtons(buttons) {
    this.menuButtons = Array.isArray(buttons) ? buttons.filter(Boolean) : [];
    this.renderMenuButtons();
    return this;
  }

  renderMenuButtons() {
    if (!this.controlsElement) {
      return;
    }
    this.controlsElement.replaceChildren(...this.menuButtons);
  }

  ensureStructure() {
    if (!this.contentElement) {
      const existingContent = this.querySelector('[data-bottom-menu-content="true"]');
      this.contentElement = existingContent || this.createElement('div', {
        'data-bottom-menu-content': 'true'
      });
    }
    this.applyContentStyles(this.contentElement);

    if (!this.controlsElement) {
      const existingControls = this.querySelector('[data-bottom-menu-controls="true"]');
      this.controlsElement = existingControls || this.createElement('div', {
        'data-bottom-menu-controls': 'true',
        style: {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '14px'
        }
      });
    }

    if (!this.contains(this.contentElement)) {
      this.prepend(this.contentElement);
    }
    if (!this.contentElement.contains(this.controlsElement)) {
      this.contentElement.prepend(this.controlsElement);
    }

    Array.from(this.children).forEach((child) => {
      if (child === this.contentElement) {
        return;
      }
      this.contentElement.append(child);
    });

  }

  render() {
    const initialDisplay = this.style.display || 'grid';

    this.setHostStyles({
      position: 'fixed',
      left: '50%',
      bottom: '0',
      transform: 'translateX(-50%)',
      zIndex: '1000',
      width: 'min(90vw, 457.91px)',
      display: initialDisplay,
      gap: '10px'
    });

    this.ensureStructure();
    this.renderMenuButtons();
  }
}

customElements.define('bottom-menu', BottomMenu);

export default BottomMenu;
