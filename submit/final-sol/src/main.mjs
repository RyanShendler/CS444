#!/usr/bin/env node

import makeApp from './app.mjs';

import { cwdPath, readJson } from 'cs544-node-utils';

import http from 'http';
import Path from 'path';

export default async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1 || args.length > 2) usage();
  const port = getPort(args[0]);
  if (port.errors) exitErrors(port);
  try {
    const doLoad = args.length > 1;
    const data = doLoad ? await readJson(args[1]) : {};
    if (data.errors) exitErrors(data.errors);
    const app = makeApp(data);
    http.createServer({}, app)
      .listen(port, function() {
	console.log(`listening on port ${port}`);
      });
  }
  catch (err) {
    console.error(`cannot create server: ${err}`);
    process.exit(1);
  }
}

function usage() {
  const prog = Path.basename(process.argv[1]);
  const msg = `usage: ${prog} PORT [WS_JSON_FILE]`;
  console.error(msg);
  process.exit(1);
}

function getPort(portStr) {
  if (!portStr.match(/^\d+$/) || Number(portStr) < 1024) {
    const msg = `invalid port "${portStr}"; must be integer >= 1024`;
    return { errors: [ { message: msg } ] };
  }
  return Number(portStr);
}

function exitErrors(errRet) {
  for (const err of errRet.errors) {
    console.error(err.message ?? err.toString());
  }
  process.exit(1);
}
