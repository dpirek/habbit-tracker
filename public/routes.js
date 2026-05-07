import renderLandingPage from './pages/home.js';
import renderLoginPage from './pages/login.js';
import renderRegisterPage from './pages/register.js';
import renderAppHomePage from './pages/app-home.js';
import renderAdminPage from './pages/admin.js';
import renderHabitsPage from './pages/habits.js';
import renderProfilePage from './pages/profile.js';
import renderHabitEntriesPage from './pages/habit-entries.js';
import renderProgressPage from './pages/progress.js';

export default function registerRoutes({ router, routeView }) {
  if (!router || !routeView) {
    return;
  }

  const add = (path, handler) => {
    router.addRoute(path, (params = {}) => handler(params));
  };

  add('/', () => renderLandingPage(routeView, router));
  add('/home', () => renderAppHomePage(routeView, router));
  add('/habits/:id/entries', (params) => renderHabitEntriesPage(routeView, router, params));
  add('/habits', () => renderHabitsPage(routeView, router));
  add('/progress', () => renderProgressPage(routeView, router));
  add('/profile', () => renderProfilePage(routeView, router));
  add('/admin', () => renderAdminPage(routeView, router));
  add('/login', () => renderLoginPage(routeView, router));
  add('/register', () => renderRegisterPage(routeView, router));
}
