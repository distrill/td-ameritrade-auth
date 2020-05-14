const { promises: fs } = require('fs');
const ngrok = require('ngrok');
const express = require('express');
const rp = require('request-promise');
const moment = require('moment');

const port = 2828;

async function init(appkeyparam) {
  const appkey = appkeyparam || process.env.TDAUTH_APPKEY;
  if (!appkey) {
    throw new Error('app key must be passed into init function or set as TDAUTH_APPKEY environment variable');
  }

  const clientId = `${appkey}@AMER.OAUTHAP`;

  const url = await ngrok.connect({
    addr: port,
  });
  const callbackUrl = `${url}/cb`;

  const app = express();
  app.get('/cb', async (req, res, next) => {
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
      await fs.writeFile('./.tdsecrets', JSON.stringify(data, null, 2));
      return res.json({ ok: 'ok', data });
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
    app.listen(port, (err) => {
      if (err) {
        reject(err);
        return;
      }

      console.log(`
        Navigate to your app settings in TD Ameritrade and set the callback url to ${callbackUrl}.


        Apps:           https://developer.tdameritrade.com/user/me/apps
        Callback URL:   ${callbackUrl}
       

        Once the app has been configured, navigate to the following address to authenticate your application:
        https://auth.tdameritrade.com/auth?response_type=code&redirect_uri=${encodeURI(callbackUrl)}&client_id=${encodeURI(clientId)}
      `);
    });
  });
}

module.exports = init;
