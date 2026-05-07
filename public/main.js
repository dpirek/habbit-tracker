import Router from './utils/router.js';
import registerRoutes from './routes.js';

async function hasActiveSession() {
  try {
    const response = await fetch('/api/auth/user', { method: 'GET' });
    return response.ok;
  } catch (_) {
    return false;
  }
}

const router = new Router();
const routeView = document.querySelector('#app');

registerRoutes({
  router,
  routeView
});

if (routeView) {
  hasActiveSession().then((loggedIn) => {
    const path = window.location.pathname;

    if (loggedIn && (path === '/' || path === '/login' || path === '/register')) {
      router.navigate('/home');
      return;
    }

    if (!loggedIn && path === '/home') {
      router.navigate('/login');
      return;
    }

    router.resolve(path);
  });
} else {
  console.error('Route container #app not found.');
}
