import renderHomePage from './pages/home.js';

export default function registerRoutes({ router, routeView }) {
  if (!router || !routeView) {
    return;
  }

  const add = (path, handler) => {
    router.addRoute(path, (params = {}) => handler(params));
  };

  add('/', () => renderHomePage(routeView, router));
}
