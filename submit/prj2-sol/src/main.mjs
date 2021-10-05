import { readJson } from 'cs544-node-utils';

import Path from 'path';

import { makeAccountsServices, help } from './accounts-services.mjs';
import makeAccountsDao from './accounts-dao.mjs';

/************************* Top level routine ***************************/

export default async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) usage();
  const doClear = args[0] === '-c';
  if (doClear) args.shift();
  let dao;
  try {
    dao = await makeAccountsDao(args[0], { doClear, });
    if (dao.errors) { errors(dao); return; }
    const service = makeAccountsServices(dao);
    await processCommand(service, args[1], args.slice(2));
  }
  finally {
    if (dao && !dao.errors) await dao.close();
  }
}

function usage() {
  console.error(`usage: ${Path.basename(process.argv[1])} [-c] ` +
		`ACCOUNTS_DB_URL CMD [ARG=VALUE]...`);
  const sp = ' '.repeat(4);
  console.error(`  for CMD, ARG=VALUE in\n${sp}` +
		help().replace(/\n/g, `\n${sp}`));
  process.exit(1);
}

async function processCommand(accounts, cmd, args) {
  const camelCmd = cmd.replace(/\-[a-z]/g, s => s[1].toUpperCase());
  if (!accounts[camelCmd]) usage();
  if (camelCmd === 'help') { console.log(accounts.help(args[0])); return; }
  const argPairs = args.map(arg => {
    const [ _, k, v ] = arg.match(/^(\w+)=(.+)$/) ?? [];
    return [k, v];
  });
  const params = Object.fromEntries(argPairs);
  const ret = await accounts[camelCmd].call(accounts, params);
  if (ret.errors) {
    errors(ret);
    console.error('usage:', help(camelCmd));
  }
  else {
    console.log(ret);
  }
}

function errors(result) {
  for (const err of result.errors) {
    console.error(err.message ?? err.toString());
  }
}

