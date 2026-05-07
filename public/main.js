import Router from './utils/router.js';
import registerRoutes from './routes.js';

const router = new Router();
const routeView = document.querySelector('#app');

registerRoutes({
  router,
  routeView
});

if (routeView) {
  router.resolve(window.location.pathname);
} else {
  console.error('Route container #app not found.');
}
