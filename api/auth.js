import { notAuthorizedJson, parseBody, respondJson } from '../utils/response.js';
import { getUserFromRequest, login, logout } from '../utils/auth.js';

async function signIn(req, res) {
  let username = 'child';
  let role = 'child';
  const id = 'mock-child-id';
  try {
    const body = await parseBody(req);
    if (body && typeof body.username === 'string' && body.username.trim() !== '') {
      username = body.username.trim();
    } else if (body && typeof body.email === 'string' && body.email.trim() !== '') {
      username = body.email.trim();
      role = 'user';
    }
  } catch (_) {
    // Ignore invalid JSON in mock mode and still return success.
  }

  login(res, username, role);
  return respondJson(res, {
    data: {
      user: {
        id,
        username,
        role
      },
      session: null
    },
    error: '',
    statusCode: 200
  });
}

function signOut(res) {
  logout(res);
  return respondJson(res, {
    data: { signedOut: true },
    error: '',
    statusCode: 200
  });
}

function getAuthUser(req, res) {

  // return respondJson(res, {
  //   "data": {
  //         "username": "brady",
  //         "role": "child",
  //         "date": "2026-05-01T13:16:56.221Z"
  //     },
  //     "error": "",
  //     "statusCode": 200
  // });

  const authUser = getUserFromRequest(req);
  if (!authUser) {
    return notAuthorizedJson(res);
  }

  return respondJson(res, {
    data: authUser,
    error: '',
    statusCode: 200
  });
}

function getCurrentAuthSession(req, res) {
  // return respondJson(res, {
  //   "data": {
  //         "username": "brady",
  //         "role": "child",
  //         "date": "2026-05-01T13:16:56.221Z"
  //     },
  //     "error": "",
  //     "statusCode": 200
  // });
  const authUser = getUserFromRequest(req);
  if (!authUser) {
    return notAuthorizedJson(res);
  }

  return respondJson(res, {
    data: authUser,
    error: '',
    statusCode: 200
  });
}

export {
  signIn,
  signOut,
  getAuthUser,
  getCurrentAuthSession
};
