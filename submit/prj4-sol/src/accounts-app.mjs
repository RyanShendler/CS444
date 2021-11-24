import {
  HTML, //static HTML for overall app

  //functions which help build dynamic HTML
  makeSearchResult, makeAccountDetail, makeScrollElement, makeElement,
  
  IDS, //mapping from application state to HTML section id's.
} from './html-content.mjs';

/** Calling this function creates a custom <accounts-app> web
 *  component based an account-services services, web services
 *  ws and function extendFn.  The last argument is used to
 *  extend this solution for Project 5.  The function should
 *  be set up as the click handler for a extendFn element in
 *  the account-details and should be called with 2 arguments:
 *  the account-id and the HTML id of the extendFn element.    
 */
export default function makeAccountsAppElement(services, ws, extendFn) {

  customElements.define('accounts-app',
			makeAccountsClass(services, ws, extendFn));
  
  
}

/** By defining the component class within a closure we can allow
 *  the code in the class to access the parameters of this function.
 */
function makeAccountsClass(services, ws, extendFn) {

  return class extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({mode: 'open'});
      //must always use this.shadowRoot to add to component
      this.shadowRoot.innerHTML = HTML;
      this.select('search');
      this.setNavHandlers();
      this.setCreateHandler();
      this.setSearchHandler();
    }

    /** Set state of app, where state is one of 'search', 'create' or
     *  'detail'.  Ensure that only the section corresponding to the
     *  selected state is visible by adding the 'invisible' class to
     *  other sections and ensuring that the 'invisible' class is not
     *  present on the selected section.
     */
    select(state) {
      for (const [s, sectionId] of Object.entries(IDS)) {
	const sectionElement = this.shadowRoot.querySelector(`#${sectionId}`);
	if (s === state) {
	  sectionElement.classList.remove('invisible');
	  this.sectionElement = sectionElement;
	}
	else {
	  sectionElement.classList.add('invisible');
	}
      }
    }

    /** Set up click handlers for the create and search navigation links
     *  at the start of each app section which select()'s the clicked
     *  on section.
     */
    setNavHandlers() {
      const create_links = this.shadowRoot.querySelectorAll('.nav-create > a');
      const search_links = this.shadowRoot.querySelectorAll('.nav-search > a');
      create_links.forEach(link => {
      	link.addEventListener("click", (ev) =>{
      		this.select('create'); //using fat arrow functions makes this refer to our returned class
      	});
      });
      search_links.forEach(link => {
      	link.addEventListener("click", (ev) =>{
      		this.select('search');
      	});
      });
    }

    /** Set up a handler for submission of the create-form.  Ensure
     *  that the form is not submitted to the server the form-data is
     *  submitted via the newAccount() web services.  If there are no
     *  errors, the detail section is selected with the details of the
     *  newly created account.
     */
    setCreateHandler() {
      const create_form = this.shadowRoot.querySelector('#create-form');
      create_form.addEventListener("submit", async (ev)=>{
      	//console.log('submitted');
      	const form_data = new FormData(ev.currentTarget);
      	const params = Object.fromEntries(form_data.entries());
      	const response = await services.newAccount(params);
      	const sectionElement = this.shadowRoot.querySelector('#create-section');
      	//console.log(response);
      	if(!reportErrors(response, sectionElement)){
      		this.display(response);
      	}
      	this.select('detail');
      	ev.preventDefault(); //prevent event from being sent to server
      });
    }

    /** Create handler for blur event on search-form input widgets.
     */
    setSearchHandler() {
      const search_inputs = this.querySelectorAll('#search-form input');
      for(const input of search_inputs){
      	input.addEventListener("blur", (ev)=>{
      		console.log(`${ev.currentTarget} blurred`);
      	});
      }
    }

    /** Perform an accounts search.  If url is defined (it would be
     *  a scroll link), then simply perform a get() to that url.  If
     *  url is undefined, then searchAccounts() using the form-data
     *  from search-form.  If there are no errors, add the results
     *  to the results after the search form, including scroll controls
     *  before/after the actual results.  Then set up handlers for
     *  the just added scroll controls and the details link within
     *  each account result in the results.
     */
    async search(url=undefined) {
      //TODO
    }

    async display(url){
    	const response = await ws.get(url);
    	//const sectionElement = this.shadowRoot.querySelector('#create-section');
    	//console.log(response);
    	if(!response.errors){ //may need reportErrors
    		const id = response.result.id;
    		const holderId = response.result.holderId;
    		const balance = response.result.balance;
    		const el = makeAccountDetail(id, holderId, balance); //make detail
    		//need detail click handler
    		const details = this.shadowRoot.querySelector('#detail-section'); //may need to change this
    		details.append(el);
    		const extend = this.shadowRoot.querySelector(`#extend-${id}`);
    		extend.addEventListener('click', (ev) =>{
    			const acc_id = ev.currentTarget.getAttribute('data-id');
    			const dom_id = ev.currentTarget.getAttribute('id');
    			extendFn(acc_id, dom_id);
    		});
    	}
    }

  };  //end of class expression for web component
  
} //end function makeAccountsClass



/** Always clears current error messages in sectionElement.  Then it
 *  report errors for result within sectionElement.  Returns true iff
 *  errors are reported.
 */
function reportErrors(result, sectionElement) {
  clearErrors(sectionElement);
  if (!result?.errors) return false;
  const errors = result.errors;
  const genErrors = sectionElement.querySelector('.errors');
  const errs = (errors instanceof Array) ? errors : [ errors ];
  for (const err of errs) {
    const msg = err.message ?? err.toString();
    const widget = err.options?.widget;
    if (widget) {
      const errElement =
	    sectionElement.querySelector(`[data-widget=${widget}]`);
      if (errElement) {
	errElement.innerHTML = msg;
	continue;
      }
    }
    genErrors.append(makeElement('li', {class: 'error'}, msg));	
  }
  return true;
}

/** Clear all errors in sectionElement */
function clearErrors(sectionElement) {
  const genErrors = sectionElement.querySelector('.errors');
  if (genErrors) genErrors.innerHTML = '';
  sectionElement.querySelectorAll('.error').forEach(e => {
    //clear all error messages in section
    e.innerHTML = '';
  });
}




