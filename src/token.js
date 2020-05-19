const { promises: fs, constants: { F_OK } } = require('fs');
const moment = require('moment');
const rp = require('request-promise');
const debug = require('debug');

const info = debug('tdauth');

async function exists(file) {
  try {
    await fs.access(file, F_OK);
    return true;
  } catch (err) {
    return false;
  }
}

function willExpireSoon(tokenExpiry) {
  // get new token if current will expire within 30 seconds from now
  return moment().unix() >= (tokenExpiry - 30);
}

async function refreshToken(clientId, rt) {
  const options = {
    url: 'https://api.tdameritrade.com/v1/oauth2/token',
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    json: true,
    form: {
      grant_type: 'refresh_token',
      refresh_token: rt,
      client_id: clientId,
      access_type: 'offline',
    },
  };
  const data = await rp(options);
  data.now = moment().unix();
  await fs.writeFile('./.tdsecrets', JSON.stringify(data, null, 2));
  return data.access_token;
}

async function token(appkeyparam) {
  const appkey = appkeyparam || process.env.TDAUTH_APPKEY;
  if (!appkey) {
    throw new Error('app key must be passed into token function or set as TDAUTH_APPKEY environment variable');
  }

  const clientId = `${appkey}@AMER.OAUTHAP`;
  const filename = `${__dirname}/.tdsecrets`;

  // try to read tdsecrets, fail if unable
  if (!(await exists(filename))) {
    throw new Error('td-ameritrade-auth must be initialized before use. see `init` in the documentation');
  }
  const rawSecrets = await fs.readFile(filename);
  const secrets = JSON.parse(rawSecrets);

  // if token not close to expiration, return token
  const isTokenStale = willExpireSoon(secrets.expires_in + secrets.now);
  if (!isTokenStale) {
    info('token is fresh, serving as is');
    return secrets.access_token;
  }

  // if token near expiration and refresh not, refresh then return
  const isRefreshTokenStale = willExpireSoon(secrets.refresh_token_expires_in + secrets.now);
  if (!isRefreshTokenStale) {
    info('token is stale, fetching refresh token');
    return refreshToken(clientId, secrets.refresh_token);
  }

  // if token near expiratikon and refresh near expiration, pls re-init
  throw new Error('access and refresh tokens have both expired. please re-initialize the library');
}

module.exports = token;
