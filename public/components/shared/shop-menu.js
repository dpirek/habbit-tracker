import BaseComponent from '../base-component.js';

class ShopMenu extends BaseComponent {
  constructor() {
    super();
    this.menuButtons = [];
    this.controlsElement = null;
    this.contentElement = null;
    this.closeButtonElement = null;
    this.headerElement = null;
    this.descriptionElement = null;
    this.priceElement = null;
    this.buyButtonElement = null;
    this.selectedItem = null;
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

  bindClose(closeButton) {
    closeButton.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('bottom-menu-close', {
        bubbles: true,
        composed: true
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

  bindBuyButtonAction() {
    if (!this.buyButtonElement || this.buyButtonElement.getAttribute('data-buy-bound') === 'true') {
      return;
    }
    this.buyButtonElement.setAttribute('data-buy-bound', 'true');
    this.buyButtonElement.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('shop-menu-buy', {
        bubbles: true,
        composed: true,
        detail: {
          item: this.selectedItem
        }
      }));
    });
  }

  setItemDetails(item = null) {
    this.selectedItem = item && typeof item === 'object' ? { ...item } : null;
    if (this.headerElement) {
      this.headerElement.innerText = this.selectedItem?.title || 'Header Placeholder';
    }
    if (this.descriptionElement) {
      this.descriptionElement.innerText = this.selectedItem?.description || 'Description placeholder';
    }
    if (this.priceElement) {
      const price = Number.parseInt(String(this.selectedItem?.price ?? 0), 10);
      this.priceElement.innerText = `Price: ${Number.isNaN(price) ? 0 : price} coins`;
    }
  }

  setBuyButtonState({ disabled = false, label = 'Buy it!' } = {}) {
    if (!this.buyButtonElement) {
      return;
    }
    this.buyButtonElement.disabled = Boolean(disabled);
    this.buyButtonElement.innerText = label;
    this.buyButtonElement.style.opacity = disabled ? '0.65' : '1';
    this.buyButtonElement.style.cursor = disabled ? 'default' : 'pointer';
  }

  ensureStructure() {
    if (!this.closeButtonElement) {
      const existingCloseButton = this.querySelector('[data-bottom-menu-close="true"]');
      this.closeButtonElement = existingCloseButton || this.createElement('button', {
        type: 'button',
        innerText: 'x',
        'aria-label': 'Close menu',
        'data-bottom-menu-close': 'true',
        style: {
          position: 'absolute',
          right: '10px',
          top: '12px',
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          border: '1px solid #000',
          backgroundColor: '#fff',
          color: '#111',
          fontSize: '16px',
          lineHeight: '1',
          cursor: 'pointer',
          display: 'grid',
          placeItems: 'center',
          zIndex: '2'
        }
      });
      if (!existingCloseButton) {
        this.bindClose(this.closeButtonElement);
      }
    }

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

    if (!this.contentElement) {
      const existingContent = this.querySelector('[data-shop-menu-content="true"]');
      this.contentElement = existingContent || this.createElement('div', {
        'data-shop-menu-content': 'true',
        style: {
          display: 'grid',
          gap: '10px',
          justifyItems: 'center',
          textAlign: 'center',
          padding: '8px 6px 4px'
        }
      });

      if (!existingContent) {
        this.headerElement = this.createElement('h3', {
          innerText: 'Header Placeholder',
          style: {
            margin: '0',
            fontSize: '20px',
            fontWeight: '700',
            color: '#111'
          }
        });

        this.descriptionElement = this.createElement('p', {
          innerText: 'Description placeholder',
          style: {
            margin: '0',
            fontSize: '14px',
            fontWeight: '500',
            color: '#4a4a4a'
          }
        });

        this.priceElement = this.createElement('div', {
          innerText: 'Price: 0',
          style: {
            margin: '0',
            fontSize: '16px',
            fontWeight: '700',
            color: '#111'
          }
        });

        this.buyButtonElement = this.createElement('button', {
          type: 'button',
          innerText: 'Buy it!',
          'aria-label': 'Buy it',
          'data-shop-menu-buy': 'true',
          style: {
            minWidth: '140px',
            height: '42px',
            borderRadius: '21px',
            border: '1px solid #000',
            backgroundColor: '#f9cf20',
            color: '#111',
            fontSize: '14px',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)'
          }
        });

        this.contentElement.append(this.headerElement, this.descriptionElement, this.priceElement, this.buyButtonElement);
      } else {
        this.headerElement = existingContent.querySelector('h3');
        this.descriptionElement = existingContent.querySelector('p');
        this.priceElement = existingContent.querySelector('div');
        this.buyButtonElement = existingContent.querySelector('[data-shop-menu-buy="true"]');
      }
    }

    if (!this.contains(this.controlsElement)) {
      this.prepend(this.controlsElement);
    }
    if (!this.contains(this.contentElement)) {
      this.append(this.contentElement);
    }
    if (!this.contains(this.closeButtonElement)) {
      this.append(this.closeButtonElement);
    }
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
      gap: '10px',
      backgroundColor: '#ffffff',
      borderRadius: '10px 10px 0 0',
      border: '1px solid #000',
      padding: '40px 18px 18px',
      boxSizing: 'border-box'
    });

    this.ensureStructure();
    this.renderMenuButtons();
    this.setItemDetails(this.selectedItem);
    this.bindBuyButtonAction();
  }
}

customElements.define('shop-menu', ShopMenu);

export default ShopMenu;
