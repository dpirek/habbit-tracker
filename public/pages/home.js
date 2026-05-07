export default async function renderHomePage(container, router) {
  if (!container) return;

  const page = document.createElement('section');
  page.className = 'auth-page landing-page';

  const shell = document.createElement('div');
  shell.className = 'landing-shell-v2';

  const top = document.createElement('header');
  top.className = 'landing-topbar';
  top.innerHTML = ``;

  const pill = document.createElement('p');
  pill.className = 'landing-pill';
  pill.textContent = '✨ Build habits. Track progress.';

  const title = document.createElement('h1');
  title.className = 'landing-title-v2';
  title.innerHTML = 'Small steps today,<br><span>big change</span><br>tomorrow.';

  const subtitle = document.createElement('p');
  subtitle.className = 'landing-subtitle-v2';
  subtitle.textContent = 'Habitly helps you build better habits, stay consistent, and become the best version of yourself.';

  const ctas = document.createElement('div');
  ctas.className = 'landing-cta-stack';
  const primary = document.createElement('button');
  primary.type = 'button';
  primary.className = 'auth-button landing-cta-primary';
  primary.textContent = 'Get Started Free';
  primary.addEventListener('click', () => router?.navigate('/register'));
  const secondary = document.createElement('button');
  secondary.type = 'button';
  secondary.className = 'auth-link-button landing-cta-secondary';
  secondary.textContent = '▶  See How It Works';
  secondary.addEventListener('click', () => router?.navigate('/login'));
  ctas.append(primary, secondary);

  const social = document.createElement('section');
  social.className = 'landing-social';
  social.innerHTML = `
    <div class="landing-avatars">
      <span></span><span></span><span></span><span></span><span></span>
    </div>
    <div>
      <p class="landing-stars">★★★★★</p>
      <p class="landing-users">Join 50,000+ users building better habits</p>
    </div>
  `;

  const preview = document.createElement('section');
  preview.className = 'landing-preview';
  preview.innerHTML = `
    <div class="landing-preview-head">Good morning, Alex! ☀️</div>
    <p class="landing-preview-sub">Keep going, you're doing great.</p>
    <div class="landing-preview-days">
      <span>✓</span><span>✓</span><span>✓</span><span class="active">4</span><span>5</span><span>6</span><span>7</span>
    </div>
    <h3 class="landing-preview-title">Today's Habits</h3>
    <div class="landing-preview-card">
      <span class="landing-preview-icon">🥤</span>
      <div>
        <p>Drink Water</p>
        <small>8 glasses a day</small>
      </div>
      <strong>6/8</strong>
    </div>
    <div class="landing-preview-nav">
      <span class="active">Today</span><span>Habits</span><span class="plus">+</span><span>Stats</span><span>Profile</span>
    </div>
  `;

  shell.append(top, pill, title, subtitle, ctas, social, preview);
  page.append(shell);
  container.replaceChildren(page);
}
