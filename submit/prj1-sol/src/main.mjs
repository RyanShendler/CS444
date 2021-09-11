import readline from 'readline';

import { readJson } from 'cs544-node-utils';

import makeAccounts from './accounts.mjs';


export default async function main() {
  const args = process.argv.slice(2);
  const accounts = makeAccounts();
  await loadInitData(args, accounts);
  await repl(accounts);
}

async function loadInitData(filePaths, accounts) {
  for (const path of filePaths) {
    const cmds = await readJson(path);
    if (cmds.errors) {
      errors(cmds);
    }
    else {
      for (const cmd of cmds) doCmd(accounts, cmd);
    }
  }
}

const PROMPT = '>> ';

async function repl(accounts) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false, //no ANSI terminal escapes
    prompt: PROMPT,
  });  
  rl.on('line', async (line) => await doLine(accounts, line, rl));
  help();
  rl.prompt();
}


//handler for a line
async function doLine(accounts, line, rl) {
  line = line.trim();
  if (line.length > 0) {
    const [cmd, args] = parseLine(line);
    let results = {};
    if (cmd) {
      if (cmd === 'help') {
	help();
      }
      else if (cmd === 'new-account') {
	results = accounts.newAccount(args);
      }
      else {
	const fn = cmd.replace(/\-[a-z]/g, s => s[1].toUpperCase());
	const account = accounts.account(args);
	if (account.errors) {
	  results = account;
	}
	else {
	  results =  account[fn].call(account, args);
	}
      }
      if (results.errors) { 
	errors(results);
      }
      else {
	console.log(JSON.stringify(results, null, 2));
      }
    }
  }
  rl.prompt();
}

const DEFAULT_COUNT = 5;
const CMDS = {
  account: `
    account id=ACCOUNT_ID
      Return account { id, holderId, balance} for ACCOUNT_ID.
  `,
  help: `
    help: 
      Print this help message.
  `,
  'new-account': `
    new-account holderId=HOLDER_ID
      Create a new account for holder HOLDER_ID, returning ID
      of newly created account.
  `,
  'new-act': `
    new-act id=ACCOUNT_ID amount=AMOUNT date=YYYY-MM-DD memo=MEMO
      Add transaction to account ACCOUNT_ID and return ID of new
      transaction.
  `,
  query: `
    query id=ACCOUNT_ID [date=YYYY-MM-DD] [count=COUNT] [index=INDEX]
            [actId=ACT_ID] [memo=MEMO_SUBSTR]
      Filter transactions for account specified by ACCOUNT_ID
      by optional filter parameters data, actId, memo and
      return at most COUNT (default ${DEFAULT_COUNT}) transactions 
      starting at index INDEX (default 0).
  `,
  statement: `
    statement id=ACCOUNT_ID fromDate=YYYY-MM-DD toDate=YYYYY-MM-DD
      Return transactions for account ACCOUNT_ID between 
      optional fromDate to toDate (inclusive).  Each transaction 
      includes the account balance after that transaction.
  `,

};

function help() {
  console.log(`Allowed commands are`);
  for (const h of (Object.values(CMDS))) { console.log('  ' + h.trim()); }
}

function parseLine(line) {
  line = line.trim();
  const cmd = line.match(/^[\w\-]+/)?.[0];
  if (!cmd) return ['', {}];
  if (!CMDS[cmd]) {
    console.error(`unknown command "${cmd}"`);
    return [ '', {} ];
  }
  line = line.slice(cmd.length);
  const args = {};
  while (line) {
    const m = line.match(/^\s*(\w+)=(?:\"([^\"]+)\"|\'([^\']+)\'|(\S+))\s*/);
    if (!m) {
      errors({errors: [ `invalid command argument at ${line.slice(0, 20)}`, ]});
      return ['', {}];
    }
    args[m[1]] = m[2] ?? m[3] ?? m[4];
    line = line.slice(m[0].length);
  }
  return [cmd, args];
}

function errors(result) {
  for (const err of result.errors) {
    console.error(err.message ?? err.toString());
  }
}

