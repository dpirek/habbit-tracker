import renderLandingPage from './pages/home.js';
import renderLoginPage from './pages/login.js';
import renderRegisterPage from './pages/register.js';
import renderAppHomePage from './pages/app-home.js';

export default function registerRoutes({ router, routeView }) {
  if (!router || !routeView) {
    return;
  }

  const add = (path, handler) => {
    router.addRoute(path, (params = {}) => handler(params));
  };

  add('/', () => renderLandingPage(routeView, router));
  add('/home', () => renderAppHomePage(routeView, router));
  add('/login', () => renderLoginPage(routeView, router));
  add('/register', () => renderRegisterPage(routeView, router));
}
