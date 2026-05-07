class Router {
  constructor() {
    this.routes = [];
    window.addEventListener('popstate', () => {
      this.resolve(window.location.pathname);
    });
  }

  addRoute(path, handler) {
    this.routes.push({ path, handler });
  }

  resolve(path) {
    const match = this.match(path);
    if (match) {
      match.handler(match.params);
    } else {
      console.warn('No route matched for path:', path);
    }
  }

  navigate(path) {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    this.resolve(path);
  }

  match(url) {
    const params = {};
    
    const route = this.routes.find(r => {
      const keys = r.path.match(/:\w+/g);
      if (!keys) return r.path === url;
      const regex = new RegExp('^' + r.path.replace(/:\w+/g, '([^/]+)') + '$');
      const match = url.match(regex);
      if (match) {
        keys.forEach((key, i) => {
          params[key.slice(1)] = match[i + 1];
        });
      }
      return match;
    });

    return route ? { handler: route.handler, params, type: route.type } : null;
  }
}

export default Router;
