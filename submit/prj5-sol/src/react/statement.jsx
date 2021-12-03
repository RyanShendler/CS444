import React from 'react';

import { renderActsTable, processResponse } from './util.jsx';

/** Display form containing fromDate and toDate widgets along with
 *  a submit button.  When the form is submitted, submit data to
 *  props.services.statement().  If the response contains errors
 *  then display form-errors before the form, widget errors below
 *  each widget.  If the response has empty result, then display
 *  `No errors`, else display the result as a table using
 *  `renderActsTable()`.
 */
export default function(props) {
	//state
	const [fromDate, setFromDate] = React.useState(undefined);
	const [toDate, setToDate] = React.useState(undefined);
	const [submitted, setSubmitted] = React.useState(false);
	const [formErrors, setFormErrors] = React.useState([]);
	const [widgetErrors, setWidgetErrors] = React.useState({});
	const [result, setResult] = React.useState([]);
	const responseHandlers = {setFormErrors, setWidgetErrors, setResult};
	
	//event handlers
	const onFromDateChange = ev => setFromDate(ev.target.value ?? '');
	const onToDateChange = ev => setToDate(ev.target.value ?? '');
	const submit = async ev => {
		ev.preventDefault();
		setSubmitted(true);
		const params = {id: props.accountId, fromDate, toDate};
		const response = await props.services.statement(params);
		processResponse(response, responseHandlers, false);
	};
	
	//rendering
	const errors=(
		<ul key="formErrors" className="errors">
			{formErrors.map((msg, i) => <li className="error">{msg}</li>)}
		</ul>
	);
	const form = (
		<form key="form" className="form-grid2" onSubmit={submit}>
			<label htmlFor="fromDate">From Date</label>
			<span>
				<input name="fromDate" id="fromDate" type="date" onChange={onFromDateChange}/>
				<br/><span className="error">{widgetErrors.fromDate}</span>
			</span>
			<label htmlFor="toDate">To Date</label>
			<span>
				<input name="toDate" id="toDate" type="date" onChange={onToDateChange}/>
				<br/><span className="error">{widgetErrors.toDate}</span>
			</span>
			<span></span>
			<button type="submit">Show Statement</button>
		</form>
	);
	const renders = [errors, form];
	if(result.length === 0){
		if(submitted) {renders.push(<h3 key="head">No Results</h3>)};
	}else{
		renders.push(<h3 key="head">Statement from {fromDate} to {toDate}</h3>);
		renders.push(renderActsTable(result, {doBalance: true, doColorAmount: true}));
	}
  return renders;
}
