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
      for (const s of [ 'create', 'search' ]) {
	for (const e of this.shadowRoot.querySelectorAll(`.nav-${s}`)) {
	  e.addEventListener('click', () => this.select(s));
	}
      }
    }

    /** Set up a handler for submission of the create-form.  Ensure
     *  that the form is not submitted to the server the form-data is
     *  submitted via the newAccount() web services.  If there are no
     *  errors, the detail section is selected with the details of the
     *  newly created account.
     */
    setCreateHandler() {
      const createForm = this.shadowRoot.querySelector('#create-form');
      createForm.addEventListener('submit', async ev => {
	ev.preventDefault();
	const data = Object.fromEntries(new FormData(createForm));
	const url = await services.newAccount(data);
	if (!reportErrors(url, this.sectionElement)) {
	  await this.accountDetailsByUrl(url);
	}
      });
    }

    /** Create handler for blur event on search-form input widgets.
     */
    setSearchHandler() {
      this.shadowRoot.querySelectorAll('#search-form input')
	.forEach(e => e.addEventListener('blur', () => this.search()));
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
      const accounts = await this.getAccounts(url);
      if (!reportErrors(accounts, this.sectionElement)) {
	const results = this.shadowRoot.querySelector('#search-results');
	this.setResults(accounts, results);
	this.setScrollHandlers(accounts.links, results);
	this.setDetailsHandler(results);
      }
    }

    setScrollHandlers(links, results) {
      for (const rel of ['prev', 'next']) {
	const link = links.find(link => link.rel === rel);
	if (link) {
	  for (const control of results.querySelectorAll(`a[rel=${rel}`)) {
	    control.addEventListener('click', () => this.search(link.href));
	  }
	}
      }
    }

    setDetailsHandler(resultsElement) {
      resultsElement.querySelectorAll('.details').forEach(e => {
	e.addEventListener('click', async ev => {
	  const url = ev.target.getAttribute('data-ws-href');
	  await this.accountDetailsByUrl(url);
	});
      });
    }

    setResults(accounts, resultsElement) {
      resultsElement.innerHTML = '';
      if (accounts.result.length === 0) {
	resultsElement.innerHTML = 'No results';
	return;
      }
      const links = accounts.links;
      resultsElement.append(makeScrollElement(links));
      for (const account of accounts.result) {
	resultsElement.append(this.accountResult(account));
      }
      resultsElement.append(makeScrollElement(links));
    }

    async getAccounts(url) {
      if (url) {
	return await ws.get(url);
      }
      else {
	const searchForm = this.shadowRoot.querySelector('#search-form');
	const data = Object.fromEntries(new FormData(searchForm));
	return await services.searchAccounts(data);
      }
    }

    async accountDetailsByUrl(url) {
      const info = await ws.get(url);
      return this.displayAccountDetailsInfo(info);
    }

    async accountDetailsById(id) {
      const info = await services.info({id});
      return this.displayAccountDetailsInfo(info);
    }

    displayAccountDetailsInfo(info) {
      if (!reportErrors(info, this.sectionElement)) {
	const { id, holderId, balance } = info.result;
	const details = makeAccountDetail(id, holderId, balance);
	const detailElement = this.shadowRoot.querySelector('#account-detail');
	detailElement.innerHTML = '';
	detailElement.append(details);
	const extend = detailElement.querySelector(`[data-id="${id}"]`);
	const extendId = extend.getAttribute('id');
	const updateAccountDetails = this.accountDetailsById.bind(this, id);
	extendFn(id, extend, updateAccountDetails);
	this.select('detail');
      }
    }
    

    accountResult(resultLinks) {
      const { result, links } = resultLinks;
      const self = links.find(link => link.rel === 'self');
      const { id, holderId } = result;
      return makeSearchResult(id, holderId, self.href);
    }

  };  //end of class expression for web component
  
} //end function makeAccountsClass



/** Always clears current error messages in sectionElement.  Then it
 *  reports errors for result within sectionElement.  Returns true iff
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




