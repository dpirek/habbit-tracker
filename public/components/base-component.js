class BaseComponent extends HTMLElement {
  static SVG_NS = 'http://www.w3.org/2000/svg';
  static DEFAULT_HOST_STYLES = {
    display: 'block',
    position: 'static',
    boxSizing: 'border-box'
  };

  constructor() {
    super();
  }

  normalizeAttributeName(key) {
    if (key === 'className') return 'class';
    if (key === 'htmlFor') return 'for';
    if (key === 'ariaLabel') return 'aria-label';
    return key;
  }

  setStyles(element, styles) {
    if (!styles) return;

    if (typeof styles === 'string') {
      element.setAttribute('style', styles);
      return;
    }

    for (let key in styles) {
      element.style[key] = styles[key];
    }
  }

  setHostStyles(styles) {
    const hostStyles = {
      ...BaseComponent.DEFAULT_HOST_STYLES,
      ...(styles || {})
    };
    this.setStyles(this, hostStyles);
  }

  createSvgElement(tag, props = {}) {
    return this.createElement(document.createElementNS(BaseComponent.SVG_NS, tag), props);
  }

  queryRequired(selector, root = this) {
    const element = root.querySelector(selector);
    if (!element) {
      throw new Error(`Missing required element: ${selector}`);
    }
    return element;
  }

  createElement(tag, props) {
    const element = (typeof tag === 'string')? document.createElement(tag) : tag;
  
    if(props) {
      for (let key in props) {
        if(key === 'children') continue;
        if(key === 'addEventListener') continue;
        if(key === 'innerHTML') continue;
        if(key === 'innerText') continue;
        if(key === 'style') continue;
        if(key === 'value') continue;
        element.setAttribute(this.normalizeAttributeName(key), props[key]);
      }
  
      if(props.innerHTML) element.innerHTML = props.innerHTML;
      if(props.innerText) element.innerText = props.innerText;
      if (Object.prototype.hasOwnProperty.call(props, 'value')) {
        element.value = props.value;
      }
  
      if(props.addEventListener) {
        element.addEventListener(props.addEventListener.name, props.addEventListener.handler);
      }
  
      if(props.children) {
        this.appendChildren(element, props.children);
      }
  
      this.setStyles(element, props.style);
    }
    
    return element;
  }

  appendChildren(parent, children) {
    children.forEach(child => {
      if (child) {
        parent.appendChild(child);
      } 
    });
  }

  append(element) {
    this.appendChild(element);
  }

  render() {
    // to be implemented by subclasses
  }

  clear() {
    this.innerHTML = '';
  }

  refresh() {
    this.clear();
    this.render();
  }
}

export default BaseComponent;
