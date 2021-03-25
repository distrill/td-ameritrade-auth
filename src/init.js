const fs = require('fs');
const { promises: pfs } = require('fs');
const https = require('https');
const privateKey = fs.readFileSync('server.key', 'utf8');
const certificate = fs.readFileSync('server.crt', 'utf8');
const credentials = { key: privateKey, cert: certificate };
const express = require('express');
const rp = require('request-promise');
const moment = require('moment');
const { secretsfile } = require('./constants');
const Open = require('open');

// Choose the port you would like to use for your server
const port = 2828;
const callbackUrl = `https://localhost:` + port;

const eventsSharedBuffer = new SharedArrayBuffer(4); // we only a single event.  Automatically initialized to 0 by constructor.
const events = new Int32Array(eventsSharedBuffer);

var clientId;

async function login(appkeyparam) {
    console.log("No token available.  Requesting one from user.")

    await Open(`https://auth.tdameritrade.com/auth?response_type=code&redirect_uri=${encodeURI(callbackUrl)}&client_id=${encodeURI(clientId)}`)

    console.log(`
Opening browser for login and awaiting connection from TD Ameritrade...

If you get an error in your browers, you have not yet created an app in your TD Ameritrade Developer account:

Login to your developer account here: https://developer.tdameritrade.com/
            Then, create an app here: https://developer.tdameritrade.com/user/me/apps
          ...using this callback URL: ${callbackUrl}
        `);
    // Don't block the message thread --- keep 
    while (Atomics.load(events, 0) == 0) await new Promise(resolve => setTimeout(resolve, 100));
}

async function init(appkeyparam) {
  const appkey = appkeyparam || process.env.TDAUTH_APPKEY;
  if (!appkey) {
    throw new Error('app key must be passed into init function or set as TDAUTH_APPKEY environment variable');
  }

    clientId = `${appkey}@AMER.OAUTHAP`;

  const app = express();
  app.get('/', async (req, res, next) => {
    try {
      const { code } = req.query;
      const options = {
        url: 'https://api.tdameritrade.com/v1/oauth2/token',
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        json: true,
        form: {
          grant_type: 'authorization_code',
          access_type: 'offline',
          code,
          client_id: clientId,
          redirect_uri: callbackUrl,
        },
      };
      const data = await rp(options);
      data.now = moment().unix();
            await pfs.writeFile(secretsfile, JSON.stringify(data, null, 2));
            res.send('Your key has been recorded and you may now close this window.');
            console.log("notifying");
            Atomics.store(events, 0, 1);
            Atomics.notify(events, 0, 1);
    } catch (err) {
      return next(err);
    }
  });

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.log({ err });
    return res.json({ err });
  });

  return new Promise((resolve, reject) => {
        httpsServer=https.createServer(credentials, app);
        httpsServer.listen(port, (err) => {
            if (err) {
                reject(err);
                return;
            }
        });
        resolve();
    });
}

module.exports = { init, login };
