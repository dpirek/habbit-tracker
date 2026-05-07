export default async function renderHomePage(container, router) {
  if (!container) {
    return;
  }

  const page = document.createElement('section');
  page.className = 'auth-page';

  const card = document.createElement('div');
  card.className = 'auth-card';

  const title = document.createElement('h1');
  title.className = 'auth-title';
  title.textContent = 'Lively Habit Tracker';

  const subtitle = document.createElement('p');
  subtitle.className = 'auth-subtitle';
  subtitle.textContent = 'Create habits, track progress, and keep your streak alive.';

  const actions = document.createElement('div');
  actions.className = 'auth-actions';

  const loginButton = document.createElement('button');
  loginButton.type = 'button';
  loginButton.className = 'auth-button';
  loginButton.textContent = 'Login';
  loginButton.addEventListener('click', () => router?.navigate('/login'));

  const registerButton = document.createElement('button');
  registerButton.type = 'button';
  registerButton.className = 'auth-link-button';
  registerButton.textContent = 'Register';
  registerButton.addEventListener('click', () => router?.navigate('/register'));

  actions.append(loginButton, registerButton);
  card.append(title, subtitle, actions);
  page.append(card);
  container.replaceChildren(page);
}
