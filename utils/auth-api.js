const { parseBody } = require('./response');
const { login, logout, getUserFromRequest } = require('./auth');

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

function sendItem(res, statusCode, data, error = '') {
  sendJson(res, statusCode, {
    data,
    error,
    statusCode,
  });
}

function sendError(res, statusCode, error) {
  sendJson(res, statusCode, { error });
}

function getDbClients() {
  try {
    // Lazy load to avoid crashing server startup when env vars are absent.
    return require('./db-client');
  } catch (error) {
    return null;
  }
}

async function findChildByUsername(supabase, username) {
  const normalized = String(username || '').trim();
  if (!normalized) {
    return null;
  }

  let response = await supabase
    .from('children')
    .select('*')
    .eq('username', normalized)
    .limit(1);

  if (response.error || !Array.isArray(response.data) || response.data.length === 0) {
    response = await supabase
      .from('children')
      .select('*')
      .ilike('username', normalized)
      .limit(1);
  }

  if (response.error || !Array.isArray(response.data) || response.data.length === 0) {
    return null;
  }

  return response.data[0];
}

function getChildPinValue(child) {
  const pinKeys = ['pin', 'login_pin', 'passcode', 'login_code', 'code'];
  for (const key of pinKeys) {
    const value = child?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return null;
}

async function verifyChildPinViaCodesTable(supabase, child, pin) {
  const childId = child?.id;
  if (!childId) {
    return false;
  }

  const childIdColumns = ['child_id', 'children_id', 'child'];
  const codeColumns = ['code', 'pin', 'login_code', 'passcode'];

  for (const childIdColumn of childIdColumns) {
    for (const codeColumn of codeColumns) {
      const { data, error } = await supabase
        .from('child_login_codes')
        .select('*')
        .eq(childIdColumn, childId)
        .eq(codeColumn, String(pin))
        .limit(1);

      if (!error && Array.isArray(data) && data.length > 0) {
        return true;
      }
    }
  }

  return false;
}

async function signInChild(supabase, username, pin) {
  const child = await findChildByUsername(supabase, username);
  if (!child) {
    return { error: 'Invalid username or PIN.' };
  }

  const directPin = getChildPinValue(child);
  const providedPin = String(pin || '').trim();
  if (directPin && directPin === providedPin) {
    return { child };
  }

  const validFromCodes = await verifyChildPinViaCodesTable(supabase, child, providedPin);
  if (validFromCodes) {
    return { child };
  }

  return { error: 'Invalid username or PIN.' };
}

async function handleSignUp(req, res, supabase) {
  const body = await parseBody(req);
  const email = body?.email;
  const password = body?.password;
  const metadata = body?.metadata || {};

  if (!email || !password) {
    return sendError(res, 400, 'email and password are required.');
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: metadata },
  });

  if (error) {
    return sendError(res, 400, error.message || 'Sign-up failed.');
  }

  const user = data?.user || null;
  if (user?.email) {
    login(res, user.email, 'user');
  }

  return sendItem(res, 200, data);
}

async function handleSignIn(req, res, supabase) {
  const body = await parseBody(req);

  if (body?.username && body?.pin !== undefined) {
    const result = await signInChild(supabase, body.username, body.pin);
    if (result.error) {
      return sendError(res, 401, result.error);
    }

    const child = result.child;
    login(res, child.username || String(body.username), 'child');
    return sendItem(res, 200, {
      user: {
        id: child.id || null,
        username: child.username || String(body.username),
        role: 'child',
      },
      session: null,
    });
  }

  const email = body?.email;
  const password = body?.password;
  if (!email || !password) {
    return sendError(res, 400, 'email/password or username/pin are required.');
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data?.user) {
    return sendError(res, 401, (error && error.message) || 'Unauthorized.');
  }

  login(res, data.user.email || email, 'user');
  return sendItem(res, 200, data);
}

function handleSignOut(req, res) {
  const user = getUserFromRequest(req);
  if (!user) {
    return sendError(res, 401, 'Unauthorized.');
  }

  logout(res);
  return sendItem(res, 200, { signedOut: true });
}

function handleAuthUser(req, res) {
  const user = getUserFromRequest(req);
  if (!user) {
    return sendError(res, 401, 'Unauthorized.');
  }
  return sendItem(res, 200, user);
}

async function handleRefresh(req, res, supabase) {
  const body = await parseBody(req);
  const refreshToken = body?.refresh_token;
  if (!refreshToken) {
    return sendError(res, 400, 'refresh_token is required.');
  }

  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: refreshToken,
  });

  if (error || !data?.user) {
    return sendError(res, 401, (error && error.message) || 'Unauthorized.');
  }

  login(res, data.user.email || data.user.id, 'user');
  return sendItem(res, 200, data);
}

async function handleChildByUsername(res, supabase, username) {
  const child = await findChildByUsername(supabase, username);
  if (!child) {
    return sendError(res, 404, 'Resource not found.');
  }
  return sendItem(res, 200, child);
}

async function handleAuthApi(req, res, url) {
  try {
    const pathname = url.pathname;
    if (pathname === '/api/auth/sign-out' && req.method === 'POST') {
      return handleSignOut(req, res);
    }
    if (pathname === '/api/auth/user' && req.method === 'GET') {
      return handleAuthUser(req, res);
    }

    const needsSupabase =
      (pathname === '/api/auth/sign-up' && req.method === 'POST')
      || (pathname === '/api/auth/sign-in' && req.method === 'POST')
      || (pathname === '/api/auth/refresh' && req.method === 'POST')
      || (/^\/api\/children\/username\/[^/]+$/.test(pathname) && req.method === 'GET');

    if (!needsSupabase) {
      return false;
    }

    const clients = getDbClients();
    if (!clients?.supabase) {
      return sendError(res, 500, 'Auth backend is not configured.');
    }
    const { supabase } = clients;

    if (pathname === '/api/auth/sign-up' && req.method === 'POST') {
      return handleSignUp(req, res, supabase);
    }
    if (pathname === '/api/auth/sign-in' && req.method === 'POST') {
      return handleSignIn(req, res, supabase);
    }
    if (pathname === '/api/auth/refresh' && req.method === 'POST') {
      return handleRefresh(req, res, supabase);
    }

    const childByUsername = pathname.match(/^\/api\/children\/username\/([^/]+)$/);
    if (childByUsername && req.method === 'GET') {
      const username = decodeURIComponent(childByUsername[1]);
      return handleChildByUsername(res, supabase, username);
    }

    return false;
  } catch (error) {
    if (error && error.message === 'Invalid JSON') {
      return sendError(res, 400, 'Bad request.');
    }
    return sendError(res, 500, 'Internal server error.');
  }
}

module.exports = {
  handleAuthApi,
};
