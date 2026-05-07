import BaseComponent from '../base-component.js';

const LOCAL_SVG_ASSETS = {
  "user": `<?xml version="1.0" encoding="UTF-8"?>
<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 47.88 47.88">
  <path d="M47.88,23.94c0,8.57-4.51,16.09-11.28,20.31-.18.12-.36.23-.55.33l-.28-.77c-.47-1.28-1.14-2.46-1.92-3.59-.76-1.1-1.79-1.83-2.81-2.66l-.95-.76c-4.04,2-7.64,1.84-11.76.35-.52-.19-.84.33-1.6.85-1.68,1.16-2.95,2.71-3.8,4.58-.33.72-.57,1.43-.81,2.17-.18-.09-.36-.2-.54-.31C4.64,40.25,0,32.64,0,23.94,0,10.72,10.72,0,23.94,0s23.94,10.72,23.94,23.94Z" fill="#56affd"/>
  <path d="M37.41,23.56c-.27-.03-.44-.23-.5-.46l-.64-2.41c-.19-.72-.81-1.04-1.5-1.02-1.29.05-2.48-.19-3.68-.57-2.31-.75-4.02-1.92-5.9-3.41-.11-.09-.37-.11-.48-.06-.72.33.96,3.3,1.56,3.88-3.83-.07-7.32-1.22-9.73-4.21-.32-.4-.69-.58-1.19-.33-.37.19-.73.49-1.03.81-1.81,1.9-2.54,4.03-3.22,6.52-.11.4-.2.77-.46,1.16-1.19-3.03-1.64-6.67.62-9.21.66-.73,1.42-1.27,2.2-1.88.15-.13.31-.33.34-.47.15-.67-.98-1.27-1.59-1.57.89-.41,1.98.49,2.69.09.64-.36.28-1.95,1.79-2.89-.12.62-.58,2.04.06,2.38.29.15.69.05.97-.1,3.46-1.82,7.33-2.88,11.21-1.84,1.23.33,2.36.84,3.39,1.61,1.75,1.32,4.19,3.34,5.02,5.41,1.02,2.55,1.31,6.04.07,8.57Z" fill="#fff"/>
  <path d="M38.9,27.59c-.33.73-1.06,1.4-2.01,1.57-.72.13-1.19.45-1.51,1.08-1.32,2.61-1.79,3.42-4.26,5.17-2.81,1.98-6.23,2.69-9.6,2-1.82-.38-3.56-.9-5.15-1.91-1.39-.88-2.52-2.15-3.3-3.59-.37-.7-.66-1.34-1.17-1.93-.61-.7-1.27-.52-2.28-1.33-1-.8-1.37-2.24-.8-3.4.58-1.18,2.16-.44,2.61-1.93l.73-2.41c.49-1.6,1.96-4.86,3.7-5.43,1.11,1.48,3,2.9,4.68,3.56,1.59.63,3.22.98,4.93,1.08.4.03,1.37.05,1.54-.33.04-.1.01-.38-.06-.47-.68-.81-1.29-1.66-1.64-2.73,2.32,1.7,3.99,2.79,6.83,3.44.9.21,1.79.26,2.71.29.42.01.73.21.85.64l.63,2.32c.37,1.34,1.77.86,2.36,1.64.58.76.62,1.77.21,2.67Z" fill="#fff"/>
  <path d="M39.69,25.54c-.2-.87-.79-1.52-1.73-1.76,1.23-2.55,1.06-5.42.31-8.03-.23-.78-.53-1.51-.98-2.18-.79-1.18-1.76-2.16-2.84-3.06-.66-.55-1.26-1.09-1.96-1.59-1.14-.82-2.42-1.33-3.79-1.65-3.47-.82-7.1-.04-10.26,1.48-.46.22-.84.39-1.35.59-.22-.57.6-2.24.07-2.59-.44-.29-1.43.68-1.77,1.17-.6.89-.63,1.85-.84,1.97-.35.2-1.75-.87-3.19.16-.09.07-.2.28-.17.38.02.09.14.25.23.29l.7.29c.43.18.79.39,1.07.76l-1.1.87c-.71.56-1.37,1.18-1.87,1.95-1.81,2.74-1.26,6.27-.14,9.17-.84.2-1.55.57-1.87,1.33-.48,1.11-.31,2.43.41,3.4.55.75,1.32,1.23,2.2,1.5.41.13.71.41.91.78l.81,1.49c.99,1.81,2.76,3.59,4.75,4.44-.22.3-.48.51-.78.71-1.81,1.21-3.18,2.83-4.1,4.81-.34.73-.59,1.46-.83,2.22.18.11.36.22.54.31.24-.74.48-1.45.81-2.17.85-1.87,2.12-3.42,3.8-4.58.76-.52,1.08-1.04,1.6-.85,4.12,1.49,7.72,1.65,11.76-.35l.95.76c1.02.83,2.05,1.56,2.81,2.66.78,1.13,1.45,2.31,1.92,3.59l.28.77c.19-.1.37-.21.55-.33-.46-1.3-1.03-2.52-1.77-3.71-.77-1.25-1.75-2.28-2.93-3.13l-.95-.69c-.12-.09-.09-.36.03-.44l1.51-1.11c1.24-.91,2.12-2.14,2.85-3.5l.72-1.31c.14-.26.45-.49.76-.54,2.08-.3,3.35-2.24,2.87-4.28ZM11.26,14.25c.66-.73,1.42-1.27,2.2-1.88.15-.13.31-.33.34-.47.15-.67-.98-1.27-1.59-1.57.89-.41,1.98.49,2.69.09.64-.36.28-1.95,1.79-2.89-.12.62-.58,2.04.06,2.38.29.15.69.05.97-.1,3.46-1.82,7.33-2.88,11.21-1.84,1.23.33,2.36.84,3.39,1.61,1.75,1.32,4.19,3.34,5.02,5.41,1.02,2.55,1.31,6.04.07,8.57-.27-.03-.44-.23-.5-.46l-.64-2.41c-.19-.72-.81-1.04-1.5-1.02-1.29.05-2.48-.19-3.68-.57-2.31-.75-4.02-1.92-5.9-3.41-.11-.09-.37-.11-.48-.06-.72.33.96,3.3,1.56,3.88-3.83-.07-7.32-1.22-9.73-4.21-.32-.4-.69-.58-1.19-.33-.37.19-.73.49-1.03.81-1.81,1.9-2.54,4.03-3.22,6.52-.11.4-.2.77-.46,1.16-1.19-3.03-1.64-6.67.62-9.21ZM38.9,27.59c-.33.73-1.06,1.4-2.01,1.57-.72.13-1.19.45-1.51,1.08-1.32,2.61-1.79,3.42-4.26,5.17-2.81,1.98-6.23,2.69-9.6,2-1.82-.38-3.56-.9-5.15-1.91-1.39-.88-2.52-2.15-3.3-3.59-.37-.7-.66-1.34-1.17-1.93-.61-.7-1.27-.52-2.28-1.33-1-.8-1.37-2.24-.8-3.4.58-1.18,2.16-.44,2.61-1.93l.73-2.41c.49-1.6,1.96-4.86,3.7-5.43,1.11,1.48,3,2.9,4.68,3.56,1.59.63,3.22.98,4.93,1.08.4.03,1.37.05,1.54-.33.04-.1.01-.38-.06-.47-.68-.81-1.29-1.66-1.64-2.73,2.32,1.7,3.99,2.79,6.83,3.44.9.21,1.79.26,2.71.29.42.01.73.21.85.64l.63,2.32c.37,1.34,1.77.86,2.36,1.64.58.76.62,1.77.21,2.67Z"/>
  <path d="M36.05,44.58c-3.55,2.1-7.69,3.3-12.11,3.3-4.3,0-8.33-1.13-11.82-3.13.24-.74.48-1.45.81-2.17.85-1.87,2.12-3.42,3.8-4.58.76-.52,1.08-1.04,1.6-.85,4.12,1.49,7.72,1.65,11.76-.35l.95.76c1.02.83,2.05,1.56,2.81,2.66.78,1.13,1.45,2.31,1.92,3.59l.28.77Z" fill="#fff"/>
</svg>`
};

function getSvgMarkup(value, fallbackKey = null) {
  const normalize = (input) => String(input || '').trim().toLowerCase();
  const key = normalize(value);
  const fallback = normalize(fallbackKey);

  const keys = Object.keys(LOCAL_SVG_ASSETS);
  const matchKey = keys.find((entry) => normalize(entry) === key);
  if (matchKey) {
    return LOCAL_SVG_ASSETS[matchKey];
  }

  const fallbackMatch = keys.find((entry) => normalize(entry) === fallback);
  if (fallbackMatch) {
    return LOCAL_SVG_ASSETS[fallbackMatch];
  }

  return '';
}

class UserAvatar extends BaseComponent {
  static get observedAttributes() {
    return ['src', 'alt', 'user-id'];
  }

  constructor() {
    super();
    this.menuOpen = false;
    this.onHostClick = (event) => {
      event.stopPropagation();
      this.menuOpen = !this.menuOpen;
      this.render();
    };
    this.onDocumentClick = (event) => {
      if (!this.menuOpen) {
        return;
      }
      if (this.contains(event.target)) {
        return;
      }
      this.menuOpen = false;
      this.render();
    };
  }

  connectedCallback() {
    this.addEventListener('click', this.onHostClick);
    document.addEventListener('click', this.onDocumentClick);
    this.render();
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.onHostClick);
    document.removeEventListener('click', this.onDocumentClick);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) {
      return;
    }

    if (!this.visualElement) {
      this.render();
      return;
    }

    this.render();
  }

  get src() {
    return this.getAttribute('src') || 'user';
  }

  get alt() {
    return this.getAttribute('alt') || 'User';
  }

  get userId() {
    return this.getAttribute('user-id') || '';
  }

  set userId(value) {
    this.setAttribute('user-id', String(value || ''));
  }

  render() {
    this.clear();

    const userSvgMarkup = getSvgMarkup(this.src, 'user');
    if (userSvgMarkup) {
      const userIcon = this.createElement('div', {
        innerHTML: userSvgMarkup,
        style: {
          width: '24px',
          height: '24px',
          display: 'block',
          lineHeight: '0'
        }
      });
      const svgElement = userIcon.querySelector('svg');
      if (svgElement) {
        this.setStyles(svgElement, {
          width: '24px',
          height: '24px',
          display: 'block'
        });
        svgElement.setAttribute('role', 'img');
        svgElement.setAttribute('aria-label', this.alt);
      }
      this.visualElement = userIcon;
      this.append(userIcon);
    } else {
      const userIcon = this.createElement('img', {
        src: this.src,
        alt: this.alt,
        style: {
          width: '24px',
          height: '24px',
          display: 'block'
        }
      });
      this.visualElement = userIcon;
      this.append(userIcon);
    }

    if (this.menuOpen) {
      const menu = this.createElement('div', {
        style: {
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: '0',
          minWidth: '120px',
          border: '1px solid #000000',
          borderRadius: '8px',
          backgroundColor: '#ffffff',
          boxShadow: '0 8px 18px rgba(0, 0, 0, 0.18)',
          overflow: 'hidden',
          zIndex: '20'
        }
      });

      if (this.userId) {
        const userIdLabel = this.createElement('div', {
          innerText: `User: ${this.userId}`,
          style: {
            padding: '10px 12px',
            color: '#555555',
            fontSize: '12px',
            borderBottom: '1px solid #e6e6e6'
          }
        });
        menu.append(userIdLabel);
      }

      const homeLink = this.createElement('a', {
        href: '/',
        innerText: 'Home',
        style: {
          display: 'block',
          padding: '10px 12px',
          color: '#1f1f1f',
          textDecoration: 'none',
          fontSize: '14px',
          cursor: 'pointer'
        }
      });

      homeLink.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.menuOpen = false;
        this.dispatchEvent(new CustomEvent('home-request', {
          bubbles: true,
          composed: true
        }));
        this.render();
      });

      const profileLink = this.createElement('a', {
        href: '/child/profile',
        innerText: 'Profile',
        style: {
          display: 'block',
          padding: '10px 12px',
          color: '#1f1f1f',
          textDecoration: 'none',
          fontSize: '14px',
          cursor: 'pointer'
        }
      });

      profileLink.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.menuOpen = false;
        this.dispatchEvent(new CustomEvent('profile-request', {
          bubbles: true,
          composed: true
        }));
        this.render();
      });

      const logoutLink = this.createElement('a', {
        href: '/login',
        innerText: 'Logout',
        style: {
          display: 'block',
          padding: '10px 12px',
          color: '#1f1f1f',
          textDecoration: 'none',
          fontSize: '14px',
          cursor: 'pointer'
        }
      });

      logoutLink.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.menuOpen = false;
        this.dispatchEvent(new CustomEvent('logout-request', {
          bubbles: true,
          composed: true
        }));
        this.render();
      });

      const resetProgressButton = this.createElement('button', {
        type: 'button',
        innerText: 'Reset',
        style: {
          display: 'block',
          width: '100%',
          padding: '10px 12px',
          color: '#1f1f1f',
          backgroundColor: '#ffffff',
          border: 'none',
          borderTop: '1px solid #e6e6e6',
          textAlign: 'left',
          fontSize: '14px',
          cursor: 'pointer'
        }
      });

      resetProgressButton.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.menuOpen = false;
        this.dispatchEvent(new CustomEvent('reset-progress-request', {
          bubbles: true,
          composed: true
        }));
        this.render();
      });

      menu.append(homeLink, profileLink, logoutLink, resetProgressButton);
      this.append(menu);
    }

    this.setHostStyles({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      backgroundColor: '#ffffff',
      border: '1px solid #000000',
      borderRadius: '12px',
      padding: '8px 10px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
    });
  }
}

customElements.define('user-avatar', UserAvatar);

export default UserAvatar;
