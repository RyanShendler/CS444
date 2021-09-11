import { AppErrors } from 'cs544-js-utils';

import { getDate, getPositiveInt, getCents, genId } from './util.mjs';

/**
API to maintain bank accounts.  The API data model includes the
following entities:

  Account Holder: External to this API.  Simply represented by an
  externally generated opaque holderId ID.

  Account: Identified by an ID (generated within this API).  Will
  track its holder using the holderId ID.  It will also contain a
  collection of transactions.

  Transaction: Contains

     { id, amount, date, memo } 

  where id is the transaction ID (generated within this API), amount
  is a Number giving the amount of the transaction (>= 0 for deposits,
  < 0 for withdrawals), date is a YYYY-MM-DD String giving the date
  of the transaction and memo is a String describing the transaction.

  Note that the API uses the word 'act' to refer to a transaction.

Our data model makes the following simplifying assumptions:

  + Each account has only a single holder; i.e. there are no
    "joint accounts."

  + Each account has an infinite overdraft; i.e. the balance can
    be negative without limit.

The params argument to API methods is an object specifying values for
the method parameters.  Note that the value of all parameters must be
String's.

Since most API methods operate on an individual account, the `params`
object usually contains an `id` property identifying the relevant
account.

All API methods return errors by returning an object having an errors
property specifying a list of error objects.  Each error is a object

  { message, options? } 

where message is a String specifying the error message and optional
options is an object.  In particular, options can specify property
'code' which is a String giving an error code.

Less verbosely, errors are returned as an object:

  { errors: [ { message: String, options?: { code?: String, ...} } ] } 

where { } indicates an object, [ ] indicates a list/array and ?
indicates optional.

The API documentation specifies errors by code.
  
*/

const DEFAULT_COUNT = 5;

export default function makeAccounts() {
  return new Accounts();
}
makeAccounts.DEFAULT_COUNT = DEFAULT_COUNT; //for testing


class Accounts {
  constructor() {
    //TODO
  }

  /** Return ID of a newly created account having holder ID set to
   *  params.holderId and zero balance.  When called, params must
   *  specify holderId.
   *  
   *  Error Codes: 
   *    BAD_REQ:     holderId not specified.
   */
  newAccount(params={}) {
    //TODO
    return '';
  }

  /** Return account for params.id.
   *  Error Codes: 
   *    BAD_REQ:     id not specified.
   *    NOT_FOUND:   no account having ID id.
   */
  account(params) {
    //TODO
    return {};
  }

  
}

class Account {
  constructor(holderId) {
    TODO
  }

  /** Return object { id, holderId, balance } where id is account ID,
   *  holderId is ID of holder and balance is a Number giving the
   *  current account balance after the chronologically last
   *  transaction. 
   *
   *  Error Codes: None.
   */
  info(params={}) {
    //TODO
    return {};
  }

  /** Return ID of a newly created transaction.  When called, params must be 
   *  an object containing at least { amount, date, memo } where:
   * 
   *    amount is a string /^\d+\.\d\d$/ representing a number, 
   *    date is a YYYY-MM-DD string representing a valid date
   *    memo is a non-empty string.
   *
   *  representing the properties of the transaction to be created.
   *
   *  Error Codes:
   *    BAD_REQ:     params does not specifytransaction amount, 
   *                 date or memo; or amount, date do not meet 
   *                 restrictions on format.
   */
  newAct(params={}) {
    //TODO
    return '';
  }

  /** Return list of transactions satisfying params for an account.
   *  The returned list is ordered by date in non-decreasing order;
   *  transactions with the same date are ordered in the order they
   *  were added to the account.  When called, params must specify
   *
   * { actId?, fromDate?, toDate?, memoText?, count?, index?, }
   *  
   *  The optional parameters which are used to filter the
   *  returned transactions include:
   *
   *    actId:       The transaction ID (if this is specified at most
   *                 one transaction will be returned).
   *    date:        A valid YYYY-MM-DD date string.  If specified, all 
   *                 returned transactions must have date equal to this value.
   *    memoText:    A substring which must occur within the memo
   *                 field of matching transactions; the matching 
   *                 must be case-insensitive.
   *    count:       A string specifying a non-negative integer giving 
   *                 the maximum number of returned transactions 
   *                 (defaults to DEFAULT_COUNT).
   *    index:       A string specifying a non-negative integer giving the
   *                 starting index of the first returned transaction in the
   *                 ordered list of transactions satisfying the rest
   *                 of the params (defaults to 0).
   *
   *  Each transaction is returned as
   * 
   *  { id, amount, date, memo }
   *
   *    id:      The ID of the transaction.
   *    amount:  A Number giving the amount for the transaction.
   *    date:    The YYYY-MM-DD date of the transaction.
   *    memo:    The memo associated with the transaction.
   *
   *  Error Codes:  
   *    BAD_REQ:     date, count or index are specified but do
   *                 not meet their requirements.
   */
  query(params={}) {
    //TODO
    return [];
  }

  /**
   *  Return list of transactions for this account ordered by date in
   *  non-decreasing order; transactions with the same date are
   *  ordered in the order they were added to the account.  The
   *  transactions can be filtered by the following optional params:
   *
   *    fromDate:    A string specifying a YYYY-MM-DD giving
   *                 the earliest date for the returned transactions.
   *    toDate:      A string specifying a YYYY-MM-DD giving
   *                 the latest date for the returned transactions.
   * 
   *  Each transaction is returned as
   * 
   *  { id, amount, date, memo, balance }
   *
   *    id:      The ID of the transaction.
   *    amount:  A Number giving the amount for the transaction.
   *    date:    The YYYY-MM-DD date of the transaction.
   *    memo:    The memo associated with the transaction.
   *    balance: A Number giving the account balance 
   *             immediately after the transaction.
   *  Error Codes:  
   *    BAD_REQ:     fromDate or toDate are not valid dates.
   */
  statement(params={}) {
    //TODO
    return [];
  }

}

class Transaction {
  //TODO
}


