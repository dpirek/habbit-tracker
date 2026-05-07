export default async function renderHomePage(container, router) {
  if (!container) return;

  const page = document.createElement('section');
  page.className = 'auth-page landing-page';

  const shell = document.createElement('div');
  shell.className = 'landing-shell';

  const hero = document.createElement('header');
  hero.className = 'landing-hero';

  const badge = document.createElement('p');
  badge.className = 'landing-badge';
  badge.textContent = 'Habit Tracker';

  const title = document.createElement('h1');
  title.className = 'landing-title';
  title.textContent = 'Build better habits, one day at a time.';

  const subtitle = document.createElement('p');
  subtitle.className = 'landing-subtitle';
  subtitle.textContent = 'Stay consistent with guided templates, progress insights, and streak-focused tracking.';

  const actions = document.createElement('div');
  actions.className = 'landing-actions';

  const loginButton = document.createElement('button');
  loginButton.type = 'button';
  loginButton.className = 'auth-button landing-primary';
  loginButton.textContent = 'Sign in';
  loginButton.addEventListener('click', () => router?.navigate('/login'));

  const registerButton = document.createElement('button');
  registerButton.type = 'button';
  registerButton.className = 'auth-link-button landing-secondary';
  registerButton.textContent = 'Create Account';
  registerButton.addEventListener('click', () => router?.navigate('/register'));

  actions.append(loginButton, registerButton);

  const benefits = document.createElement('section');
  benefits.className = 'landing-benefits';

  const benefitData = [
    {
      title: 'Smart Templates',
      body: 'Start instantly with curated habits like hydration, reading, and exercise.'
    },
    {
      title: 'Daily Progress',
      body: 'See what is done today with clear visual progress bars and streak signals.'
    },
    {
      title: 'Calendar View',
      body: 'Track consistency over time with highlighted completion days in your monthly calendar.'
    },
    {
      title: 'Progress Insights',
      body: 'Understand your completion trends and strongest habits with weekly analytics.'
    }
  ];

  benefitData.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'landing-benefit-card';
    const h3 = document.createElement('h3');
    h3.className = 'landing-benefit-title';
    h3.textContent = item.title;
    const p = document.createElement('p');
    p.className = 'landing-benefit-text';
    p.textContent = item.body;
    card.append(h3, p);
    benefits.append(card);
  });

  const cta = document.createElement('section');
  cta.className = 'landing-cta';
  const ctaTitle = document.createElement('h2');
  ctaTitle.className = 'landing-cta-title';
  ctaTitle.textContent = 'Small steps. Big change.';
  const ctaText = document.createElement('p');
  ctaText.className = 'landing-cta-text';
  ctaText.textContent = 'Join now and turn your routine into momentum.';
  const ctaButton = document.createElement('button');
  ctaButton.type = 'button';
  ctaButton.className = 'auth-button landing-primary';
  ctaButton.textContent = 'Start tracking today';
  ctaButton.addEventListener('click', () => router?.navigate('/register'));
  cta.append(ctaTitle, ctaText, ctaButton);

  hero.append(badge, title, subtitle, actions);
  shell.append(hero, benefits, cta);
  page.append(shell);
  container.replaceChildren(page);
}
