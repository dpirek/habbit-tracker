export default function renderLoginPage(container, router) {
  if (!container) return;

  const page = document.createElement('section');
  page.className = 'auth-page';

  const card = document.createElement('div');
  card.className = 'auth-card';

  const title = document.createElement('h1');
  title.className = 'auth-title';
  title.textContent = 'Welcome Back';

  const subtitle = document.createElement('p');
  subtitle.className = 'auth-subtitle';
  subtitle.textContent = 'Track your streaks and keep momentum.';

  const form = document.createElement('form');
  form.className = 'auth-form';

  const idLabel = document.createElement('label');
  idLabel.className = 'auth-label';
  idLabel.textContent = 'Username or Email';

  const identifier = document.createElement('input');
  identifier.className = 'auth-input';
  identifier.name = 'identifier';
  identifier.required = true;

  const passLabel = document.createElement('label');
  passLabel.className = 'auth-label';
  passLabel.textContent = 'Password';

  const password = document.createElement('input');
  password.className = 'auth-input';
  password.name = 'password';
  password.type = 'password';
  password.required = true;

  const status = document.createElement('p');
  status.className = 'auth-status';

  const submit = document.createElement('button');
  submit.className = 'auth-button';
  submit.type = 'submit';
  submit.textContent = 'Login';

  const switchLink = document.createElement('button');
  switchLink.type = 'button';
  switchLink.className = 'auth-link-button';
  switchLink.textContent = 'Create account';
  switchLink.addEventListener('click', () => router?.navigate('/register'));

  form.append(idLabel, identifier, passLabel, password, submit, status);
  card.append(title, subtitle, form, switchLink);
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
