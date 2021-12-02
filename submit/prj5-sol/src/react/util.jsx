import React from 'react';

/** Returns rendering of transactions list acts in a table.
 *  If opts.doBalance (default true), then each act in acts
 *  has a act.balance numeric property and is rendered into
 *  a special Balance column in the table.
 *  If opts.doColorAmount, then positive amounts are rendered
 *  with class 'deposit' and negative amounts are rendered without
 *  the - sign with class 'withdrawal'.  Note that the provided
 *  stylesheet in ../html-content.mjs renders the former in green
 *  and the latter in red.
 */
export function renderActsTable(acts, opts={}) {
  const { doColorAmount=true, doBalance=true } = opts;
  const rows = [];
  for (const [i, act] of acts.entries()) {
    const isNeg = act.amount < 0;
    const amountClass = doColorAmount ? (isNeg ? 'withdrawal' : 'deposit') : '';
    const amount = ((doColorAmount & isNeg) ? -1 : +1) * act.amount;
    const balance = act.balance === undefined ? '' : act.balance.toFixed(2);
    const row = (
      <tr key={i}>
        <td>{act.date}</td>
        <td>{act.memo}</td>
        <td className={amountClass}>{amount.toFixed(2)}</td>
        <td>{balance}</td>
      </tr>
    );
    rows.push(row);
  }
  const table = (
    <table className="transactions" key="acts">
      <thead>
        <tr>
          <th>Date</th>
          <th>Memo</th>
          <th>Amount</th>
          { doBalance ? <th>Balance</th> : '' }
        </tr>
      </thead>
      <tbody>
        {rows}
      </tbody>
    </table>
  );
  return table;
}

/** Process response from web services; if response.errors, then
 *  reportErrors() using setters.setFormErrors() and
 *  setters.setWidgetErrors().  If there are no errors, then report
 *  result using setters.setResult() and links using
 *  setters.setLinks().  If parameter isLinkResult is true, then each
 *  individual result is wrapped with a self-link and will need to be
 *  unwrapped.
 */
export function processResponse(response, setters, isLinkResult=false) {
  const {setFormErrors, setLinks, setWidgetErrors, setResult} = setters;
  if (response.errors) {
    reportErrors(response.errors, setters);
  }
  else {
    const { links, result } = response;
    if (setLinks) setLinks(links);
    if (setResult) {
      const unpacked = isLinkResult ? result.map(r => r.result) : result;
      setResult(unpacked);
    }
  }
}

/** Split the list errors into widget-errors and form-errors depending
 *  on whether or not they have `options.widget` defined.  Then if
 *  the callbacks  setFormErrors and/or setWidgetErrors are defined,
 *  call those functions to set the errors in the caller.
 */
export function reportErrors(errors, {setFormErrors, setWidgetErrors}) {
  const [formErrors, widgetErrors] = [ [], {} ];
  for (const err of errors) {
    const message = err.message;
    const widget = err.options?.widget;
    if (widget) {
      widgetErrors[widget] = message;
    }
    else {
      formErrors.push(message);
    }
  }
  if (setFormErrors) setFormErrors(formErrors);
  if (setWidgetErrors) setWidgetErrors(widgetErrors);
}
