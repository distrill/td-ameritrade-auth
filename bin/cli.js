#!/usr/bin/env node

const { program } = require('commander');
const { version } = require('../package.json');
const init = require('../src/init');

const action = (cmd) => {
  const key = cmd.parent.key || process.env.TDAUTH_APPKEY;
  if (!key) {
    throw new Error('app key must be provided as an argument or set as TDAUTH_APPKEY environment variable');
  }
  return init(cmd.parent.key);
};

async function run() {
  program.version(version);
  program.option('-k, --key <key>', 'td ameritrade app key');
  program
    .command('init')
    .description('initialize library by going through oauth flow in your browser')
    .action(action);
  await program.parseAsync(process.argv);
}

run().catch((err) => console.log(err));
