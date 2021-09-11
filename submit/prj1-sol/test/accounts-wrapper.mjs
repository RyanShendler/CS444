import makeAccounts from '../src/accounts.mjs';

/** this wrapper used by tests to hide last minute changes in API */

/** Wrapper which contains methods for both Accounts and Account. */
class AccountsWrapper {
  constructor() {
    this._accounts = makeAccounts();
  }

  newAccount(params) { return this._accounts.newAccount(params); }

  info(params) { return this._dispatch('info', params); }
  newAct(params) { return this._dispatch('newAct', params); }
  query(params) { return this._dispatch('query', params); }
  statement(params) { return this._dispatch('statement', params); }

  _dispatch(fn, params) {
    const account = this._accounts.account(params);
    return (account.errors) ? account : account[fn].call(account, params);
  }
  
}

export default function accountsWrapper() { return new AccountsWrapper(); }
accountsWrapper.DEFAULT_COUNT = makeAccounts.DEFAULT_COUNT;

