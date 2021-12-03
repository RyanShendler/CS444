import React from 'react';

import { reportErrors } from './util.jsx';

/** Display form containing date, memo and amount widgets along with a
 *  submit button.  When the form is submitted, submit the form data
 *  to props.services.newAccount().  If the response contains errors
 *  then display form-errors before the form, widget errors below each
 *  widget.  If the response does not contain any errors, then update
 *  the *Account Detail* display by calling
 *  `props.updateAccountDetails()` to redisplay the *Account Detail*
 *  with an updated balance.
 */
export default function(props) {
	//state
	const [date, setDate] = React.useState(undefined);
	const [memo, setMemo] = React.useState(undefined);
	const [amount, setAmount] = React.useState(undefined);
	const [formErrors, setFormErrors] = React.useState([]);
	const [widgetErrors, setWidgetErrors] = React.useState({});
	const responseHandlers = {setFormErrors, setWidgetErrors};
	
	//event handlers
	const onDateChange = ev => setDate(ev.target.value ?? '');
	const onMemoChange = ev => setMemo(ev.target.value ?? '');
	const onAmountChange = ev => setAmount(ev.target.value ?? '');
	const submit = async ev => {
		ev.preventDefault();
		const params = {id: props.accountId, date, memo, amount};
		const response = await props.services.newAct(params);
		if(response.errors) reportErrors(response.errors, responseHandlers);
		else props.updateAccountDetails();
	};
	
	//rendering
	const errors = (
		<ul key="formErrors" className="errors">
			{formErrors.map((msg, i) => <li className="error">{msg}</li>)}
		</ul>
	);
	const form = (
		<form key="form" className="form-grid2" onSubmit={submit}>
			<label htmlFor="date">Date</label>
			<span>
				<input name="date" id="date" type="date" onChange={onDateChange}/>
				<br/><span className="error">{widgetErrors.date}</span>
			</span>
			<label htmlFor="memo">Memo</label>
			<span>
				<input name="memo" id="memo" onChange={onMemoChange}/>
				<br/><span className="error">{widgetErrors.memo}</span>
			</span>
			<label htmlFor="amount">Amount</label>
			<span>
				<input name="amount" id="amount" onChange={onAmountChange}/>
				<br/><span className="error">{widgetErrors.amount}</span>
			</span>
			<span></span>
			<button type="submit">Add Transaction</button>
		</form>
	);
	const renders = [errors, form];
  return renders;
}
