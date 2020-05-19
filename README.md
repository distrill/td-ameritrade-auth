# td-ameritrade-auth

Authentication for td ameritrade api made easy.   
Initialize once and then reuse the library to get fresh tokens as needed.  

### Initialization  
Initialilaztion is needed to obtain the initial access token. Once this is obtained, it is stored alongside the refresh token. The library will return the access token as long as it's fresh, and will obtain a new one when it becomes stale.  

Initialization is exposed through a cli as well as an api.   

cli:
``` bash
td-ameritrade-auth init --key=<your-td-app-key>
```

api:
``` javascript
const { init } = require('td-ameritrade-auth');

init(<your-td-app-key>)
  .then(() => console.log('done!'))
  .catch((err) => console.log(err));
```

Either way, text will output guiding you through the rest of the process.  
1. copy the callback url link generated on app boot
2. update your app in td ameritrade's web ui to accept the callback url generated on app boot
3. click on the link generated on app boot to login and authorize your app

Your access_token, along with refresh_token and expiration times, will be stored in `node_modules/td-ameritrade-auth/src/.tdsecrets`.

### Get Token  
Once the library has been initialized, it has what it needs to retreive a fresh token. Tokens from TD Ameritrade are valid for 30 minutes only, so the token must be refreshed within that timeframe to avoid outages. 

cli:
``` bash
td-ameritrade-auth token --key=<your-td-app-key>
```

bash:
``` javascript
const { getToken } = require('td-ameritrade-auth');

(async () => {
  const token = await getToken('<your-td-app-key>');
})()
```

### App Key
Your app key is referred to in a number of different ways throughout the TD Ameritrade docs. I have tried to keep it consistent in the code base here as well as the docs.  
The docs call it a consumer key, an oauth user id, an api key. For the purposes of this project is considered an app key.

That being said, each function optionally accepts the app key as a function parameter, but it call also be exposed as an environment variabe `TDAUTH_APPKEY`.
