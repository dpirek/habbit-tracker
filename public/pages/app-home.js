export default async function renderAppHomePage(container, router) {
  if (!container) return;

  const page = document.createElement('section');
  page.className = 'auth-page';

  const card = document.createElement('div');
  card.className = 'auth-card';

  const title = document.createElement('h1');
  title.className = 'auth-title';
  title.textContent = 'Home';

  const subtitle = document.createElement('p');
  subtitle.className = 'auth-subtitle';
  subtitle.textContent = 'Your habit dashboard is ready.';

  const profile = document.createElement('div');
  profile.className = 'auth-profile';
  profile.textContent = 'Loading user...';

  const status = document.createElement('p');
  status.className = 'auth-status';

  const actions = document.createElement('div');
  actions.className = 'auth-actions';

  const habitsButton = document.createElement('button');
  habitsButton.type = 'button';
  habitsButton.className = 'auth-button';
  habitsButton.textContent = 'View Habits API';
  habitsButton.addEventListener('click', () => {
    window.location.href = '/api/habits';
  });

  const logoutButton = document.createElement('button');
  logoutButton.type = 'button';
  logoutButton.className = 'auth-link-button';
  logoutButton.textContent = 'Logout';
  logoutButton.addEventListener('click', async () => {
    try {
      const response = await fetch('/api/auth/sign-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        status.textContent = 'Logout failed';
        status.dataset.error = 'true';
        return;
      }

      status.textContent = 'Signed out';
      status.dataset.error = 'false';
      setTimeout(() => router?.navigate('/login'), 250);
    } catch (_) {
      status.textContent = 'Network error';
      status.dataset.error = 'true';
    }
  });

  actions.append(habitsButton, logoutButton);
  card.append(title, subtitle, profile, actions, status);
  page.append(card);

  try {
    const response = await fetch('/api/auth/user', { method: 'GET' });
    if (!response.ok) {
      profile.textContent = 'Session expired. Please login again.';
      setTimeout(() => router?.navigate('/login'), 250);
    } else {
      const result = await response.json();
      const user = result?.data;
      profile.textContent = user?.username
        ? `Logged in as: ${user.username}`
        : 'Logged in user';
    }
  } catch (_) {
    profile.textContent = 'Unable to load session.';
  }

  container.replaceChildren(page);
}
