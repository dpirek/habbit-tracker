export default function renderLoginPage(container, router) {
  if (!container) return;

  const page = document.createElement('section');
  page.className = 'auth-page login-page';

  const card = document.createElement('div');
  card.className = 'auth-card login-card';

  const logo = document.createElement('img');
  logo.className = 'login-logo';
  logo.src = '/images/logo.svg';
  logo.alt = 'Habbit Tracker logo';

  const title = document.createElement('h1');
  title.className = 'auth-title login-title';
  title.textContent = 'Welcome back';

  const subtitle = document.createElement('p');
  subtitle.className = 'auth-subtitle login-subtitle';
  subtitle.textContent = 'Track your streaks and keep momentum.';

  const form = document.createElement('form');
  form.className = 'auth-form login-form';

  const idLabel = document.createElement('label');
  idLabel.className = 'auth-label login-label';
  idLabel.textContent = 'Username or Email';

  const identifier = document.createElement('input');
  identifier.className = 'auth-input login-input';
  identifier.name = 'identifier';
  identifier.placeholder = 'alex@example.com';
  identifier.required = true;

  const passLabel = document.createElement('label');
  passLabel.className = 'auth-label login-label';
  passLabel.textContent = 'Password';

  const password = document.createElement('input');
  password.className = 'auth-input login-input';
  password.name = 'password';
  password.type = 'password';
  password.placeholder = '••••••••';
  password.required = true;

  const status = document.createElement('p');
  status.className = 'auth-status login-status';

  const submit = document.createElement('button');
  submit.className = 'auth-button login-submit';
  submit.type = 'submit';
  submit.textContent = 'Sign in';

  const switchLink = document.createElement('button');
  switchLink.type = 'button';
  switchLink.className = 'auth-link-button login-switch';
  switchLink.textContent = 'Create account';
  switchLink.addEventListener('click', () => router?.navigate('/register'));

  form.append(idLabel, identifier, passLabel, password, submit, status);
  card.append(logo, title, subtitle, form, switchLink);
  page.append(card);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    status.textContent = '';

    const rawIdentifier = identifier.value.trim();
    const payload = rawIdentifier.includes('@')
      ? { email: rawIdentifier, password_hash: password.value }
      : { username: rawIdentifier, password_hash: password.value };

    try {
      const response = await fetch('/api/auth/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (!response.ok) {
        status.textContent = result?.error || 'Login failed';
        status.dataset.error = 'true';
        return;
      }

      status.textContent = 'Login successful';
      status.dataset.error = 'false';
      setTimeout(() => router?.navigate('/home'), 250);
    } catch (_) {
      status.textContent = 'Network error';
      status.dataset.error = 'true';
    }
  });

  container.replaceChildren(page);
}
