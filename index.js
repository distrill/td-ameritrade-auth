const init = require('./src/init');

module.exports = { init };

init()
  .then(() => console.log('done!'))
  .catch((err) => console.log(err));
