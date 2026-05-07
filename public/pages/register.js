export default function renderRegisterPage(container, router) {
  if (!container) return;

  const page = document.createElement('section');
  page.className = 'auth-page';

  const card = document.createElement('div');
  card.className = 'auth-card';

  const title = document.createElement('h1');
  title.className = 'auth-title';
  title.textContent = 'Create Account';

  const subtitle = document.createElement('p');
  subtitle.className = 'auth-subtitle';
  subtitle.textContent = 'Start with one habit. Build your streak daily.';

  const form = document.createElement('form');
  form.className = 'auth-form';

  const usernameLabel = document.createElement('label');
  usernameLabel.className = 'auth-label';
  usernameLabel.textContent = 'Username';

  const username = document.createElement('input');
  username.className = 'auth-input';
  username.name = 'username';
  username.required = true;

  const emailLabel = document.createElement('label');
  emailLabel.className = 'auth-label';
  emailLabel.textContent = 'Email';

  const email = document.createElement('input');
  email.className = 'auth-input';
  email.type = 'email';
  email.name = 'email';
  email.required = true;

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
  submit.textContent = 'Create account';

  const switchLink = document.createElement('button');
  switchLink.type = 'button';
  switchLink.className = 'auth-link-button';
  switchLink.textContent = 'Already have an account? Login';
  switchLink.addEventListener('click', () => router?.navigate('/login'));

  form.append(usernameLabel, username, emailLabel, email, passLabel, password, submit, status);
  card.append(title, subtitle, form, switchLink);
  page.append(card);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    status.textContent = '';

    const payload = {
      username: username.value.trim(),
      email: email.value.trim(),
      password_hash: password.value
    };

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (!response.ok) {
        status.textContent = result?.error || 'Registration failed';
        status.dataset.error = 'true';
        return;
      }

      status.textContent = 'Account created. Redirecting to login...';
      status.dataset.error = 'false';
      setTimeout(() => router?.navigate('/login'), 450);
    } catch (_) {
      status.textContent = 'Network error';
      status.dataset.error = 'true';
    }
  });

  container.replaceChildren(page);
}
