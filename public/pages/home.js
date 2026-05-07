export default async function renderHomePage(container, router) {
  if (!container) {
    return;
  }

  const page = document.createElement('section');
  Object.assign(page.style, {
    minHeight: '100%',
    width: '100%',
    display: 'grid',
    placeItems: 'center',
    padding: '24px',
    boxSizing: 'border-box'
  });

  const card = document.createElement('div');
  Object.assign(card.style, {
    width: 'min(520px, 100%)',
    padding: '24px',
    borderRadius: '16px',
    border: '1px solid #0d2a40',
    background: '#ffffff',
    display: 'grid',
    gap: '12px',
    textAlign: 'center'
  });

  const title = document.createElement('h1');
  title.textContent = 'Lively Habbit Tracker';
  Object.assign(title.style, {
    margin: '0',
    fontSize: '34px',
    lineHeight: '1.15',
    color: '#0d2a40'
  });

  const subtitle = document.createElement('p');
  subtitle.textContent = 'Home page placeholder';
  Object.assign(subtitle.style, {
    margin: '0',
    color: '#31546d',
    fontSize: '16px'
  });

  const loginButton = document.createElement('button');
  loginButton.type = 'button';
  loginButton.textContent = 'Go to Login';
  Object.assign(loginButton.style, {
    justifySelf: 'center',
    marginTop: '6px',
    minWidth: '148px',
    height: '42px',
    borderRadius: '999px',
    border: '1px solid #0d2a40',
    background: '#f9cf20',
    color: '#0d2a40',
    fontSize: '15px',
    cursor: 'pointer'
  });

  loginButton.addEventListener('click', () => {
    if (router) {
      router.navigate('/login');
    }
  });

  card.append(title, subtitle, loginButton);
  page.append(card);
  container.replaceChildren(page);
}
