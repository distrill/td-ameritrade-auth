#!/usr/bin/env node

const { program } = require('commander');
const { version } = require('../package.json');
const init = require('../src/init');
const token = require('../src/token');

function verifyKey(action) {
  return (cmd) => {
    const key = cmd.parent.key || process.env.TDAUTH_APPKEY;
    if (!key) {
      return Promise.reject(
        new Error('app key must be provided as an argument or set as TDAUTH_APPKEY environment variable'),
      );
    }
    return action(key);
  };
}

const initAction = verifyKey(init);
const tokenAction = (cmd) => verifyKey(token)(cmd).then(console.log);

async function run() {
  program.version(version);
  program.option('-k, --key <key>', 'td ameritrade app key');

  program
    .command('init')
    .description('initialize library by going through oauth flow in your browser')
    .action(initAction);

  program
    .command('token')
    .description('print a valid token')
    .action(tokenAction);

  await program.parseAsync(process.argv);
}

run().catch((err) => console.log(err));
