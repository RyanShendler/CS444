import makeAccountsAppElement from './accounts-app.mjs'; 
import makeWs from './ws.mjs';
import makeServices from './accounts-services.mjs';

const DEFAULT_WS_URL = 'https://zdu.binghamton.edu:2345';


/** Return url set in query param 'ws-url' if present; otherwise
 *  return DEFAULT_WS_URL.
 */
function getWsUrl() {
  const locationUrl = new URL(window.location.href);
  return locationUrl.searchParams.get('ws-url') ?? DEFAULT_WS_URL;
}

function main() {
  const ws = makeWs(getWsUrl());
  const services = makeServices(ws);
  const extendFn = (accountId, elementId) => {
    console.log(`extend account ${accountId} at elementId ${elementId}`);
  };
  makeAccountsAppElement(services, ws, extendFn);
}

main();


