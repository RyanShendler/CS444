import React from 'react';

import { renderActsTable, processResponse } from './util.jsx';

/** Display form containing date and memoText widgets.  When any of
 *  these widgets is blurred, submit the form data to
 *  props.services.query().  If the response contains errors then
 *  display form-errors before the form, widget errors below each
 *  widget.  If the response has empty result, then display `No
 *  errors`, else display the result as a table using
 *  `renderActsTable()` adding scroll links as appropriate before
 *  and after each batch of results.
 */
export default function(props) {
  const [date, setDate] = React.useState(undefined);
  const [memoText, setMemoText] = React.useState(undefined);
  const [submitted, setSubmitted] = React.useState(false);
  const [scrollUrl, setScrollUrl] = React.useState(undefined);
  const [formErrors, setFormErrors] = React.useState([]);
  const [widgetErrors, setWidgetErrors] = React.useState({});
  const [result, setResult] = React.useState([]);
  const [links, setLinks] = React.useState([]);
  const responseHandlers =
    {setFormErrors, setWidgetErrors, setResult, setLinks};
  const onDateChange = ev => setDate(ev.target.value ?? '');
  const onMemoTextChange = ev => setMemoText(ev.target.value ?? '');
  const submit = async ev => {
    ev.preventDefault();
    setSubmitted(true);
    const params = {id: props.accountId, date, memoText};
    const response = await props.services.query(params);
    processResponse(response, responseHandlers, true);
  };
  const scroll = async ev => {
    ev.preventDefault();
    const url = ev.target.href;
    const response = await props.ws.get(url);
    processResponse(response, responseHandlers, true);
  };
  const errors = (
    <ul key="formErrors" className="errors">
      {formErrors.map((msg, i) => <li className="error">{msg}</li>)}
    </ul>
  );
  const form = (
    <form key="form" className="form-grid2" onSubmit={submit}>
      <label htmlFor="date">Date</label>
      <span>
        <input name="date" id="date" type="date"
               onChange={onDateChange} onBlur={submit}/>
        <br/><span className="error">{widgetErrors.date}</span>
      </span>
      <label htmlFor="memoText">Memo Text</label>
      <span>
        <input name="memoText" id="memoText" onChange={onMemoTextChange}
               onBlur={submit}/>
        <br/><span className="error">{widgetErrors.memoText}</span>
      </span>
    </form>
  );
  const renders = [ errors, form ];
  if (result.length === 0) {
    if (submitted) renders.push(<h3 key="head">No Results</h3>);
  }
  else {
    renders.push(<h3 key="head">Matching Transactions</h3>);
    renders.push(<ScrollLinks elementKey='preLinks' links={links} scroll={scroll}/>);
    renders.push(renderActsTable(result, {doBalance: false}));
    renders.push(<ScrollLinks elementKey='postLinks' links={links}
                              scroll={scroll}/>);
  }
  return renders;
}

function ScrollLinks(props) {
  const { elementKey, links, scroll } = props;
  const controls = [];
  for (const [rel, text] of Object.entries({prev: '<<', next: '>>'})) {
    const link = links.find(link => link.rel === rel);
    if (link) {
      const control = (
        <a key={rel} href={link.href} rel={rel} onClick={scroll}>
          {text}
        </a>
      );
      controls.push(control);
    }
  }
  return <div key={elementKey} className="scroll">{controls}</div>;
}
