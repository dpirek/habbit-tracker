import BaseComponent from '../base-component.js';

class SpeechBubble extends BaseComponent {
  static get observedAttributes() {
    return ['text'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'text' && oldValue !== newValue) {
      this.render();
    }
  }

  get text() {
    return this.getAttribute('text') || '';
  }

  set text(value) {
    this.setAttribute('text', String(value || ''));
  }

  render() {
    this.clear();

    const bubble = this.createElement('img', {
      src: '/images/svg/buble.svg',
      alt: '',
      'aria-hidden': 'true',
      style: {
        width: '100%',
        height: 'auto',
        display: 'block'
      }
    });

    const textLayer = this.createElement('div', {
      innerText: this.text,
      style: {
        position: 'absolute',
        left: '10%',
        right: '10%',
        top: '10%',
        bottom: '24%',
        display: 'grid',
        placeItems: 'center',
        textAlign: 'center',
        color: '#111',
        fontSize: '24px',
        fontWeight: '700',
        lineHeight: '1.2',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        overflow: 'hidden',
        pointerEvents: 'none'
      }
    });

    this.appendChildren(this, [bubble, textLayer]);

    this.setHostStyles({
      position: this.style.position || 'relative',
      display: 'block',
      width: 'min(100%, 620px)'
    });
  }
}

customElements.define('speech-bubble', SpeechBubble);

export default SpeechBubble;
