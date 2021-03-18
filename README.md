# td-ameritrade-auth

Authentication for td ameritrade api made easy.   
Initialize once and then reuse the library to get fresh tokens as needed.  

### Configuration
You must have a developer account with TD Ameritrade (which is free) and you must have created an app.  The instructions for doing this will print the first
time you attempt run the software.

The default port used by the library is 2828.  You may change this in the init.js file.

Before using the library, you must generate a .key and .crt pair for the HTTPS server.  To do this, you must have one of the many SLL implementations installed.
Install OpenSSL (or equivalent) if you do not already an sn SSL implementation.

Then in the main folder, execute:

    openssl genrsa 2048 > server.key
    chmod 400 host.key # not needed on windows
    openssl req -new -x509 -nodes -sha256 -key server.key -out server.crt

Answer he questions asked and your pair should be created.


### Declarations 
``` javascript

const { init } = require('td-ameritrade-auth');
const { getToken } = require('td-ameritrade-auth');
```

### Initialization  

api:
``` javascript

await init('8U4VN7I02WNZSL802BYX2PLU86T1LSJPK')  // Sample is meaningless: replace with your APP_ID
  .then(() => console.log('Token server started'))
  .catch((err) => console.log(err));
```

Initialization is needed to start the HTTPS server.  Do so near the start of your program.

### Get Token  

api:
``` javascript

await getToken('8U4VN7I02WNZSL802BYX2PLU86T1LSJPK')  // Sample is meaningless: replace with your APP_ID
  .then(() => console.log('Got token!'))
  .catch((err) => console.log(err));
```

Call this when you need to use a token.   Tokens from TD Ameritrade are valid for 30 minutes only, so the token must be refreshed within that timeframe to avoid outages.  Refresh tokens are valid for 90 days, after which you must log in again.

If the refresh token is expired or you have not yet downloaded a refresh token, instructions will be displayed and the browser will automatically launch.  You must authorize the retrieval of the refresh token by logging into your TD Ameritrade trading account (not your developer account.)

Overview:
1. copy the callback url link generated on app boot (defaults to https://localhost:2828)
2. update your app in td ameritrade's developer web site to accept the callback url in step 1.

If you have not yet generated your app, re-run your program to launch to the correct page.

Once your access token is obtained, it is stored alongside the refresh token. The library will return the access token as long as it's fresh, and will obtain a new one when it becomes stale.  

Your access_token, along with refresh_token and expiration times, will be stored in `node_modules/td-ameritrade-auth/src/.tdsecrets`.


### App Key
Your app key is referred to in a number of different ways throughout the TD Ameritrade docs. I have tried to keep it consistent in the code base here as well as the docs.  
The docs call it a consumer key, an oauth user id, an api key. For the purposes of this project is considered an app key.

The app key will look like this: 8U4VN7I02WNZSL802BYX2PLU86T1LSJPK

That being said, each function optionally accepts the app key as a function parameter, but it call also be exposed as an environment variabe `TDAUTH_APPKEY`.